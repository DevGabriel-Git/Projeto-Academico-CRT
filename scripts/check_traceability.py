"""Valida rastreabilidade explícita entre cenários e métodos de teste reais."""
import json
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def executed_cases(root):
    passed, rejected = set(), set()
    for folder in ("surefire-reports", "failsafe-reports"):
        for report in (root / "target" / folder).glob("TEST-*.xml"):
            try:
                cases = ET.parse(report).getroot().iter("testcase")
                for case in cases:
                    key = (case.get("classname"), case.get("name"))
                    if any(case.find(status) is not None for status in ("failure", "error", "skipped")):
                        rejected.add(key)
                    else:
                        passed.add(key)
            except ET.ParseError:
                raise ValueError("Relatorio Maven invalido; execute verify novamente") from None
    return passed - rejected


def reference_case(root, reference):
    filename, method = reference.split("#")
    source = root / filename
    text = source.read_text(encoding="utf-8")
    if not re.search(r"@Test\s+(?:public\s+)?void\s+" + re.escape(method) + r"\s*\(", text):
        raise ValueError(f"Metodo de teste ausente: {reference}")
    classname = ".".join(source.relative_to(root / "src/test/java").with_suffix("").parts)
    return classname, method


def verify(root, folders=None):
    mapping = json.loads((root / "specs/traceability.json").read_text(encoding="utf-8"))
    folders = folders or [root / "openspec/specs"]
    scenarios = set()
    for folder in folders:
        if not folder.is_dir():
            raise ValueError(f"Pasta de specs ausente: {folder}")
        for spec in folder.rglob("spec.md"):
            scenarios.update(re.findall(r"#### Scenario: (.+)", spec.read_text(encoding="utf-8")))
    if not scenarios or not scenarios.issubset(mapping):
        raise ValueError("Cenários e mapa de rastreabilidade divergem")
    passed = executed_cases(root)
    for scenario, reference in mapping.items():
        if reference_case(root, reference) not in passed:
            raise ValueError(f"Teste sem execucao Maven aprovada: {scenario}: {reference}")
    return len(scenarios)


def main():
    count = verify(ROOT, [ROOT / path for path in sys.argv[1:]])
    print(f"Rastreabilidade: {count}/{count} cenarios com metodo e execucao Maven aprovada")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError) as error:
        raise SystemExit(str(error)) from None
