"""Audita lockfile: high/critical runtime, critical build; sem exceções implícitas."""
import json
import shutil
import subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

def main():
    npm=shutil.which("npm")
    if not npm: raise SystemExit("npm ausente")
    reports=ROOT/"reports"; reports.mkdir(exist_ok=True)
    for extra,blocked in ((["--omit=dev"],{"high","critical"}),([],{"critical"})):
        result=subprocess.run([npm,"audit","--json",*extra],cwd=ROOT/"corretora-frontend",capture_output=True,text=True)
        data=json.loads(result.stdout)
        if result.returncode not in (0,1) or "metadata" not in data or "error" in data:
            raise SystemExit("npm audit não concluiu")
        (reports/("npm-runtime.json" if extra else "npm-all.json")).write_text(result.stdout,encoding="utf-8")
        if any(v["severity"] in blocked for v in data.get("vulnerabilities",{}).values()):
            raise SystemExit("SCA frontend reprovado; ver reports/npm-*.json")
    print("SCA frontend aprovado")
if __name__=="__main__": main()
