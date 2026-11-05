"""Reject the whole analysis if any SARIF is absent, invalid or rejected."""
import sys
from pathlib import Path
from sarif_gate import check
ROOT=Path(__file__).resolve().parents[1]

def main(directory):
    reports=sorted(Path(directory).rglob("*.sarif"))
    if not reports: raise ValueError("Nenhum relatorio SARIF produzido")
    for report in reports: check(report,ROOT/"security-policy/codeql-baseline.json")
    print(f"SARIF: {len(reports)} relatorio(s) aprovado(s)")
if __name__=="__main__":
    try: main(sys.argv[1])
    except (OSError,ValueError,KeyError,TypeError,IndexError) as error: raise SystemExit(str(error))
