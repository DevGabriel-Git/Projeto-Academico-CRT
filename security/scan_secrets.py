"""Scan the full publishable worktree and the actual commit range, always redacting values."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from toolchain import command


def main(base):
    sha = subprocess.check_output(["git", "merge-base", "HEAD", base], cwd=ROOT, text=True).strip()
    reports = ROOT / "reports"
    reports.mkdir(exist_ok=True)
    scanner = command("gitleaks")
    common = ["--config", str(ROOT / "security-policy/gitleaks.toml"), "--redact", "--report-format", "json"]
    subprocess.run(scanner + ["git", ".", "--log-opts=" + sha + "..HEAD", *common,
                               "--report-path", str(reports / "secrets-commits.json")], cwd=ROOT, check=True)
    files = subprocess.check_output(["git", "ls-files", "-co", "--exclude-standard", "-z"], cwd=ROOT).split(b"\0")
    with tempfile.TemporaryDirectory(prefix="secrets-", dir=ROOT / ".tools") as temporary:
        for name in set(files):
            if not name:
                continue
            relative = Path(os.fsdecode(name))
            source = ROOT / relative
            if source.is_symlink():
                raise RuntimeError("Link simbolico exige revisao")
            if source.is_file():
                target = Path(temporary) / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(source, target)
        subprocess.run(scanner + ["dir", temporary, *common, "--report-path", str(reports / "secrets-worktree.json")],
                       cwd=ROOT, check=True)


if __name__ == "__main__":
    main(sys.argv[1])
