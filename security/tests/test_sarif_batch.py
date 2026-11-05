import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]


class SarifBatchTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name)

    def report(self, filename, finding=False):
        run = {"tool": {"driver": {"name": "CodeQL", "rules": [
            {"id": "sql", "properties": {"security-severity": "9"}}]}},
            "invocations": [{"executionSuccessful": True}], "results": []}
        if finding:
            run["results"].append({"ruleId": "sql", "partialFingerprints": {"primaryLocationLineHash": "new"}})
        (self.path / filename).write_text(json.dumps({"version": "2.1.0", "runs": [run]}))

    def execute(self):
        return subprocess.run([sys.executable, "security/check_sarif_reports.py", str(self.path)],
                               cwd=ROOT, capture_output=True).returncode

    def test_missing_reports_fail(self):
        self.assertNotEqual(self.execute(), 0)

    def test_second_report_rejection_fails_whole_job(self):
        self.report("a.sarif")
        self.report("b.sarif", finding=True)
        self.assertNotEqual(self.execute(), 0)

    def test_all_valid_reports_pass(self):
        self.report("a.sarif")
        self.report("b.sarif")
        self.assertEqual(self.execute(), 0)
