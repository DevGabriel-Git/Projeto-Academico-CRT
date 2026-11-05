#!/usr/bin/env bash
# Intended for an ephemeral CI runner. Project-local interactive tooling uses .tools/.
set -euo pipefail
case "${AGENT:?defina AGENT}" in
  omp) npm install -g bun@1.3.14 @oh-my-pi/pi-coding-agent@18.3.2 ;;
  claude) npm install -g @anthropic-ai/claude-code@2.1.220 ;;
  codex) npm install -g @openai/codex@0.153.3 ;;
  *) echo "Agente nao suportado" >&2; exit 2 ;;
esac
