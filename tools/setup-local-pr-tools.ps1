$ErrorActionPreference = 'Stop'
python "$PSScriptRoot/preflight.py" --check-tools
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
