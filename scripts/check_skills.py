"""Verify vendored skill bytes against the project provenance lock (LF-normalized text)."""
import hashlib
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def path_order(path):
    # Existing locks use Windows component ordering; make it explicit on every host.
    return tuple(part.casefold() for part in path.parts), path.as_posix()

def tree_hash(directory):
    digest=hashlib.sha256()
    for file in sorted(directory.rglob("*"), key=lambda file: path_order(file.relative_to(directory))):
        if file.is_file():
            content=file.read_bytes()
            try: content=content.decode("utf-8").replace("\r\n","\n").encode("utf-8")
            except UnicodeDecodeError: pass
            digest.update(file.relative_to(directory).as_posix().encode()+b"\0"+content)
    return digest.hexdigest()
def main():
    lock=json.loads((ROOT/"skills-lock.json").read_text(encoding="utf-8"))
    for name,metadata in lock["skills"].items():
        directory=ROOT/".agents/skills"/name
        if not (directory/"SKILL.md").is_file() or tree_hash(directory)!=metadata["computedHash"]:
            raise SystemExit("Skill alterada ou ausente: "+name)
    print(f"Skills verificadas: {len(lock['skills'])}")
if __name__=="__main__": main()
