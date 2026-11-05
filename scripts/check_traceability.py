"""Valida rastreabilidade explícita entre cenários e métodos de teste reais."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    mapping = json.loads((ROOT / "specs/traceability.json").read_text(encoding="utf-8"))
    scenarios = set(re.findall(r"#### Scenario: (.+)", (ROOT / "openspec/specs/carteira/spec.md").read_text(encoding="utf-8")))
    if scenarios != set(mapping):
        raise SystemExit("Cenários e mapa de rastreabilidade divergem")
    for scenario, reference in mapping.items():
        filename, method = reference.split("#")
        text = (ROOT / filename).read_text(encoding="utf-8")
        if not re.search(r"@Test\s+(?:public\s+)?void\s+" + re.escape(method) + r"\s*\(", text):
            raise SystemExit(f"Teste ausente: {scenario}: {reference}")
    print(f"Rastreabilidade: {len(scenarios)}/{len(scenarios)} cenários com teste (execução comprovada pelo Maven)")


if __name__ == "__main__":
    main()
