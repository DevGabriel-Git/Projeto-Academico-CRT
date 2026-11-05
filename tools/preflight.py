"""Preflight integral; nenhuma aprovação é emitida antes do último gate."""
import json
import os
from pathlib import Path
import re
import shutil
import shlex
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
os.chdir(ROOT)


def run(args, cwd=ROOT, capture=False):
    # shell=False: referências, nomes de arquivo e caminhos nunca viram código shell.
    return subprocess.run([str(a) for a in args], cwd=cwd, check=True,
                          stdout=subprocess.PIPE if capture else None,
                          encoding="utf-8", errors="replace").stdout


def tool(name):
    local = ROOT / ".tools" / "gitleaks" / ("gitleaks.exe" if os.name == "nt" else "gitleaks")
    path = str(local) if name == "gitleaks" and local.is_file() else shutil.which(name)
    if not path:
        raise RuntimeError(f"Ferramenta obrigatória ausente: {name}")
    return path


def setup():
    for name in ("git", "java", "node", "npm", "gitleaks", "codeql"):
        tool(name)
    if "8.30.1" not in run([tool("gitleaks"), "version"], capture=True):
        raise RuntimeError("Instale Gitleaks 8.30.1, versão usada na aula")
    if not run([tool("node"), "--version"], capture=True).startswith("v24."):
        raise RuntimeError("Node 24 LTS obrigatório")
    if sys.version_info[:2] != (3, 11):
        raise RuntimeError("Python 3.11 obrigatório")
    # O bundle e os packs precisam existir; ausência não é aprovada silenciosamente.
    packs = run([tool("codeql"), "resolve", "qlpacks", "--format=json"], capture=True)
    for pack in ("codeql/java-queries", "codeql/javascript-queries"):
        if pack not in packs:
            raise RuntimeError(f"Query pack ausente: {pack}")
    print("Ferramentas presentes; versões adicionais no security/README.md")


def publishable():
    output = subprocess.check_output([tool("git"), "ls-files", "-co", "--exclude-standard", "-z"])
    return sorted(set(Path(os.fsdecode(x)) for x in output.split(b"\0") if x))


def main(base):
    setup()
    sha = run([tool("git"), "merge-base", "HEAD", base], capture=True).strip()
    head = run([tool("git"), "rev-parse", "HEAD"], capture=True).strip()
    run([tool("git"), "diff", "--check", sha])
    tracked = run([tool("git"), "ls-files"], capture=True).splitlines()
    for filename in tracked:
        name = Path(filename).name
        if (name == ".env" or name.startswith(".env.")) and name != ".env.example":
            raise RuntimeError("Arquivo de ambiente real rastreado")
    for relative in publishable():
        if relative.name != ".env.example":
            continue
        filename = ROOT / relative
        for line in filename.read_text(encoding="utf-8").splitlines():
            if not line or line.startswith("#") or "=" not in line:
                continue
            value = line.split("=", 1)[1]
            if not (re.fullmatch(r"<[^>]+>", value) or value.startswith("jdbc:postgresql://localhost:")):
                raise RuntimeError("Template de ambiente precisa conter apenas placeholders")
    reports = ROOT / "reports"
    reports.mkdir(exist_ok=True)
    run([tool("gitleaks"), "git", ".", "--config", "security-policy/gitleaks.toml",
         "--log-opts=" + sha + "..HEAD", "--redact"])
    with tempfile.TemporaryDirectory(prefix="corretora-preflight-") as temporary:
        snapshot = Path(temporary) / "source"
        snapshot.mkdir()
        for relative in publishable():
            source = ROOT / relative
            if source.is_symlink():
                raise RuntimeError("Link simbólico publicável exige revisão")
            if source.is_file():
                target = snapshot / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
        run([tool("gitleaks"), "dir", snapshot, "--config", ROOT / "security-policy/gitleaks.toml", "--redact"])
        mvn = ROOT / ("mvnw.cmd" if os.name == "nt" else "mvnw")
        # Executar ambos os módulos é um superset seguro da seleção por diff.
        run([mvn, "-B", "-ntp", "clean", "verify"])
        run([sys.executable, "scripts/check_traceability.py"])
        run([sys.executable, "scripts/check_diff_coverage.py", base])
        run([tool("npx"), "--yes", "@fission-ai/openspec@1.13.2", "validate", "--all", "--strict"])
        frontend = ROOT / "corretora-frontend"
        npm = tool("npm")
        run([npm, "ci", "--no-fund", "--no-audit"], cwd=frontend)
        run([npm, "test", "--", "--watch=false"], cwd=frontend)
        run([npm, "run", "build"], cwd=frontend)
        # Runtime high/critical, build critical. npm audit retorna 1 para achados;
        # outros códigos e JSON sem metadados são falha de infraestrutura.
        for extra, blocked in ((["--omit=dev"], {"high", "critical"}), ([], {"critical"})):
            result = subprocess.run([npm, "audit", "--json", *extra], cwd=frontend, capture_output=True, text=True)
            data = json.loads(result.stdout)
            if result.returncode not in (0, 1) or "metadata" not in data or "error" in data:
                raise RuntimeError("npm audit não concluiu")
            (reports / ("npm-runtime.json" if extra else "npm-all.json")).write_text(result.stdout, encoding="utf-8")
            if any(item["severity"] in blocked for item in data.get("vulnerabilities", {}).values()):
                raise RuntimeError("SCA frontend reprovado; consulte reports")
        if not os.environ.get("NVD_API_KEY"):
            raise RuntimeError("NVD_API_KEY obrigatória para SCA backend")
        run([mvn, "-B", "-ntp", "-Psecurity", "org.owasp:dependency-check-maven:check"])
        for language, pack in (("java", "java"), ("javascript-typescript", "javascript")):
            database = Path(temporary) / pack
            args = [tool("codeql"), "database", "create", database, "--language=" + language,
                    "--source-root=" + str(ROOT), "--codescanning-config=security-policy/codeql-config.yml"]
            if pack == "java":
                build = [str(mvn), "-B", "-ntp", "-DskipTests", "clean", "package"]
                args.append("--command=" + (subprocess.list2cmdline(build) if os.name == "nt" else shlex.join(build)))
            run(args)
            report = reports / (pack + ".sarif")
            run([tool("codeql"), "database", "analyze", database,
                 f"codeql/{pack}-queries:codeql-suites/{pack}-security-extended.qls",
                 f"codeql/{pack}-queries:codeql-suites/{pack}-security-and-quality.qls",
                 "--format=sarif-latest", "--output=" + str(report)])
            run([sys.executable, "security/sarif_gate.py", report, "security-policy/codeql-baseline.json"])
    print(f"EVIDÊNCIA: base={sha} head={head} gates=ci,sca,secrets,sast resultado=APROVADO")


if __name__ == "__main__":
    try:
        if len(sys.argv) == 2 and sys.argv[1] == "--check-tools":
            setup()
        elif len(sys.argv) == 2 and not sys.argv[1].startswith("-"):
            main(sys.argv[1])
        else:
            raise RuntimeError("Uso: python tools/preflight.py <base-ref>")
    except (OSError, RuntimeError, ValueError, KeyError, subprocess.CalledProcessError) as error:
        raise SystemExit(f"PREFLIGHT REPROVADO: {error}")
