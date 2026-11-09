import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("loop_done", Path(__file__).resolve().parents[1] / "loop_done.py")
loop = importlib.util.module_from_spec(spec)
spec.loader.exec_module(loop)


class LoopStopTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.change = self.root / "openspec/changes/test-change"
        self.change.mkdir(parents=True)

    def tasks(self, content):
        (self.change / "tasks.md").write_text(content)

    def test_missing_change_stops(self):
        self.assertEqual(loop.evaluate(self.root, "missing", lambda args: 0)[0], 0)

    def test_block_stops(self):
        self.tasks("- [ ] tarefa")
        (self.change / "loop-notes.md").write_text("BLOQUEIO: decisao humana")
        self.assertEqual(loop.evaluate(self.root, "test-change", lambda args: 0)[0], 0)

    def test_open_tasks_continue(self):
        self.tasks("- [ ] tarefa")
        self.assertEqual(loop.evaluate(self.root, "test-change", lambda args: 0)[0], 1)

    def test_build_failure_continues(self):
        self.tasks("- [x] tarefa")
        self.assertEqual(loop.evaluate(self.root, "test-change", lambda args: 1)[0], 1)

    def test_trace_failure_continues(self):
        self.tasks("- [x] tarefa")
        results = iter([0, 1])
        self.assertEqual(loop.evaluate(self.root, "test-change", lambda args: next(results))[0], 1)

    def test_completed_stops_ready(self):
        self.tasks("- [x] tarefa")
        code, message = loop.evaluate(self.root, "test-change", lambda args: 0)
        self.assertEqual(code, 0)
        self.assertTrue(message.startswith("PRONTO:"))

    def test_empty_checklist_is_not_ready(self):
        self.tasks("# Tasks")
        self.assertTrue(loop.evaluate(self.root, "test-change", lambda args: 0)[1].startswith("PARAR:"))
