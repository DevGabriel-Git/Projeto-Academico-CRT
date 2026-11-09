import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "skills_integrity", Path(__file__).resolve().parents[1] / "check_skills.py"
)
skills = importlib.util.module_from_spec(spec)
spec.loader.exec_module(skills)


class SkillsIntegrityTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.directory = self.root / ".agents/skills/example"
        self.write("SKILL.md", b"skill\n")
        self.write("agents/openai.yaml", b"agent\n")

    def write(self, name, content):
        file = self.directory / name
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_bytes(content)

    def test_canonical_order_matches_existing_windows_locks_on_every_host(self):
        # A directory component sorts before a longer sibling component (a.txt).
        self.write("a/child.md", b"nested\n")
        self.write("a.txt", b"sibling\n")
        expected = hashlib.sha256(
            b"a/child.md\0nested\na.txt\0sibling\n"
            b"agents/openai.yaml\0agent\nSKILL.md\0skill\n"
        ).hexdigest()
        self.assertEqual(skills.tree_hash(self.directory), expected)

    def test_line_endings_do_not_change_integrity(self):
        original = skills.tree_hash(self.directory)
        self.write("SKILL.md", b"skill\r\n")
        self.assertEqual(skills.tree_hash(self.directory), original)

    def test_changed_and_missing_skills_are_rejected(self):
        lock = {"skills": {"example": {"computedHash": skills.tree_hash(self.directory)}}}
        (self.root / "skills-lock.json").write_text(json.dumps(lock), encoding="utf-8")
        with patch.object(skills, "ROOT", self.root):
            skills.main()
            self.write("agents/openai.yaml", b"modified\n")
            with self.assertRaisesRegex(SystemExit, "Skill alterada ou ausente: example"):
                skills.main()
            self.write("agents/openai.yaml", b"agent\n")
            (self.directory / "SKILL.md").unlink()
            with self.assertRaisesRegex(SystemExit, "Skill alterada ou ausente: example"):
                skills.main()


if __name__ == "__main__":
    unittest.main()
