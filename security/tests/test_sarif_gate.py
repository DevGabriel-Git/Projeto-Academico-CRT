import datetime
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
spec=importlib.util.spec_from_file_location("sarif_gate",Path(__file__).resolve().parents[1]/"sarif_gate.py")
gate=importlib.util.module_from_spec(spec); spec.loader.exec_module(gate)
class SarifGateTest(unittest.TestCase):
    def setUp(self):
        self.directory=tempfile.TemporaryDirectory(); self.addCleanup(self.directory.cleanup)
        self.report=Path(self.directory.name)/"report.json"; self.baseline=Path(self.directory.name)/"baseline.json"
        self.policy={"version":1,"owner":"test","reviewBy":str(datetime.date.today()+datetime.timedelta(days=1)),"findings":[]}
        self.data={"version":"2.1.0","runs":[{"tool":{"driver":{"name":"CodeQL","rules":[{"id":"sql","properties":{"security-severity":"9.0"}}]}},"results":[],"invocations":[{"executionSuccessful":True}]}]}
    def check(self):
        self.baseline.write_text(json.dumps(self.policy));self.report.write_text(json.dumps(self.data));gate.check(self.report,self.baseline)
    def test_empty_success(self): self.check()
    def test_new_high_fails(self):
        self.data["runs"][0]["results"]=[{"ruleId":"sql","partialFingerprints":{"primaryLocationLineHash":"abc"}}]
        with self.assertRaises(ValueError): self.check()
    def test_expired_baseline_fails(self):
        self.policy["reviewBy"]="2020-01-01"
        with self.assertRaises(ValueError): self.check()
    def test_no_runs_fails(self):
        self.data["runs"]=[]
        with self.assertRaises(ValueError): self.check()
    def test_allowed_finding_still_in_report(self):
        self.policy["findings"]=[{"rule":"sql","fingerprint":"abc"}]
        self.data["runs"][0]["results"]=[{"ruleId":"sql","partialFingerprints":{"primaryLocationLineHash":"abc"}}]
        self.check();self.assertEqual(len(self.data["runs"][0]["results"]),1)
    def test_execution_failure_fails(self):
        self.data["runs"][0]["invocations"]=[{"executionSuccessful":False}]
        with self.assertRaises(ValueError): self.check()
    def test_missing_report_fails(self):
        self.baseline.write_text(json.dumps(self.policy))
        with self.assertRaises(FileNotFoundError): gate.check(self.report,self.baseline)
    def test_incomplete_run_fails(self):
        self.data["runs"]=[{"tool":{"driver":{"name":"CodeQL"}}}]
        with self.assertRaises(ValueError): self.check()
    def test_unknown_rule_fails(self):
        self.data["runs"][0]["results"]=[{"ruleId":"missing","level":"warning"}]
        with self.assertRaises(ValueError): self.check()
if __name__=="__main__": unittest.main()
