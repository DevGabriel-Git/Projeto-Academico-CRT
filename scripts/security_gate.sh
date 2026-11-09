#!/usr/bin/env bash
set -uo pipefail
mkdir -p reports/security
failures=()
scan_root="$PWD"
maven=(bash mvnw)
if [ -n "${COMSPEC:-}" ]; then
  scan_root="$(pwd -W)"
  maven=(./mvnw.cmd)
fi
if command -v uvx >/dev/null 2>&1; then
  uvx --from semgrep==1.178.0 semgrep scan --metrics=off --error --quiet \
    --config p/java --config p/secrets --config p/owasp-top-ten --config semgrep-rules/ \
    --sarif --output reports/security/semgrep.sarif src/ || failures+=(semgrep)
else
  # Mount only targets: Windows bind traversal of tool caches can stall discovery.
  MSYS_NO_PATHCONV=1 docker run --rm -v "$scan_root/src:/scan/src:ro" \
    -v "$scan_root/semgrep-rules:/scan/semgrep-rules:ro" \
    -v "$scan_root/reports/security:/reports" -w /scan semgrep/semgrep:1.178.0 \
    semgrep scan --oss-only --jobs 2 --metrics=off --error \
    --config p/java --config p/secrets --config p/owasp-top-ten --config semgrep-rules/ \
    --sarif --output /reports/semgrep.sarif src/ || failures+=(semgrep)
fi
python security/scan_secrets.py "${1:?uso: security_gate.sh <base-ref>}" || failures+=(gitleaks)
"${maven[@]}" -B -ntp -Psecurity compile spotbugs:check || failures+=(spotbugs)
"${maven[@]}" -B -ntp -Psecurity org.cyclonedx:cyclonedx-maven-plugin:2.9.1:makeAggregateBom -DoutputFormat=json -DincludeTestScope=false \
  && MSYS_NO_PATHCONV=1 docker run --rm -v "$scan_root:/src" ghcr.io/google/osv-scanner:v2.6.0 scan source -L /src/target/bom.json \
      --format sarif --output-file /src/reports/security/osv.sarif || failures+=(osv)
if [ "${#failures[@]}" -gt 0 ]; then printf 'REPROVADO: %s\n' "${failures[*]}"; exit 1; fi
printf 'Portao complementar aprovado\n'
