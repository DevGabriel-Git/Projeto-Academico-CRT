"""Limite conservador em bytes UTF-8; independente do tokenizer do fornecedor."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
files=[ROOT/"AGENTS.md",ROOT/".agents/AGENTS.md",*sorted((ROOT/".agents/rules").glob("*.md"))]
total=sum(len(f.read_bytes()) for f in files)
lines=len((ROOT/"AGENTS.md").read_text(encoding="utf-8").splitlines())
print(f"Contexto base: {total} bytes UTF-8; AGENTS.md: {lines} linhas")
# Bytes limitam superiormente a contagem de tokens em tokenizadores byte-level.
# Isto NAO afirma a contagem exata de tokens de um modelo.
if total>8000 or lines>40: raise SystemExit("Orcamento de contexto excedido (8000 bytes / 40 linhas)")
