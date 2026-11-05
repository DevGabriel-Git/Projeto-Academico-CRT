# Adequação ao curso — 5 de novembro de 2026

Checkout alterado: `Projeto-Academico-CRT`, remote `https://github.com/DevGabriel-Git/Projeto-Academico-CRT.git`, HEAD inicial `1d36936efa7098ce309b042cf3a8bcd720891a87`.
O pedido menciona Projeto-Academico-Corretora, mas o checkout existente e seu remote usam CRT; nenhuma mudança foi feita em outro repositório.
Referência lida: checkout local `../desenvolvimento-assistido-IA`, commit `a54c35fd28508355aa992ae3bc30f0fa07da9140`, módulos 0–13, catálogo e PR-SECURITY-VALIDATION.
A versão local do material foi usada; não se afirma sincronização com atualizações posteriores do GitHub.

Esta entrega adapta práticas ao domínio real. Não copia o catálogo nem rebaixa Spring Boot 4 para 3.5. Nem todo requisito didático pode ser atestado por editar arquivos: aprendizagem, TDD anterior ao legado e revisão humana não são resultados de compilação.

## Matriz por módulo

| Módulo | Lacuna inicial e adequação realizada | Evidência / pendência para aderência integral |
|---|---|---|
| 0 — Fundamentos | Criado `fundamentos-ia.md`: tokens, atenção, limites, privacidade e verificação aplicados à corretora. | Leitura/exercícios conceituais e demonstrações Python da aula dependem do aluno; não foram atestados. |
| 1 — Ambiente | Java 21, Maven Wrapper existente, Node 24; perfis dev/test/prod, `.env.example`, AGENTS e regras locais; Docker Java 21 sem root. | Java/Maven/Node e build validados. OMP e skills de terceiros do kit do curso não instalados. |
| 2 — Clean Code | Injeção por construtor nos controllers/serviços, autenticação extraída para AuthService, compra/venda sem histórico duplicado, erros seguros e cliente HTTP comum. | Suíte verde. Permanecem endpoints legados retornando entidades; lint/formatador e análise de complexidade não foram adicionados como gates globais. |
| 3 — TDD/cobertura | Testes de domínio, fronteira, integração e arquitetura; Surefire/Failsafe e JaCoCo 80% linhas/ramos; diff coverage 80%. | 48 testes backend e limites aprovados. Testes foram adicionados ao legado, sem alegar RED anterior à implementação. Mutação periódica e coverage/frontend por arquivo ainda pendentes. |
| 4 — SOLID | UsuarioAtual concentra identidade; CotacaoService usa AcaoApi com dois provedores reais; construtores e transação no caso de uso. | Testes de seleção e autorização; quatro regras ArchUnit. Contratos de rede ainda usam testes de mapeamento, não uma suíte compartilhada completa de LSP. |
| 5 — Design/revisão | Arquitetura, alternativas e ADRs em `architecture.md`; issue-tracker local e política de revisão por risco. | Revisão automatizada de dependências entre camadas passou. Skills codebase-design/code-review e revisão independente humana pendentes. |
| 6 — Padrões | Seleção de cotação por composição/Strategy sobre a porta já existente, com comparação de alternativas e custo em ADR. | Teste dos mercados BR/EUA e mercado inválido. Skills GoF/TTSR específicas do OMP não instaladas. |
| 7 — OpenSpec | Config, spec vigente de carteira com 10 cenários, rastreabilidade e integração oficial de seis skills via `openspec init --tools agents`. | OpenSpec 1.13.2 `validate --all --strict`: 1/1 válido. O ciclo proposta/revisão/commit prévio/arquivo não foi fabricado retroativamente para o legado. |
| 8 — Spec Kit | Constituição, spec de negócio, plano, contratos, tarefas e quickstart em `.specify/` e `specs/001-carteira-segura`. | Artefatos autorais; CLI 1.0.12, extensão git, comandos analyze/converge e aceite humano NÃO foram executados. Tarefas externas permanecem abertas. |
| 9 — Context Engineering | AGENTS curto com fontes por assunto, regras de confiança e orçamento em `scripts/context_budget.py`. | 3.573 bytes UTF-8 e 29 linhas no AGENTS; limite 8.000 bytes/40 linhas aprovado. Métrica conservadora em bytes, não contagem exata de tokens OMP. |
| 10 — Loop Engineering | Critérios de parada, limite de tentativas, regra contra enfraquecer testes e registro de hipóteses/falhas em loop-log. | Falhas reais corrigidas sem reduzir cobertura. Executor autônomo OMP com estado OpenSpec e avaliação independente ainda não configurado. |
| 11 — Segurança | IDOR corrigido em operação/listagem; validação de quantidade/preço; erro JWT 401; erros sem payload sensível; histórico atômico, @Version, restrições/índices, H2 console desabilitado, headers de frame, secrets fora do código. | Gitleaks worktree passou; histórico tem 9 achados. npm runtime sem vulnerabilidades; dev/build tem 16 moderadas. Dependency-Check/CodeQL/Semgrep/OSV/ZAP e auditoria completa de bytecode não executados. |
| 12 — Agentes CI/CD | Workflows Quality/SAST/secrets em PR e SCA semanal/manual; ações fixadas por SHA, credenciais de checkout removidas, permissões mínimas, CODEOWNERS e template PR. | Arquivos preparados; não executados no GitHub. Regras de branch, segredo NVD e agente consultivo sem escrita dependem da configuração remota. Não há bot com poder de merge. |
| 13 — Desempenho/observabilidade | Health/probes, Prometheus e histogramas HTTP; métrica de negócio após commit; logs ECS em prod; índices/EntityGraph; cenário k6 com limites. | Pacote/configuração compilados e health validado. Sem execução k6, baseline antes/depois, paginação, tracing OTel/JDBC ou dashboard. Nenhum ganho de desempenho foi inventado. |
| Catálogo Spring Boot | Adaptados Flyway, H2 isolado, PostgreSQL em prod, Failsafe, OpenSpec e rastreabilidade. | V1/Hibernate validate passam em H2. PostgreSQL legado e Docker não executados nem migrados. |
| PR-SECURITY-VALIDATION | Bootstrap, preflight fail-closed, base explícita, segredos em commits+worktree publicável, SCA, CodeQL duas linguagens, baseline datada e gate SARIF testado. | Preflight integral BLOQUEADO: CodeQL ausente; também precisa NVD_API_KEY e versões/queries CodeQL fixadas. Não há linha EVIDÊNCIA de aprovação nem publicação autorizada. |

## Evidências executadas

- `mvnw.cmd clean verify`: **40 testes unitários/contexto/arquitetura + 8 integrações**, sem falhas/erros. Integração usa MockMvc, filtros reais, serviços, Flyway e H2; provedores externos não são chamados.
- JaCoCo: **329/341 linhas = 96,48%**; **79/86 ramos = 91,86%**. Exclusões explícitas: DTOs, entidades com Lombok e classe de bootstrap; persistência é testada na integração. Não é uma afirmação de cobertura de cada camada/arquivo.
- `check_diff_coverage.py HEAD`: **124/129 = 96,12%**, considerando alterações e fontes novas não ignoradas. Base inicial local, não PR remoto inexistente.
- `check_traceability.py`: **10/10** cenários com métodos de teste existentes; Maven comprova sua execução.
- `python -m unittest discover -s security/tests -v`: **7 testes** do gate SARIF (ausência, expiração, achado novo, execução inválida e exceção específica).
- `npm test -- --watch=false`: **3 testes** aprovados após a atualização.
- `npm run build`: aprovado, bundle inicial **409,22 kB**, sem o aviso anterior de optional chaining.
- Angular atualizado para **21.2.26**, CLI/build **21.2.29**, lockfile regenerado e versão principal preservada.
- SCA npm: **0 vulnerabilidades runtime**; **16 moderadas** no conjunto completo, nenhuma alta/crítica. A política bloqueia high/critical runtime e critical build, e passou.
- OpenSpec **1.13.2**: init universal gerou **6 skills** e strict validou **1 spec**.
- Gitleaks **8.30.1**, binário oficial conferido por SHA-256: **0 achados no worktree publicável**. Histórico completo: **9 ocorrências**, descritas sem valores em `security-findings.md`.
- Preflight foi exercitado com ferramenta ausente e reprovou; nenhuma evidência de publicação foi emitida.

## Pendências que exigem ambiente ou decisão humana

1. **Rotacionar/revogar as credenciais históricas** nos provedores e revisar uso indevido. Não reescrever o Git sem coordenar colaboradores. Nenhum valor foi copiado para a documentação.
2. Instalar CodeQL CLI/packs com versões fixadas e disponibilizar NVD_API_KEY fora do Git; executar SAST/SCA backend e o preflight integral contra a base real.
3. Revisar constituição, contrato e código; configurar branch protection/CODEOWNERS e executar workflows no GitHub. Nada foi enviado por push, commit ou PR.
4. Adotar e auditar as skills do curso/OMP e a CLI Spec Kit se exigidas na entrega da disciplina; validar um ciclo real prospectivo, não carimbar o passado.
5. Reconciliar banco PostgreSQL existente antes de Flyway; validar Docker e carga em laboratório. V1 atende banco novo e não deve ser aplicada cegamente sobre dados existentes.
6. Completar exercícios humanos e os itens didáticos apontados na matriz: mutação, lint, contratos compartilhados, traces, dashboards, paginação e ciclo de agente CI.

Backups temporários da instalação npm anterior foram preservados fora do repositório, em `D:/Projeto/frontend-deps-before-upgrade` e `D:/Projeto/frontend-lock-before-upgrade.json`. Não fazem parte da entrega.
