"""Project-local tools and pinned query packs, without changing global configuration."""
import json
import os
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
VERSIONS = json.loads((ROOT / "tools/versions.json").read_text(encoding="utf-8"))


def command(name):
    if name == "omp":
        bun = ROOT / ".tools/agent/node_modules/@oven/bun-windows-x64/bin/bun.exe"
        cli = ROOT / ".tools/agent/node_modules/@oh-my-pi/pi-coding-agent/dist/cli.js"
        if os.name == "nt" and bun.is_file() and cli.is_file():
            return [str(bun), str(cli)]
    candidates = {
        "codeql": ROOT / ".tools/codeql" / ("codeql.exe" if os.name == "nt" else "codeql"),
        "gitleaks": ROOT / ".tools/gitleaks" / ("gitleaks.exe" if os.name == "nt" else "gitleaks"),
    }
    local = candidates.get(name)
    if local and local.is_file():
        return [str(local)]
    executable = shutil.which(name)
    if not executable:
        raise RuntimeError("Ferramenta obrigatoria ausente: " + name)
    return [executable]


def query_paths():
    paths = []
    for name, version in VERSIONS["queryPacks"].items():
        path = ROOT / ".tools/codeql-cache/packages" / name / version
        if not (path / "qlpack.yml").is_file():
            raise RuntimeError("Pack CodeQL ausente: " + name + "@" + version)
        paths.append(str(path))
    if not paths:
        raise RuntimeError("Lock de queries vazio")
    return os.pathsep.join(paths)
