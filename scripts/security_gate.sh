#!/usr/bin/env bash
set -uo pipefail
mkdir -p reports/security
failures=()
uvx --from semgrep==1.178.0 semgrep scan --metrics=off --error --quiet \
  --config p/java --config p/secrets --config p/owasp-top-ten --config semgrep-rules/ \
  --sarif --output reports/security/semgrep.sarif src/ || failures+=(semgrep)
python security/scan_secrets.py "${1:?uso: security_gate.sh <base-ref>}" || failures+=(gitleaks)
bash mvnw -B -ntp -Psecurity compile spotbugs:check || failures+=(spotbugs)
bash mvnw -B -ntp -Psecurity org.cyclonedx:cyclonedx-maven-plugin:2.9.1:makeAggregateBom -DoutputFormat=json -DincludeTestScope=false \
  && docker run --rm -v "$PWD:/src" ghcr.io/google/osv-scanner:v2.6.0 scan source -L /src/target/bom.json \
      --format sarif --output /src/reports/security/osv.sarif || failures+=(osv)
if [ "${#failures[@]}" -gt 0 ]; then printf 'REPROVADO: %s\n' "${failures[*]}"; exit 1; fi
printf 'Portao complementar aprovado\n'
