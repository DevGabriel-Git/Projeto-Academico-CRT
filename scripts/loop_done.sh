#!/usr/bin/env bash
set -euo pipefail
python3 "$(dirname "$0")/loop_done.py" "${1:?uso: loop_done.sh <mudanca>}"
