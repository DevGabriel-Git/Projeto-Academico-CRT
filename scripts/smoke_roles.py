"""Exercise real bootstrap and HTTP login with random credentials and an ephemeral H2 DB."""
from contextlib import contextmanager
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]


def request_at(base):
    def request(path, payload=None, token=None):
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = "Bearer " + token
        call = Request(base + path, data=json.dumps(payload).encode() if payload else None, headers=headers)
        try:
            with urlopen(call, timeout=5) as response:
                body = response.read().decode()
                return response.status, json.loads(body) if body.startswith("{") else body
        except HTTPError as error:
            return error.code, None
    return request


def settings():
    environment = os.environ.copy()
    environment.update(ADMIN_NAME="Laboratorio", ADMIN_EMAIL="bootstrap-smoke@example.invalid",
                       ADMIN_CPF="10000000009", ADMIN_PASSWORD=secrets.token_urlsafe(24),
                       JWT_SECRET=secrets.token_urlsafe(48).replace("-", "A").replace("_", "B"),
                       BRAPI_TOKEN="laboratorio", ALPHAVANTAGE_KEY="laboratorio", TWELVEDATA_KEY="laboratorio")
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    temporary = ROOT / ".tools/tmp"
    temporary.mkdir(parents=True, exist_ok=True)
    args = ["java", "-Xmx512m", "-Djava.io.tmpdir=" + str(temporary), "-Djdk.net.unixdomain.tmpdir=" + str(temporary),
            "-jar", "target/CorretoraAcademico-0.0.1-SNAPSHOT.jar", "--spring.profiles.active=dev,bootstrap-admin",
            "--server.address=127.0.0.1", f"--server.port={port}",
            "--spring.datasource.url=jdbc:h2:mem:roles-smoke;DB_CLOSE_DELAY=-1"]
    return environment, args, f"http://127.0.0.1:{port}"


@contextmanager
def laboratory():
    environment, args, base = settings()
    reports = ROOT / "reports/roles"
    reports.mkdir(parents=True, exist_ok=True)
    with (reports / "application.log").open("w", encoding="utf-8") as log:
        application = subprocess.Popen(args, cwd=ROOT, env=environment, stdout=log, stderr=subprocess.STDOUT,
                                       creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0)
        try:
            yield request_at(base), environment
        finally:
            application.terminate()
            try:
                application.wait(timeout=10)
            except subprocess.TimeoutExpired:
                application.kill()
                application.wait()


def wait_for_admin(request, environment):
    deadline = time.monotonic() + 90
    while time.monotonic() < deadline:
        try:
            status, response = request("/auth/login", {"login": environment["ADMIN_EMAIL"], "senha": environment["ADMIN_PASSWORD"]})
            if status == 200:
                assert response["perfil"] == "ADMIN"
                return response["token"]
        except (URLError, TimeoutError):
            pass  # The isolated server is still starting; the deadline is the failure boundary.
        time.sleep(0.5)
    raise RuntimeError("Bootstrap/login nao ficou pronto; consulte o log local, sem publicar credenciais.")


def verify_roles(request, admin_token):
    status, user = request("/auth/register", {"nome": "Titular", "email": "user-smoke@example.invalid",
        "cpf": "10000000008", "senha": secrets.token_urlsafe(24), "perfil": "ADMIN"})
    assert status == 200 and user["perfil"] == "USER"
    assert request("/admin/usuarios")[0] == 401
    user_admin_status = request("/admin/usuarios", token=user["token"])[0]
    assert user_admin_status == 403, f"USER admin: esperado403, obtido{user_admin_status}"
    status, page = request("/admin/usuarios", token=admin_token)
    assert status == 200 and page["totalElements"] == 2
    assert all(set(item) == {"id", "nome", "email", "perfil"} for item in page["items"])
    assert request("/auth/me")[0] == 401
    assert request("/auth/me", token=user["token"])[1]["perfil"] == "USER"
    assert request("/actuator/prometheus", token=user["token"])[0] == 403
    assert request("/actuator/prometheus", token=admin_token)[0] == 200


def main():
    with laboratory() as (request, environment):
        admin_token = wait_for_admin(request, environment)
        verify_roles(request, admin_token)
    (ROOT / "reports/roles/result.json").write_text(json.dumps({"status": "passed",
        "database": "ephemeral H2", "bind": "loopback", "credentials": "random, not persisted",
        "checks": ["real bootstrap profile", "admin login", "registration cannot elevate",
                   "admin 401/403/200", "minimal DTO", "own session", "admin-only metrics"]}, indent=2), encoding="utf-8")
    print("Bootstrap e perfis HTTP aprovados em H2 efemero; credenciais nao persistidas.")


if __name__ == "__main__":
    main()
