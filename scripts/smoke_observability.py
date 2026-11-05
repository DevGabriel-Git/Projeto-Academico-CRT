"""Local-only load and OTLP smoke check using an ephemeral H2 database and random credentials."""
from collections import Counter
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import threading
import time
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / ".tools/python"))
from opentelemetry.proto.collector.trace.v1.trace_service_pb2 import ExportTraceServiceRequest


def main():
    names = Counter()
    class Receiver(BaseHTTPRequestHandler):
        def do_POST(self):
            message = ExportTraceServiceRequest()
            message.ParseFromString(self.rfile.read(int(self.headers["Content-Length"])))
            for resource in message.resource_spans:
                for scope in resource.scope_spans:
                    for span in scope.spans:
                        names[span.name] += 1
            self.send_response(200)
            self.send_header("Content-Type", "application/x-protobuf")
            self.end_headers()
        def log_message(self, *args):
            pass
    receiver = ThreadingHTTPServer(("127.0.0.1", 0), Receiver)
    thread = threading.Thread(target=receiver.serve_forever, daemon=True)
    thread.start()
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    reports = ROOT / "reports/observability"
    reports.mkdir(parents=True, exist_ok=True)
    environment = os.environ.copy()
    environment.update(JWT_SECRET=secrets.token_urlsafe(48).replace("-", "A").replace("_", "B"),
                       BRAPI_TOKEN="laboratorio", ALPHAVANTAGE_KEY="laboratorio", TWELVEDATA_KEY="laboratorio",
                       OTLP_TRACES_URL=f"http://127.0.0.1:{receiver.server_port}/v1/traces")
    temporary = ROOT / ".tools/tmp"
    temporary.mkdir(exist_ok=True)
    args = ["java", "-Xmx512m", "-Djava.io.tmpdir=" + str(temporary), "-Djdk.net.unixdomain.tmpdir=" + str(temporary), "-jar", "target/CorretoraAcademico-0.0.1-SNAPSHOT.jar",
            "--spring.profiles.active=dev,observability", f"--server.port={port}", "--server.address=127.0.0.1",
            "--spring.datasource.url=jdbc:h2:mem:observability-smoke;DB_CLOSE_DELAY=-1"]
    with (reports / "application.log").open("w", encoding="utf-8") as log:
        application = subprocess.Popen(args, cwd=ROOT, env=environment, stdout=log, stderr=subprocess.STDOUT,
                                       creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
        try:
            base = f"http://127.0.0.1:{port}"
            deadline = time.monotonic() + 90
            while True:
                try:
                    urllib.request.urlopen(base + "/actuator/health", timeout=2).close()
                    break
                except OSError:
                    if application.poll() is not None or time.monotonic() > deadline:
                        raise RuntimeError("Aplicacao de laboratorio nao iniciou; consulte reports/observability")
                    time.sleep(0.5)
            registration = {"nome": "Laboratorio", "email": "load-test@example.invalid",
                            "cpf": "12345678901", "senha": secrets.token_urlsafe(24)}
            request = urllib.request.Request(base + "/auth/register", data=json.dumps(registration).encode(),
                                             headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(request, timeout=10) as response:
                token = json.load(response)["token"]
            load_environment = environment | {"BASE_URL": base, "TOKEN": token}
            executable = next((ROOT / ".tools/k6").rglob("k6.exe"), None) if os.name == "nt" else "k6"
            if not executable:
                raise RuntimeError("k6 local ausente")
            subprocess.run([str(executable), "run", "--summary-export=" + str(reports / "k6.json"),
                            "performance/carteira.js"], cwd=ROOT, env=load_environment, check=True, timeout=90)
            deadline = time.monotonic() + 15
            while time.monotonic() < deadline and not any("query" in name for name in names):
                time.sleep(0.5)
            if not any("query" in name for name in names):
                raise RuntimeError("Nenhum span JDBC chegou ao receptor OTLP")
            if not any("http" in name.lower() or "get" in name.lower() for name in names):
                raise RuntimeError("Nenhum span HTTP chegou ao receptor OTLP")
            (reports / "telemetry.json").write_text(json.dumps({"spanNames": names, "received": sum(names.values())}, indent=2), encoding="utf-8")
            print("Carga aprovada; spans HTTP e JDBC recebidos via OTLP. Sem atributos pessoais no relatorio.")
        finally:
            application.terminate()
            try:
                application.wait(timeout=10)
            except subprocess.TimeoutExpired:
                application.kill()
                application.wait()
            receiver.shutdown()
            receiver.server_close()


if __name__ == "__main__":
    main()
