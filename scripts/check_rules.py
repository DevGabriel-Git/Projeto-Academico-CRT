"""Exercise positive/negative rule cases and treat scan matches as a failing gate."""
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from toolchain import command


def main():
    omp = command("omp")
    cases = [
        ("no-system-out", "System.out.println(value);", "src/main/java/com/crt/service/Demo.java", True),
        ("no-system-out", "logger.info(event);", "src/main/java/com/crt/service/Demo.java", False),
        ("dip-constructor-injection", "@Autowired private Repository repository;", "src/main/java/com/crt/service/Demo.java", True),
        ("dip-constructor-injection", "private final Repository repository;", "src/main/java/com/crt/service/Demo.java", False),
        ("dip-no-new-collaborator", "new CotacaoService();", "src/main/java/com/crt/service/Demo.java", True),
        ("dip-no-new-collaborator", "new HttpClient();", "src/main/java/com/crt/config/Demo.java", False),
        ("no-secrets-in-output", "password=${DB_PASSWORD}", "src/main/resources/application.properties", False),
        ("no-secrets-in-output", "password=\nspring.datasource.driver-class-name=org.h2.Driver", "src/main/resources/application.properties", False),
        ("no-weakened-tests", "@Disabled", "src/test/java/com/crt/DemoTest.java", True),
        ("no-weakened-tests", "assertThat(result).isEqualTo(10);", "src/test/java/com/crt/DemoTest.java", False),
    ]
    for rule, snippet, path, expected in cases:
        result = subprocess.run(omp + ["ttsr", "test", "--rule", ".agents/rules/" + rule + ".md",
                                "--source", "tool", "--path", path, "--json", snippet],
                                cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8")
        data = json.loads(result.stdout)
        if bool(data["triggered"]) != expected:
            raise RuntimeError("Resultado inesperado para rule " + rule)
    result = subprocess.run(omp + ["ttsr", "scan", "src/main", "--json"],
                            cwd=ROOT, check=True, capture_output=True, text=True, encoding="utf-8")
    data = json.loads(result.stdout)
    if data["summary"]["totalMatches"]:
        raise RuntimeError("TTSR encontrou ocorrencias no codigo de producao")
    print(f"TTSR: {len(cases)} casos aprovados; producao sem ocorrencias")


if __name__ == "__main__":
    main()
