import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    "authenticated_dast_gate", Path(__file__).resolve().parents[1] / "authenticated_dast_gate.py"
)
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


class AuthenticatedDastGateTest(unittest.TestCase):
    def report(self):
        return {
            "scope": "authenticated-api-lab",
            "isolated": True,
            "cleanupComplete": True,
            "authorizationChecks": {name: True for name in gate.REQUIRED_CHECKS},
            "activeScans": [
                {"identity": user, "state": "FINISHED", "progress": 100,
                 "authenticatedMessages": 5, "requests": 25}
                for user in ("USER_A", "USER_B")
            ],
            "passiveQueue": 0,
            "alerts": [],
        }

    def test_complete_authenticated_run_passes(self):
        gate.validate(self.report())

    def test_empty_or_unauthenticated_run_fails(self):
        for field, value in (("scope", "health-only"), ("isolated", False),
                             ("activeScans", []), ("passiveQueue", 1), ("cleanupComplete", False)):
            with self.subTest(field=field), self.assertRaises(ValueError):
                gate.validate(self.report() | {field: value})

    def test_missing_failed_or_untyped_check_fails(self):
        for value in (False, "passed", None):
            report = self.report()
            report["authorizationChecks"][gate.REQUIRED_CHECKS[0]] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                gate.validate(report)

    def test_stopped_empty_wrong_identity_or_partial_scan_fails(self):
        for field, value in (("state", "STOPPED"), ("progress", 99), ("requests", 0),
                             ("authenticatedMessages", 0), ("identity", "ANONYMOUS")):
            report = self.report()
            report["activeScans"][0][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                gate.validate(report)

    def test_any_untriaged_alert_fails(self):
        for risk in (0, 1, 2, 3):
            with self.subTest(risk=risk), self.assertRaises(ValueError):
                gate.validate(self.report() | {"alerts": [{"risk": risk, "ruleId": "123"}]})

    def test_duplicate_identity_or_missing_checks_fails(self):
        report = self.report()
        report["activeScans"][1]["identity"] = "USER_A"
        with self.assertRaises(ValueError):
            gate.validate(report)

    def test_incomplete_or_untyped_evidence_is_rejected(self):
        for field, value in (("alerts", None), ("passiveQueue", False),
                             ("alerts", [{"risk": "low"}]), ("alerts", [{}])):
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                gate.validate(self.report() | {field: value})
        report = self.report()
        report["activeScans"][0]["requests"] = True
        with self.assertRaises(ValueError):
            gate.validate(report)

    def informational_triage(self):
        return {"ruleId": "10112", "route": "/auth/login", "risk": 0, "owner": "maintainer",
                "until": "2999-01-01", "reason": "Expected session discovery for the authenticated login in the isolated laboratory."}

    def test_only_exact_reviewed_information_is_accepted(self):
        alert = {"ruleId": "10112", "route": "/auth/login", "risk": 0}
        report = self.report() | {"alerts": [alert]}
        self.assertEqual(gate.validate(report, [self.informational_triage()]), 1)
        for change in ({"route": "/auth/register"}, {"ruleId": "999"}, {"risk": 1}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                gate.validate(self.report() | {"alerts": [alert | change]}, [self.informational_triage()])

    def test_expired_or_undocumented_triage_is_rejected(self):
        report = self.report() | {"alerts": [{"ruleId": "10112", "route": "/auth/login", "risk": 0}]}
        for change in ({"until": "2000-01-01"}, {"until": "invalid"}, {"owner": ""}, {"reason": ""}):
            with self.subTest(change=change), self.assertRaises(ValueError):
                gate.validate(report, [self.informational_triage() | change])
        report = self.report()
        report["authorizationChecks"].pop(gate.REQUIRED_CHECKS[0])
        with self.assertRaises(ValueError):
            gate.validate(report)


if __name__ == "__main__":
    unittest.main()
