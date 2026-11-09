#!/usr/bin/env python3
"""Mede, em tokens, o contexto que o .agents/ do projeto coloca diante do agente.
Usa `omp toks --json` (tokenizadores offline). Sai com código 1 se passar dos limites."""
import argparse, json, re, subprocess, sys, tempfile
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("--encoding", default="o200k_base")
ap.add_argument("--max-sempre", type=int, default=4000, help="limite de tokens sempre presentes (0 = sem limite)")
ap.add_argument("--max-agents-linhas", type=int, default=40)
args = ap.parse_args()


sys.path.insert(0, str(Path(__file__).resolve().parents[1] / ".tools/python"))
import os
os.environ.setdefault("TIKTOKEN_CACHE_DIR", str(Path(__file__).resolve().parents[1] / ".tools/tokenizer-cache"))
import tiktoken
ENCODING = tiktoken.get_encoding(args.encoding)

def toks(text):
    return len(ENCODING.encode(text))


def frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    return m.group(1) if m else ""


def resumo(fm):  # o que o agente vê de uma skill ou rule antes de abri-la
    return "\n".join(l for l in fm.splitlines() if re.match(r"^\s*(name|description|globs)\s*:|^\s+\S", l))


linhas, sempre, sob_demanda, falhou = [], 0, 0, False
ctx = Path("AGENTS.md")
if ctx.exists():
    t = ctx.read_text(encoding="utf-8"); n = toks(t); sempre += n
    linhas.append(("contexto", "AGENTS.md", n, "sempre"))
    if args.max_agents_linhas and len(t.splitlines()) > args.max_agents_linhas:
        print(f"ERRO: AGENTS.md tem {len(t.splitlines())} linhas (limite {args.max_agents_linhas})")
        falhou = True

for r in sorted(Path(".agents/rules").glob("*.md")):
    t = r.read_text(encoding="utf-8"); fm = frontmatter(t)
    if "alwaysApply: true" in fm:
        n = toks(t); sempre += n; linhas.append(("rule", r.stem, n, "sempre"))
    elif re.search(r"^(condition|astCondition|question):", fm, re.M):
        linhas.append(("rule", r.stem, toks(t), "gatilho"))
    else:
        n = toks(resumo(fm)); sempre += n; sob_demanda += toks(t) - n
        linhas.append(("rule", r.stem, n, "resumo"))

for s in sorted(Path(".agents/skills").glob("*/SKILL.md")):
    t = s.read_text(encoding="utf-8"); n = toks(resumo(frontmatter(t))); sempre += n; sob_demanda += toks(t)
    linhas.append(("skill", s.parent.name, n, "descrição"))

for tipo, nome, n, quando in linhas:
    print(f"{tipo:<9}{nome:<32}{n:>6}  {quando}")
print(f"\nSempre presente ({args.encoding}): {sempre} tokens")
print(f"Carregável sob demanda (corpos de skills e rules): {sob_demanda} tokens")
if args.max_sempre and sempre > args.max_sempre:
    print(f"ERRO: acima do limite de {args.max_sempre} tokens sempre presentes")
    falhou = True
sys.exit(1 if falhou else 0)
