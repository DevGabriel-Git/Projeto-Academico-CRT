"""Bounded, authenticated GET scans; only allowlisted routes of the isolated fixture."""
import json
import time
from urllib.parse import urlsplit

from zapv2 import ZAPv2
from dast_authorization_probe import PROXY, TARGET, Probe, authorize, wait_for_services

RULES = ("6", "40003", "40012", "40018")  # Traversal, CRLF, reflected XSS and SQL injection.
POLICY = "crt-authenticated-get"
SCOPE = r"^http://corretora-lab:18080/(carteira|corretoras|acoes)(/.*)?(\?.*)?$"


class ScanFailure(RuntimeError):
    def __init__(self, reason):
        super().__init__("DAST incompleto; nenhuma aprovacao emitida.")
        self.reason = reason


def configure(zap):
    context = zap.context.new_context("crt-authenticated")
    zap.context.include_in_context("crt-authenticated", SCOPE)
    zap.ascan.add_scan_policy(POLICY, alertthreshold="MEDIUM", attackstrength="LOW")
    zap.ascan.disable_all_scanners(scanpolicyname=POLICY)
    zap.ascan.enable_scanners(",".join(RULES), scanpolicyname=POLICY)
    available = {rule["id"] for rule in zap.ascan.scanners(scanpolicyname=POLICY)}
    if not set(RULES).issubset(available):
        raise RuntimeError("Regra ativa obrigatoria indisponivel.")
    zap.ascan.set_option_thread_per_host(2)
    zap.ascan.set_option_target_params_injectable(17)  # Query parameters (1) and URL path (16).
    zap.ascan.set_option_add_query_param(True)
    return context


def replace_identity(zap, token):
    zap.replacer.add_rule("crt-auth", True, "REQ_HEADER", False, "Authorization",
                          replacement="Bearer " + token, url=SCOPE, method="GET")


def wait_for_scan(zap, scan_id):
    deadline = time.monotonic() + 180
    while time.monotonic() < deadline:
        state = next((scan for scan in zap.ascan.scans if str(scan["id"]) == str(scan_id)), None)
        if state is None:
            time.sleep(1)
            continue
        if state["state"] == "FINISHED" and int(state["progress"]) == 100:
            return state
        if state["state"] in ("STOPPED", "FAILED"):
            raise ScanFailure("interrompida")
        time.sleep(1)
    zap.ascan.stop(scan_id)
    raise ScanFailure("incompleto_por_timeout")


def scan_target(zap, target, context):
    if not target.startswith(TARGET + "/"):
        raise ValueError("Alvo fora do laboratorio.")
    scan_id = zap.ascan.scan(target, recurse=False, inscopeonly=True,
                             scanpolicyname=POLICY, method="GET", contextid=context)
    if not isinstance(scan_id, (str, int)) or not str(scan_id).isdigit():
        raise ScanFailure("identificador_de_varredura_invalido")
    wait_for_scan(zap, scan_id)
    ids = zap.ascan.messages_ids(scan_id)
    if not ids:
        raise RuntimeError("Varredura nao enviou requisicoes.")
    return ids


def authenticated_messages(zap, ids, token):
    successful = 0
    for start in range(0, len(ids), 100):
        for message in zap.core.messages_by_id(",".join(ids[start:start + 100])):
            authorized = "authorization: bearer " + token.lower() in message["requestHeader"].lower()
            status = message["responseHeader"].split(" ")[1]
            successful += int(authorized and status.startswith("2"))
    return successful


def scan_identity(zap, identity, context):
    label, token, holding = identity
    replace_identity(zap, token)
    paths = (f"/carteira/{holding['id']}", f"/carteira/{holding['id']}/historico",
             f"/acoes/ticker/{holding['acao']['ticker']}")
    ids = []
    probe = Probe()
    try:
        for path in paths:
            probe.expect("active_target_200", probe.call(path, token)[0], 200)
            ids.extend(scan_target(zap, TARGET + path, context))
        successful = authenticated_messages(zap, ids, token)
    finally:
        zap.replacer.remove_rule("crt-auth")
    return {"identity": label, "state": "FINISHED", "progress": 100,
            "requests": len(ids), "authenticatedMessages": successful, "routes": list(paths)}


def passive_alerts(zap):
    deadline = time.monotonic() + 90
    while int(zap.pscan.records_to_scan) > 0:
        if time.monotonic() > deadline:
            raise RuntimeError("Analise passiva nao terminou.")
        time.sleep(1)
    alerts = zap.core.alerts(baseurl=TARGET, start=0, count=5000)
    if len(alerts) >= 5000:
        raise RuntimeError("Limite de alertas atingido; relatorio potencialmente incompleto.")
    return [summarize_alert(alert) for alert in alerts]


def summarize_alert(alert):
    risk = alert.get("riskcode")
    if risk is None:
        risk = {"Informational": 0, "Low": 1, "Medium": 2, "High": 3}.get(alert.get("risk"))
    if risk is None or str(risk) not in ("0", "1", "2", "3"):
        raise ScanFailure("gravidade_de_alerta_desconhecida")
    location = urlsplit(alert["url"])
    if location.netloc != urlsplit(TARGET).netloc:
        raise ScanFailure("alerta_fora_do_laboratorio")
    return {"ruleId": str(alert["pluginId"]), "risk": int(risk),
            "name": alert.get("name") or alert["alert"], "route": location.path}


def report_failure(error, stage):
    fields = ("riskcode", "risk", "requestHeader", "responseHeader", "scan", "id", "url", "pluginId")
    missing = error.args[0] if isinstance(error, KeyError) and error.args and error.args[0] in fields else None
    print(json.dumps({"status": "failed", "errorType": type(error).__name__, "stage": stage,
                      "check": getattr(error, "check_name", None), "missingField": missing,
                      "httpStatus": getattr(error, "http_status", None),
                      "reason": error.reason if isinstance(error, ScanFailure) else None}))


def main():
    zap = ZAPv2(proxies={"http": PROXY, "https": PROXY})
    stage = "startup"
    try:
        wait_for_services(zap)
        stage = "authorization"
        probe = Probe()
        tokens, holdings = authorize(probe)
        context = configure(zap)
        scans = []
        for label in ("USER_A", "USER_B"):
            stage = "active_" + label
            scans.append(scan_identity(zap, (label, tokens[label], holdings[label]), context))
        stage = "passive"
        report = {"scope": "authenticated-api-lab", "authorizationChecks": probe.checks,
                  "activeScans": scans, "activeRules": list(RULES), "passiveQueue": 0,
                  "alerts": passive_alerts(zap), "zapVersion": zap.core.version}
        print(json.dumps(report))
        return 0
    except Exception as error:
        report_failure(error, stage)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
