import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("traceability", Path(__file__).resolve().parents[1] / "check_traceability.py")
traceability = importlib.util.module_from_spec(spec)
spec.loader.exec_module(traceability)


class TraceabilityTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        files = {"openspec/specs/example/spec.md": "#### Scenario: Example\n",
                 "specs/traceability.json": json.dumps({"Example": "src/test/java/example/ExampleTest.java#checksContract"}),
                 "src/test/java/example/ExampleTest.java": "@Test void checksContract() {}"}
        for name, content in files.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)

    def report(self, child=""):
        path = self.root / "target/surefire-reports/TEST-example.ExampleTest.xml"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text('<testsuite><testcase classname="example.ExampleTest" name="checksContract">' + child + '</testcase></testsuite>')

    def test_source_without_execution_does_not_pass(self):
        with self.assertRaises(ValueError):
            traceability.verify(self.root)

    def test_successful_execution_passes(self):
        self.report()
        self.assertEqual(traceability.verify(self.root), 1)

    def test_failed_or_skipped_execution_does_not_pass(self):
        for child in ("<failure/>", "<error/>", "<skipped/>"):
            self.report(child)
            with self.subTest(child=child), self.assertRaises(ValueError):
                traceability.verify(self.root)

    def test_different_method_execution_does_not_pass(self):
        self.report()
        path = self.root / "target/surefire-reports/TEST-example.ExampleTest.xml"
        path.write_text(path.read_text().replace('name="checksContract"', 'name="otherMethod"'))
        with self.assertRaises(ValueError):
            traceability.verify(self.root)


if __name__ == "__main__":
    unittest.main()
