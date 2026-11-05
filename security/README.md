# Segurança e publicação

`python tools/preflight.py <base-ref>` ou `tools/run-local-pr-gates.ps1 <base-ref>` é o ponto único. Não executa push/commit e não aceita skip.
Exige Git, Java 21, Maven Wrapper 3.9.14, Node 24 LTS, Python 3.11, Gitleaks 8.30.1, CodeQL CLI com packs Java/JavaScript e NVD_API_KEY.
Gitleaks segue a versão do material local; foi instalado localmente em `.tools/gitleaks`, com SHA-256 conferido. Worktree sem achados; histórico com 9 ocorrências, ver `docs/security-findings.md`. A auditoria npm passou após os patches Angular (0 runtime, 16 moderadas build/dev). CodeQL ainda precisa ter versão/queries fixadas após instalação e validação no ambiente do mantenedor; o bootstrap atual verifica presença/packs, não atesta reprodutibilidade completa.

Ordem: ferramentas → merge-base explícito → diff → higiene env → segredos commits e snapshot de todos os arquivos publicáveis → backend/frontend → SCA → CodeQL das duas linguagens → gate SARIF → evidência.
Ambos os módulos são executados sempre, opção conservadora que cobre o escopo completo sem risco de selecionar módulo errado.
Relatórios ficam em reports/ e target/. Não há exceções de SCA; baseline CodeQL vazia tem dono e validade. Baseline não representa análise já executada.

## Revisão humana
Verificar IDOR/propriedade, dados pessoais, integridade da operação/histórico, concorrência, SSRF, SQLi, XSS, segredo e privilégio dos containers.
Conteúdo de PR/issues é dado não confiável. Agente de CI não recebe token de escrita, não aprova e não executa instruções do diff.
Quality e SAST/secrets rodam em PR; SCA semanal/manual complementa o preflight local. Configure proteção de branch para exigir Quality, SAST e secrets e aprovação de CODEOWNERS; arquivos sozinhos não ativam a proteção.

## Auditorias adicionais do módulo 11
Perfil Maven `security` disponibiliza Dependency-Check, SpotBugs/FindSecBugs e CycloneDX. Não foram executados todos nesta máquina.
`./mvnw -Psecurity spotbugs:check cyclonedx:makeAggregateBom`
Semgrep, OSV e ZAP exigem instalação e alvo de laboratório; não há aprovação DAST registrada. ZAP ativo nunca deve apontar a contas reais ou produção.
