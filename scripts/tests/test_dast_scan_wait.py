import importlib.util
from pathlib import Path
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

dependencies = {
    "zapv2": SimpleNamespace(ZAPv2=object),
    "dast_authorization_probe": SimpleNamespace(
        PROXY="", TARGET="", Probe=object, authorize=object, wait_for_services=object
    ),
}
spec = importlib.util.spec_from_file_location(
    "dast_zap_probe", Path(__file__).resolve().parents[1] / "dast_zap_probe.py"
)
probe = importlib.util.module_from_spec(spec)
with patch.dict(sys.modules, dependencies):
    spec.loader.exec_module(probe)


class ScanStates:
    def __init__(self, states):
        self.states = iter(states)
        self.stop = Mock()

    @property
    def scans(self):
        return next(self.states)


class DastScanWaitTest(unittest.TestCase):
    def test_eventually_visible_scan_and_numeric_id_are_supported(self):
        finished = {"id": 0, "state": "FINISHED", "progress": "100"}
        zap = SimpleNamespace(ascan=ScanStates([[], [finished]]))
        with patch.object(probe.time, "sleep"):
            self.assertEqual(probe.wait_for_scan(zap, "0"), finished)

    def test_progress_alone_does_not_mean_finished(self):
        running = {"id": "0", "state": "RUNNING", "progress": "100"}
        finished = running | {"state": "FINISHED"}
        zap = SimpleNamespace(ascan=ScanStates([[running], [finished]]))
        with patch.object(probe.time, "sleep") as sleep:
            self.assertEqual(probe.wait_for_scan(zap, "0"), finished)
            sleep.assert_called_once_with(1)

    def test_stopped_scan_is_rejected(self):
        zap = SimpleNamespace(ascan=ScanStates([[{"id": "0", "state": "STOPPED"}]]))
        with self.assertRaises(probe.ScanFailure) as raised:
            probe.wait_for_scan(zap, "0")
        self.assertEqual(raised.exception.reason, "interrompida")

    def test_deadline_stops_scan_and_rejects_incomplete_result(self):
        zap = SimpleNamespace(ascan=ScanStates([]))
        with patch.object(probe.time, "monotonic", side_effect=[0, 181]):
            with self.assertRaises(probe.ScanFailure) as raised:
                probe.wait_for_scan(zap, "0")
        self.assertEqual(raised.exception.reason, "incompleto_por_timeout")
        zap.ascan.stop.assert_called_once_with("0")

    def test_missing_scan_identifier_is_rejected_immediately(self):
        zap = SimpleNamespace(ascan=SimpleNamespace(scan=Mock(return_value=None)))
        with patch.object(probe, "TARGET", "http://corretora-lab:18080"):
            with self.assertRaises(probe.ScanFailure) as raised:
                probe.scan_target(zap, "http://corretora-lab:18080/carteira/1003", "1")
        self.assertEqual(raised.exception.reason, "identificador_de_varredura_invalido")

    def test_both_zap_risk_representations_are_supported_without_raw_evidence(self):
        alert = {"pluginId": "10000", "alert": "Example rule", "url": "http://corretora-lab:18080/carteira/1003",
                 "requestHeader": "NEVER_EXPORT_AUTHORIZATION", "evidence": "NEVER_EXPORT_BODY"}
        with patch.object(probe, "TARGET", "http://corretora-lab:18080"):
            for representation in ({"riskcode": "1"}, {"risk": "Low"}):
                summary = probe.summarize_alert(alert | representation)
                self.assertEqual(summary["risk"], 1)
                self.assertEqual(set(summary), {"ruleId", "risk", "name", "route"})

    def test_unknown_risk_or_foreign_alert_fails_closed(self):
        with patch.object(probe, "TARGET", "http://corretora-lab:18080"):
            with self.assertRaises(probe.ScanFailure):
                probe.summarize_alert({"risk": "Unknown"})
            with self.assertRaises(probe.ScanFailure):
                probe.summarize_alert({"risk": "Low", "url": "http://another-service/carteira"})


if __name__ == "__main__":
    unittest.main()
