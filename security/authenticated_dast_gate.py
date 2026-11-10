"""Fail closed on incomplete authenticated API DAST evidence; never accept a health-only scan."""
from datetime import datetime, timezone

REQUIRED_CHECKS = (
    "admin_login", "user_a_login", "user_b_login", "anonymous_401", "forged_jwt_401",
    "user_admin_403", "admin_users_200", "user_metrics_403", "admin_metrics_200",
    "registration_cannot_elevate", "nonempty_user_a", "nonempty_user_b",
    "cross_wallet_404", "cross_history_404", "admin_private_404", "cross_broker_404",
    "cross_stock_404", "cross_delete_404", "cross_operation_404", "operation_rollback",
    "own_history_200", "no_private_fields", "error_without_internals",
)


def reviewed_information(alert, triage):
    if alert.get("risk") != 0:
        return False
    for entry in triage:
        if (entry.get("ruleId"), entry.get("route"), entry.get("risk")) != (
                alert.get("ruleId"), alert.get("route"), 0):
            continue
        try:
            expires = datetime.strptime(entry.get("until", ""), "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return False
        return (expires >= datetime.now(timezone.utc).date()
                and isinstance(entry.get("owner"), str) and bool(entry["owner"].strip())
                and isinstance(entry.get("reason"), str) and len(entry["reason"].strip()) >= 40)
    return False


def validate(report, triage=()):
    if (report.get("scope") != "authenticated-api-lab" or report.get("isolated") is not True
            or report.get("cleanupComplete") is not True):
        raise ValueError("DAST requer laboratorio isolado e escopo autenticado.")
    checks = report.get("authorizationChecks", {})
    if any(checks.get(name) is not True for name in REQUIRED_CHECKS):
        raise ValueError("Verificacao de autorizacao ausente ou reprovada.")
    scans = report.get("activeScans", [])
    if len(scans) != 2 or {scan.get("identity") for scan in scans} != {"USER_A", "USER_B"}:
        raise ValueError("DAST requer duas identidades distintas.")
    for scan in scans:
        if scan.get("state") != "FINISHED" or scan.get("progress") != 100:
            raise ValueError("Varredura ativa nao foi concluida.")
        if not all(type(scan.get(field)) is int and scan[field] > 0
                   for field in ("requests", "authenticatedMessages")):
            raise ValueError("Varredura vazia ou sem evidencia de autenticacao.")
    if type(report.get("passiveQueue")) is not int or report["passiveQueue"] != 0:
        raise ValueError("Fila de analise passiva nao foi concluida.")
    alerts = report.get("alerts")
    if not isinstance(alerts, list) or any(type(alert.get("risk")) is not int for alert in alerts):
        raise ValueError("Relatorio de alertas ausente ou invalido.")
    if any(not reviewed_information(alert, triage) for alert in alerts):
        raise ValueError("Alerta exige correcao ou triagem informativa especifica, valida e nao expirada.")
    return len(alerts)
