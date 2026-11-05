"""Analyze both application languages and reject missing/invalid output."""
import os
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from toolchain import command, query_paths, VERSIONS


def main():
    short_temp=ROOT / ".tools/tmp"
    short_temp.mkdir(exist_ok=True)
    os.environ["TEMP"]=str(short_temp)
    os.environ["TMP"]=str(short_temp)
    os.environ["JAVA_TOOL_OPTIONS"]=os.environ.get("JAVA_TOOL_OPTIONS", "") + " -Djava.io.tmpdir=" + str(short_temp) + " -Djdk.net.unixdomain.tmpdir=" + str(short_temp)
    codeql = command("codeql")
    search = "--common-caches=" + str(ROOT / ".tools/codeql-cache")
    reports = ROOT / "reports/codeql"
    reports.mkdir(parents=True, exist_ok=True)
    mvn = ROOT / ("mvnw.cmd" if os.name == "nt" else "mvnw")
    # Query selection is explicit below. Extraction only needs the versioned path policy;
    # this avoids CLI shorthand resolution differing from the CodeQL Action.
    import yaml
    policy=yaml.safe_load((ROOT / "security-policy/codeql-config.yml").read_text(encoding="utf-8"))
    extraction=dict(policy)
    extraction.pop("queries",None)
    config=ROOT / ".tools/codeql-extraction.yml"
    config.write_text(yaml.safe_dump(extraction),encoding="utf-8")
    with tempfile.TemporaryDirectory(prefix="codeql-", dir=ROOT / ".tools", ignore_cleanup_errors=True) as temporary:
        for language, pack in (("java", "java"), ("javascript-typescript", "javascript")):
            database = Path(temporary) / pack
            args = codeql + ["database", "create", str(database), "--language=" + language,
                             "--source-root=" + str(ROOT), "--threads=1", "--ram=4096",
                             "--codescanning-config=" + str(config), search]
            if pack == "java":
                build = [str(mvn), "-B", "-ntp", "-DskipTests", "clean", "package"]
                args.append("--command=" + (subprocess.list2cmdline(build) if os.name == "nt" else shlex.join(build)))
            subprocess.run(args, cwd=ROOT, check=True)
            version = VERSIONS["queryPacks"]["codeql/" + pack + "-queries"]
            pack_root = ROOT / ".tools/codeql-cache/packages/codeql" / (pack + "-queries") / version
            subprocess.run(codeql + ["database", "analyze", str(database),
                           f"codeql/{pack}-queries@{version}:codeql-suites/{pack}-security-extended.qls",
                           f"codeql/{pack}-queries@{version}:codeql-suites/{pack}-security-and-quality.qls",
                           search, "--format=sarif-latest", "--threads=1", "--ram=4096",
                           "--output=" + str(reports / (pack + ".sarif"))], cwd=ROOT, check=True)
    subprocess.run([sys.executable, "security/check_sarif_reports.py", reports], cwd=ROOT, check=True)


if __name__ == "__main__":
    main()
