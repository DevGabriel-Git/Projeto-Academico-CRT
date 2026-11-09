"""Passive ZAP scan against an ephemeral, isolated application; no host ports or real DB."""
import json
import os
from pathlib import Path
import secrets
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def docker(*args, check=True, timeout=180, **options):
    return subprocess.run(["docker", *args], cwd=ROOT, check=check, timeout=timeout,
                          capture_output=True, text=True, **options)


PROBE = """import json,time,urllib.request
deadline=time.monotonic()+120
while True:
    try:
        value=json.load(urllib.request.urlopen('http://corretora-lab:18080/actuator/health',timeout=2))
        assert value['status']=='UP'
        break
    except (OSError,AssertionError):
        if time.monotonic()>deadline: raise RuntimeError('Instancia isolada indisponivel')
        time.sleep(1)
"""


def start_application(runtime, app, network):
    jar = ROOT / "target/CorretoraAcademico-0.0.1-SNAPSHOT.jar"
    environment = os.environ.copy()
    environment["JWT_SECRET"] = secrets.token_urlsafe(48).replace("-", "A").replace("_", "B")
    docker("run", "--detach", "--name", app, "--network", network, "--network-alias", "corretora-lab",
           "--memory", "768m", "--env", "JWT_SECRET", "--env", "BRAPI_TOKEN=laboratorio",
           "--env", "ALPHAVANTAGE_KEY=laboratorio", "--env", "TWELVEDATA_KEY=laboratorio",
           "--volume", str(jar) + ":/app.jar:ro", "--entrypoint", "java", runtime,
           "-Xmx512m", "-jar", "/app.jar", "--spring.profiles.active=dev", "--server.port=18080",
           "--spring.datasource.url=jdbc:h2:mem:dast;DB_CLOSE_DELAY=-1", env=environment)


def wait_for_application(image, network, probe_name):
    docker("run", "--rm", "--name", probe_name, "--network", network,
           "--entrypoint", "python3", image, "-c", PROBE, timeout=150)


def run_baseline(images, network, scanner):
    image, runtime = images["scanner"], images["runtime"]
    reports = ROOT / "reports/dast"
    result = docker("run", "--name", scanner, "--network", network, "--memory", "2g",
                    "--volume", str(reports) + ":/zap/wrk:rw", image, "zap-baseline.py",
                    "-t", "http://corretora-lab:18080/actuator/health", "-m", "1", "-T", "3",
                    "-J", "zap.json", "-r", "zap.html", "-s", check=False, timeout=300)
    (reports / "summary.log").write_text(result.stdout + result.stderr, encoding="utf-8")
    (reports / "execution.json").write_text(json.dumps({"image": image, "runtime": runtime, "exitCode": result.returncode,
        "scope": "unauthenticated health baseline only", "database": "ephemeral H2",
        "network": "internal, no published ports"}, indent=2), encoding="utf-8")
    print("ZAP baseline exit:", result.returncode, "(ver reports/dast; alertas exigem triagem)")
    if result.returncode:
        raise RuntimeError("ZAP nao aprovado; consultar relatorio sem suprimir alertas.")


def main():
    # Resolve pulled images once; the scanner's Java 17 cannot run this Java 21 app.
    image = docker("image", "inspect", "zaproxy/zap-stable", "--format", "{{index .RepoDigests 0}}").stdout.strip()
    runtime = docker("image", "inspect", "eclipse-temurin:21-jre", "--format", "{{index .RepoDigests 0}}").stdout.strip()
    if not image.startswith("zaproxy/zap-stable@sha256:"):
        raise RuntimeError("Prepare a imagem oficial zaproxy/zap-stable antes de executar.")
    suffix = secrets.token_hex(6)
    network, app, scanner, probe_name = ("crt-dast-net-" + suffix, "crt-dast-app-" + suffix,
                                       "crt-dast-zap-" + suffix, "crt-dast-probe-" + suffix)
    reports = ROOT / "reports/dast"
    reports.mkdir(parents=True, exist_ok=True)
    docker("network", "create", "--internal", network)
    try:
        start_application(runtime, app, network)
        wait_for_application(image, network, probe_name)
        run_baseline({"scanner": image, "runtime": runtime}, network, scanner)
    finally:
        docker("rm", "--force", scanner, app, probe_name, check=False)
        docker("network", "rm", network, check=False)


if __name__ == "__main__":
    main()
