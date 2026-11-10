"""Runs inside the isolated ZAP container; no real accounts or persisted tokens."""
import json
import os
import time

import requests

TARGET = "http://corretora-lab:18080"
PROXY = "http://127.0.0.1:18081"


class CheckFailure(RuntimeError):
    def __init__(self, check_name, actual):
        super().__init__("Verificacao de laboratorio reprovada.")
        self.check_name = check_name
        self.http_status = actual if type(actual) is int and 100 <= actual <= 599 else None


class Probe:
    def __init__(self):
        self.session = requests.Session()
        self.session.trust_env = False
        self.session.proxies = {"http": PROXY}
        self.checks = {}

    def call(self, path, token=None, **options):
        if not path.startswith("/") or path.startswith("//"):
            raise ValueError("Rota fora do laboratorio.")
        headers = {"Authorization": "Bearer " + token} if token else {}
        response = self.session.request(options.pop("method", "GET"), TARGET + path,
                                        headers=headers, timeout=10, allow_redirects=False, **options)
        try:
            body = response.json()
        except ValueError:
            body = None
        return response.status_code, body

    def expect(self, name, actual, expected):
        self.checks[name] = actual == expected
        if not self.checks[name]:
            raise CheckFailure(name, actual)


def wait_for_services(zap):
    direct = requests.Session()
    direct.trust_env = False
    deadline = time.monotonic() + 180
    while time.monotonic() < deadline:
        try:
            health = direct.get(TARGET + "/actuator/health", timeout=3).json()
            payload = {"login": "lab100@example.invalid", "senha": os.environ["LAB_PASSWORD"]}
            ready = direct.post(TARGET + "/auth/login", json=payload, timeout=3)
            if health.get("status") == "UP" and ready.status_code == 200 and zap.core.version:
                return
        except (requests.RequestException, ValueError):
            pass  # The explicit deadline bounds startup; incomplete startup cannot pass.
        time.sleep(1)
    raise RuntimeError("Laboratorio/ZAP nao iniciou no prazo.")


def logins(probe):
    tokens = {}
    for label, number, role in (("USER_A", 100, "USER"), ("USER_B", 200, "USER"), ("ADMIN", 300, "ADMIN")):
        payload = {"login": f"lab{number}@example.invalid", "senha": os.environ["LAB_PASSWORD"]}
        status, body = probe.call("/auth/login", method="POST", json=payload)
        probe.expect(label.lower() + "_login", (status, (body or {}).get("perfil")), (200, role))
        tokens[label] = body["token"]
    return tokens


def role_checks(probe, tokens):
    probe.expect("anonymous_401", probe.call("/carteira")[0], 401)
    token = tokens["USER_A"]
    parts = token.split(".")
    parts[2] = ("B" if parts[2][0] == "A" else "A") + parts[2][1:]
    probe.expect("forged_jwt_401", probe.call("/carteira", ".".join(parts))[0], 401)
    probe.expect("user_admin_403", probe.call("/admin/usuarios", token)[0], 403)
    probe.expect("admin_users_200", probe.call("/admin/usuarios", tokens["ADMIN"])[0], 200)
    probe.expect("user_metrics_403", probe.call("/actuator/prometheus", token)[0], 403)
    probe.expect("admin_metrics_200", probe.call("/actuator/prometheus", tokens["ADMIN"])[0], 200)
    payload = {"nome": "Tentativa laboratorio", "email": "escalation@example.invalid",
               "cpf": "10000000008", "senha": os.environ["LAB_PASSWORD"], "perfil": "ADMIN"}
    status, body = probe.call("/auth/register", method="POST", json=payload)
    probe.expect("registration_cannot_elevate", (status, (body or {}).get("perfil")), (200, "USER"))


def positions(probe, tokens):
    holdings = {}
    for label in ("USER_A", "USER_B"):
        status, body = probe.call("/carteira", tokens[label])
        probe.expect("nonempty_" + label.lower(), status == 200 and isinstance(body, list) and len(body) > 0, True)
        holdings[label] = body[0]
    return holdings


def ownership_checks(probe, tokens, holdings):
    alice, bob = tokens["USER_A"], tokens["USER_B"]
    own, foreign = holdings["USER_A"], holdings["USER_B"]
    probe.expect("cross_wallet_404", (probe.call(f"/carteira/{foreign['id']}", alice)[0],
                                     probe.call(f"/carteira/{own['id']}", bob)[0]), (404, 404))
    probe.expect("cross_history_404", (probe.call(f"/carteira/{foreign['id']}/historico", alice)[0],
                                      probe.call(f"/carteira/{own['id']}/historico", bob)[0]), (404, 404))
    probe.expect("admin_private_404", (probe.call(f"/carteira/{own['id']}", tokens["ADMIN"])[0],
                                      probe.call("/carteira", tokens["ADMIN"])[1]), (404, []))
    broker_path = f"/corretoras/{foreign['corretora']['id']}"
    probe.expect("cross_broker_404", probe.call(broker_path, alice)[0], 404)
    probe.expect("cross_stock_404", probe.call(f"/acoes/{foreign['acao']['id']}", alice)[0], 404)
    probe.expect("cross_delete_404", (probe.call(broker_path, alice, method="DELETE")[0],
                                     probe.call(broker_path, bob)[0]), (404, 200))


def operation_checks(probe, tokens, holdings):
    alice, bob = tokens["USER_A"], tokens["USER_B"]
    own, foreign = holdings["USER_A"], holdings["USER_B"]
    payload = {"corretoraId": foreign["corretora"]["id"], "acaoId": foreign["acao"]["id"],
               "tipo": "COMPRA", "quantidade": 1, "precoUnitario": 30}
    status = probe.call("/carteira/operar", alice, method="POST", json=payload)[0]
    probe.expect("cross_operation_404", (status, probe.call(f"/carteira/{foreign['id']}", bob)[1]["quantidade"]),
                 (404, foreign["quantidade"]))
    history = probe.call(f"/carteira/{own['id']}/historico", alice)
    probe.expect("own_history_200", history[0] == 200 and len(history[1]) > 0, True)
    payload.update(corretoraId=own["corretora"]["id"], acaoId=own["acao"]["id"], tipo="VENDA", quantidade=99999)
    sale = probe.call("/carteira/operar", alice, method="POST", json=payload)[0]
    payload.update(tipo="COMPRA", quantidade=-1)
    invalid = probe.call("/carteira/operar", alice, method="POST", json=payload)[0]
    after = probe.call(f"/carteira/{own['id']}", alice)[1]
    history_after = probe.call(f"/carteira/{own['id']}/historico", alice)[1]
    probe.expect("operation_rollback", (sale, invalid, after["quantidade"], len(history_after)),
                 (400, 400, own["quantidade"], len(history[1])))


def disclosure_checks(probe, tokens, holdings):
    serialized = json.dumps(holdings).lower()
    private_keys = ('"cpf"', '"senha"', '"password"', '"token"')
    probe.expect("no_private_fields", not any(key in serialized for key in private_keys), True)
    status, error = probe.call("/carteira/not-a-number", tokens["USER_A"])
    serialized = json.dumps(error).lower()
    internals = ("org.hibernate", "exception", "stack_trace", "jdbc:", '"senha"', '"cpf"')
    probe.expect("error_without_internals", status == 400 and not any(key in serialized for key in internals), True)


def authorize(probe):
    tokens = logins(probe)
    role_checks(probe, tokens)
    holdings = positions(probe, tokens)
    ownership_checks(probe, tokens, holdings)
    operation_checks(probe, tokens, holdings)
    disclosure_checks(probe, tokens, holdings)
    return tokens, holdings
