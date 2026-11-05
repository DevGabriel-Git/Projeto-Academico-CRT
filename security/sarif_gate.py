"""Gate SARIF fail-closed com exceções específicas e temporárias."""
import datetime as dt
import json
import sys
from pathlib import Path


def check(report, baseline):
    policy = json.loads(Path(baseline).read_text(encoding="utf-8"))
    if policy["version"] != 1 or not policy["owner"]:
        raise ValueError("Baseline inválida")
    if dt.date.fromisoformat(policy["reviewBy"]) < dt.date.today():
        raise ValueError("Baseline vencida")
    allowed = {(e["rule"], e["fingerprint"]) for e in policy["findings"]}
    data = json.loads(Path(report).read_text(encoding="utf-8"))
    if data["version"] != "2.1.0" or not data["runs"]:
        raise ValueError("SARIF sem execução válida")
    failures = []
    for run in data["runs"]:
        driver = run["tool"]["driver"]
        rules = {r["id"]: r for r in driver.get("rules", [])}
        for extension in run["tool"].get("extensions", []):
            rules.update({r["id"]: r for r in extension.get("rules", [])})
        for invocation in run.get("invocations", []):
            if invocation.get("executionSuccessful") is False:
                raise ValueError("Execução CodeQL falhou")
        for result in run.get("results", []):
            rule = result["ruleId"]
            severity = rules.get(rule, {}).get("properties", {}).get("security-severity")
            if severity is None:
                if result.get("level", "warning") == "error":
                    failures.append(rule + ": erro sem severidade")
                continue
            fingerprints = result.get("partialFingerprints", {})
            fingerprint = fingerprints.get("primaryLocationLineHash")
            if float(severity) >= 7 and (rule, fingerprint) not in allowed:
                failures.append(f"{rule}: {severity}: {result.get('locations', [])}")
    if failures:
        raise ValueError("\n".join(failures))


if __name__ == "__main__":
    try:
        check(*sys.argv[1:])
    except (OSError, ValueError, KeyError, TypeError) as error:
        raise SystemExit(f"SARIF REPROVADO: {error}")
    print("SARIF aprovado")
