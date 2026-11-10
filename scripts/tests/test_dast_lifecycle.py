import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location(
    "authenticated_dast_lifecycle", Path(__file__).resolve().parents[1] / "smoke_authenticated_dast.py"
)
runner = importlib.util.module_from_spec(spec)
with patch.dict(sys.modules, {"smoke_dast": SimpleNamespace(docker=Mock())}):
    spec.loader.exec_module(runner)


class DastLifecycleTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / "security-policy").mkdir()
        (self.root / "security-policy/dast-triage.json").write_text("[]", encoding="utf-8")
        self.result = self.root / "reports/authenticated-dast/result.json"
        patches = (
            patch.object(runner, "ROOT", self.root),
            patch.object(runner, "locked_images", return_value={"scanner": "fake-scanner", "runtime": "fake-runtime"}),
            patch.object(runner, "require_image", side_effect=lambda reference: reference),
            patch.object(runner, "fixture_jar", return_value=self.root / "fixture.jar"),
            patch.object(runner, "validate", return_value=0),
            patch("sys.stdout", new_callable=io.StringIO),
        )
        for context in patches:
            context.start()
            self.addCleanup(context.stop)

    def test_clean_checkout_without_tools_directory_can_run(self):
        def completed(*arguments):
            arguments[-1].update(isolated=True, cleanupComplete=True, alerts=[])

        with patch.object(runner, "laboratory", side_effect=completed):
            runner.main()
        report = json.loads(self.result.read_text(encoding="utf-8"))
        self.assertEqual(report["status"], "passed")
        self.assertTrue(report["cleanupComplete"])
        self.assertEqual(list((self.root / ".tools").iterdir()), [])

    def test_failure_replaces_old_success_without_persisting_exception_secrets(self):
        (self.root / ".tools").mkdir()
        self.result.parent.mkdir(parents=True)
        self.result.write_text('{"status":"passed","old":true}', encoding="utf-8")
        with patch.object(runner, "laboratory", side_effect=RuntimeError("NEVER_WRITE_THIS_SENTINEL")):
            with self.assertRaises(RuntimeError):
                runner.main()
        content = self.result.read_text(encoding="utf-8")
        self.assertNotIn("NEVER_WRITE_THIS_SENTINEL", content)
        report = json.loads(content)
        self.assertEqual(report["status"], "failed")
        self.assertNotIn("old", report)
        self.assertFalse(report["cleanupComplete"])


if __name__ == "__main__":
    unittest.main()
