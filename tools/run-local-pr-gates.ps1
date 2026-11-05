param([Parameter(Mandatory=$true)][string]$BaseRef)
$ErrorActionPreference = 'Stop'
python "$PSScriptRoot/preflight.py" $BaseRef
exit $LASTEXITCODE
