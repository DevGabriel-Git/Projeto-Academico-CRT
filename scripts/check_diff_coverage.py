"""80% das linhas executáveis alteradas, incluindo fontes Java novas não ignoradas."""
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT, encoding="utf-8")


def main(base):
    merge_base = git("merge-base", "HEAD", base).strip()
    diff = git("diff", "--no-ext-diff", "--unified=0", merge_base, "--", "src/main/java")
    changed = {}
    filename = None
    for line in diff.splitlines():
        if line.startswith("+++ b/"):
            filename = line[6:]
            changed.setdefault(filename, set())
        elif line.startswith("@@") and filename:
            match = re.search(r"\+(\d+)(?:,(\d+))?", line)
            start = int(match[1])
            count = int(match[2] or 1)
            changed[filename].update(range(start, start + count))
    for filename in git("ls-files", "--others", "--exclude-standard", "--", "src/main/java").splitlines():
        if filename.endswith(".java"):
            changed[filename] = set(range(1, len((ROOT / filename).read_text(encoding="utf-8").splitlines()) + 1))
    report = ET.parse(ROOT / "target/site/jacoco/jacoco.xml").getroot()
    covered = total = 0
    for package in report.findall("package"):
        for source in package.findall("sourcefile"):
            path = "src/main/java/" + package.get("name") + "/" + source.get("name")
            for line in source.findall("line"):
                if int(line.get("nr")) in changed.get(path, set()):
                    total += 1
                    covered += int(line.get("ci")) > 0
    ratio = covered / total if total else 1
    print(f"Diff coverage: {covered}/{total} linhas ({ratio:.2%}) base={merge_base}")
    if ratio < 0.80:
        raise SystemExit("Cobertura das linhas alteradas abaixo de 80%")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/check_diff_coverage.py <base-ref>")
    main(sys.argv[1])
