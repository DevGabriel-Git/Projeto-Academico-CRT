"""Authenticated ZAP + authorization checks in an isolated fixture; no real database or accounts."""
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import tempfile

from smoke_dast import docker

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "security"))
from authenticated_dast_gate import validate


def locked_images():
    images = json.loads((ROOT / "security-policy/dast-images.json").read_text(encoding="utf-8"))
    sources = {"scanner": "zaproxy/zap-stable", "runtime": "eclipse-temurin"}
    if set(images) != set(sources):
        raise ValueError("Lock de imagens DAST incompleto.")
    for name, source in sources.items():
        if not re.fullmatch(re.escape(source) + r"@sha256:[a-f0-9]{64}", images[name]):
            raise ValueError("Imagem DAST fora da origem oficial ou sem digest fixado.")
    return images


def prepare_images():
    for reference in locked_images().values():
        docker("pull", reference, timeout=300)


def require_image(reference):
    digests = json.loads(docker("image", "inspect", reference, "--format", "{{json .RepoDigests}}").stdout)
    if reference not in digests:
        raise RuntimeError("Prepare as imagens fixadas antes da varredura.")
    return reference


def fixture_jar(directory):
    fixture = directory / "fixture.jar"
    subprocess.run(["jar", "--create", "--file", str(fixture), "-C", str(ROOT / "target/test-classes"),
                    "lab/crt/dast/DastFixture.class"], cwd=ROOT, check=True, capture_output=True)
    return fixture


def start_application(resources, fixture, environment):
    jar = ROOT / "target/CorretoraAcademico-0.0.1-SNAPSHOT.jar"
    docker("run", "--detach", "--name", resources["app"], "--network", resources["network"],
           "--network-alias", "corretora-lab", "--memory", "768m", "--env", "JWT_SECRET",
           "--env", "LAB_PASSWORD", "--env", "BRAPI_TOKEN=laboratorio",
           "--env", "TWELVEDATA_KEY=laboratorio", "--env", "ALPHAVANTAGE_KEY=laboratorio",
           "--volume", str(jar) + ":/app.jar:ro", "--volume", str(fixture) + ":/fixture.jar:ro",
           "--entrypoint", "java", resources["runtime"], "-Xmx512m",
           "-Dloader.path=/fixture.jar", "-Dloader.main=lab.crt.dast.DastFixture", "-cp", "/app.jar",
           "org.springframework.boot.loader.launch.PropertiesLauncher", "--spring.profiles.active=dev",
           "--server.port=18080", "--spring.datasource.url=jdbc:h2:mem:crt-dast;DB_CLOSE_DELAY=-1",
           env=environment)


def start_scanner(resources, environment):
    docker("run", "--detach", "--name", resources["scanner"], "--network", resources["network"],
           "--memory", "2g", "--env", "LAB_PASSWORD", "--volume", str(ROOT / "scripts") + ":/lab:ro",
           "--entrypoint", "/zap/zap.sh", resources["zap"], "-daemon", "-host", "127.0.0.1",
           "-port", "18081", "-config", "api.disablekey=true", "-config", "connection.timeoutInSecs=5",
           env=environment)


def assert_isolation(resources):
    internal = json.loads(docker("network", "inspect", resources["network"]).stdout)[0]["Internal"]
    app = json.loads(docker("inspect", resources["app"]).stdout)[0]
    scanner = json.loads(docker("inspect", resources["scanner"]).stdout)[0]
    if not internal or app["HostConfig"]["PortBindings"] or scanner["HostConfig"]["PortBindings"]:
        raise RuntimeError("Laboratorio deve usar rede interna sem portas publicadas.")


def execute_probe(resources):
    result = docker("exec", resources["scanner"], "python3", "/lab/dast_zap_probe.py",
                    check=False, timeout=1500)
    lines = [line for line in result.stdout.splitlines() if line.startswith("{")]
    report = json.loads(lines[-1]) if lines else {"status": "failed", "errorType": "NoProbeReport"}
    if result.returncode:
        raise RuntimeError("Probe DAST reprovado: " + str(report.get("errorType", "Unknown"))
                           + "; check=" + str(report.get("check"))
                           + "; http=" + str(report.get("httpStatus"))
                           + "; reason=" + str(report.get("reason")))
    return report


def cleanup(resources):
    for name in (resources["scanner"], resources["app"]):
        state = docker("container", "inspect", name, "--format", "{{.Id}}", check=False)
        if state.returncode == 0:
            docker("rm", "--force", name)
        elif "No such object" not in state.stderr and "No such container" not in state.stderr:
            raise RuntimeError("Estado do container temporario indisponivel; limpeza nao confirmada.")
    network = docker("network", "rm", resources["network"], check=False)
    if network.returncode and "No such network" not in network.stderr:
        raise RuntimeError("Limpeza do laboratorio incompleta; verificar somente seus recursos temporarios.")


def laboratory(resources, fixture, report):
    environment = os.environ.copy()
    environment.update(JWT_SECRET=base64.b64encode(secrets.token_bytes(32)).decode(),
                       LAB_PASSWORD=secrets.token_urlsafe(32))
    docker("network", "create", "--internal", resources["network"])
    try:
        start_application(resources, fixture, environment)
        start_scanner(resources, environment)
        assert_isolation(resources)
        report["isolated"] = True
        print("Laboratorio isolado iniciado; aguardando autorizacao e varreduras autenticadas.", flush=True)
        report.update(execute_probe(resources))
        report.update(runtimeImage=resources["runtime"],
                      scannerImage=resources["zap"], database="ephemeral H2", publishedPorts=False)
    finally:
        cleanup(resources)
        report["cleanupComplete"] = True


def write_report(report):
    result = ROOT / "reports/authenticated-dast/result.json"
    result.parent.mkdir(parents=True, exist_ok=True)
    temporary = result.with_suffix(".tmp")
    temporary.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    temporary.replace(result)


def run_laboratory(resources, report):
    parent = ROOT / ".tools"
    parent.mkdir(parents=True, exist_ok=True)
    if not parent.resolve().is_relative_to(ROOT.resolve()):
        raise RuntimeError("Pasta temporaria fora do projeto.")
    with tempfile.TemporaryDirectory(prefix="auth-dast-", dir=parent) as temporary:
        laboratory(resources, fixture_jar(Path(temporary)), report)


def review_evidence(report):
    policy = ROOT / "security-policy/dast-triage.json"
    content = policy.read_bytes()
    triage = json.loads(content.decode("utf-8"))
    if not isinstance(triage, list):
        raise ValueError("Triagem DAST invalida.")
    report["triagedInformationalAlerts"] = validate(report, triage)
    report["triagePolicySha256"] = hashlib.sha256(content).hexdigest()


def main():
    suffix = secrets.token_hex(6)
    report = {"runId": suffix, "status": "running", "scope": "authenticated-api-lab",
              "isolated": False, "cleanupComplete": False}
    write_report(report)
    try:
        images = locked_images()
        resources = {"network": "crt-auth-dast-net-" + suffix, "app": "crt-auth-dast-app-" + suffix,
                     "scanner": "crt-auth-dast-zap-" + suffix, "zap": require_image(images["scanner"]),
                     "runtime": require_image(images["runtime"])}
        run_laboratory(resources, report)
        review_evidence(report)
    except Exception as error:
        report.update(status="failed", errorType=type(error).__name__)
        write_report(report)
        raise RuntimeError("DAST reprovado; consulte a evidencia sanitizada desta execucao.") from None
    report["status"] = "passed_with_informational_triage" if report["triagedInformationalAlerts"] else "passed"
    write_report(report)
    print("DAST autenticado aprovado; relatorio sem credenciais em reports/authenticated-dast.")


if __name__ == "__main__":
    if sys.argv[1:] == ["--prepare-images"]:
        prepare_images()
    elif not sys.argv[1:]:
        main()
    else:
        raise SystemExit("Uso: python scripts/smoke_authenticated_dast.py [--prepare-images]")
