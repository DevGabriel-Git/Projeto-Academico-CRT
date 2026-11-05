# Seguranca e publicacao

`python tools/preflight.py <base-ref>` e o portao integral de publicacao. Ferramenta, pack, credencial ou relatorio ausente reprova; sem skip nem sucesso parcial.
Ferramentas e queries estao fixadas em tools/versions.json; binarias locais em .tools ficam fora do Git. Bootstrap: tools/setup-local-pr-tools.ps1, depois do provisionamento oficial indicado pelos locks. CodeQL usa cache local e as duas suites de cada linguagem explicitamente.

Ordem: ferramentas/versoes e NVD -> base explicita/diff -> higiene env -> segredos commits+worktree -> build/cobertura/trace/regras -> frontend lint/test/build -> SCA -> CodeQL -> gate SARIF -> evidencia.
`NVD_API_KEY` esta ausente e bloqueia o preflight integral antes de emitir evidencia. As verificacoes independentes executadas estao em docs/adequacao-curso.md.

`security/check_sarif_reports.py` rejeita qualquer relatorio ausente/incompleto, execucao sem sucesso, regra nao resolvida ou novo achado >=7.0. A baseline vazia tem dono e validade; nao foi alterada para aprovar CSRF. O problema foi corrigido no codigo e retestado.
`scripts/security_gate.sh` reproduz as quatro camadas complementares do modulo 11 (Semgrep, Gitleaks, bytecode e SBOM/OSV), com ferramentas/imagens fixadas. Docker/uv ausentes fazem falhar; DAST exige alvo isolado e nao foi executado.

Revisao humana: propriedade/IDOR, integridade de historico, concorrencia, privacidade, injetores, dependencias e migracoes. Nao usar dados reais em laboratorio. Nenhum segredo vai a log, resposta, relatorio ou prompt.

Gitleaks: worktree e novos commits aprovados; nove ocorrencias antigas no historico exigem acao do titular, ver docs/security-findings.md. Nao reescrever historico de colaboradores sem coordenacao.
Workflows estao preparados, nao executados remotamente. PR escaneia seu intervalo; auditoria semanal/manual inspeciona historico completo. Protecao de branch e CODEOWNERS precisam ser ativados no GitHub.
