"""Exit 0 stops the loop (ready OR human intervention); exit 1 requests another iteration."""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def evaluate(root, change, run):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", change):
        return 0, "PARAR: nome de mudanca invalido"
    directory = root / "openspec/changes" / change
    tasks = directory / "tasks.md"
    notes = directory / "loop-notes.md"
    if not tasks.is_file():
        return 0, "PARAR: tasks.md ausente; verificar nome ou arquivamento"
    if notes.is_file() and re.search(r"^BLOQUEIO:", notes.read_text(encoding="utf-8"), re.M):
        return 0, "PARAR: BLOQUEIO exige decisao humana"
    content = tasks.read_text(encoding="utf-8")
    if re.search(r"^- \[ \]", content, re.M):
        return 1, "CONTINUAR: tarefas abertas"
    if not re.search(r"^- \[[xX]\]", content, re.M):
        return 0, "PARAR: checklist vazio ou formato invalido"
    mvn = "mvnw.cmd" if sys.platform == "win32" else "mvnw"
    if run([str(root / mvn), "-B", "-ntp", "verify"]) != 0:
        return 1, "CONTINUAR: verify falhou"
    if run([sys.executable, "scripts/check_traceability.py", "openspec/specs", str(directory / "specs")]) != 0:
        return 1, "CONTINUAR: cenario sem teste"
    return 0, "PRONTO: tarefas, verify e rastreabilidade aprovados; revisar antes de arquivar"


def main(change):
    log = ROOT / ".loop"
    log.mkdir(exist_ok=True)
    def run(args):
        with (log / "verification.log").open("a", encoding="utf-8") as output:
            try:
                return subprocess.run(args, cwd=ROOT, stdout=output, stderr=subprocess.STDOUT, timeout=600).returncode
            except (OSError, subprocess.TimeoutExpired):
                return 1
    code, message = evaluate(ROOT, change, run)
    print(message)
    return code


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1]))
