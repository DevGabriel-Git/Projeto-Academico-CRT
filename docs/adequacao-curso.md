# Adequacao ao curso — 5–6 de novembro de 2026

Projeto alterado e commitado: **Projeto-Academico-CRT**, remote `DevGabriel-Git/Projeto-Academico-CRT`, branch `codex/adequacao-curso`.
O repositorio do Jefferson e somente referencia. Seu HEAD e origin/main foram conferidos em `a54c35fd28508355aa992ae3bc30f0fa07da9140`; nenhum arquivo ou commit foi alterado nele.
Base original do projeto do aluno: `1d36936efa7098ce309b042cf3a8bcd720891a87`. Primeiro commit desta adequacao: `543a847`.
A aplicacao financeira e o frontend foram preservados; nao foi copiado o catalogo nem rebaixado o Spring Boot.

## Matriz dos modulos

| Modulo | Adequacao no projeto | Verificacao / limite |
|---|---|---|
| 0 — Fundamentos IA | docs/fundamentos-ia.md, limites de LLM, contexto, verificacao e privacidade | Exercicios conceituais do aluno nao podem ser atestados pela edicao de arquivos. |
| 1 — Ambiente | Java 21, Node 24, OMP 18.3.2/Bun 1.3.14 locais; AGENTS, regras, skills e versoes fixadas | OMP resolve skill://tdd. Login de provedor nao foi feito nem credenciais globais alteradas. |
| 2 — Clean Code | Spotless/AOSP, Checkstyle, PMD, ESLint + tsc; construtores; auth separado; records publicos e ProblemDetail | Build e lint aprovados; modelo financeiro e formato consumido pelo Angular preservados. |
| 3 — TDD/cobertura | 80% linhas/ramos backend; diff coverage; cobertura por arquivo nas fronteiras auth Angular; PIT no dominio critico; hook pre-commit | 74 testes backend; 29 Angular; 39/39 mutantes eliminados. RED real registrado para regressao SARIF, precisao, RFC 9457 e CSRF; nao alegamos TDD retroativo do legado. |
| 4 — SOLID | Identidade centralizada, contratos AcaoApi com provedores reais, injecao por construtor e regras ArchUnit | Cinco regras de arquitetura; sem interfaces especulativas. A suite comum de contrato entre todos os provedores ainda pode ser ampliada. |
| 5 — Design/revisao | ADRs, CONTEXT.md, rastreador e fronteiras de aplicacao por dominio | Revisao independente Standards/Spec sem P1/P2 pendente nas fronteiras revisadas; ver review-2026-11-05.md. |
| 6 — Padroes | Strategy de cotacoes e facade de contrato HTTP na forma idiomatica Spring; alternativas/custos em ADR | gof-patterns e design-pattern-review instaladas e imutaveis; nenhum framework de patterns adicionado. |
| 7 — OpenSpec | 1.13.2, seis skills oficiais, config, spec vigente e cenario -> metodo e execucao Maven aprovada | Specs estritas e rastreabilidade verificadas. Ciclos anteriores ao trabalho nao foram inventados nem arquivados retroativamente. |
| 8 — Spec Kit | CLI 1.0.12, integracao OMP, extensao Git 1.0.1; constituicao, spec, plano, pesquisa, modelo, contrato, checklist e quickstart | Artefatos e comandos disponiveis. Ratificacao humana/aceite continuam pendentes; instalacao nao equivale a execucao de todos os comandos com um modelo. |
| 9 — Context Engineering | Contexto curto, vocabulario separado, rules de conflito/confianca e tokenizer o200k_base 0.12.0 | Orcamento real em tokens, limite 4.000 e 40 linhas do AGENTS; descricoes de skills incluidas, corpos carregados sob demanda. |
| 10 — Loop Engineering | Prompt, estado em arquivos, BLOQUEIO e condicao deterministica em scripts/loop_done.py/.sh | Sete estados testados, incluindo build/trace falhando e checklist vazio. Nenhum loop de modelo foi acionado. |
| 11 — Seguranca | Isolamento por usuario, precisao decimal, transacao/versao, CSRF delimitado, records sem entidades/PII, Gitleaks, CodeQL, FindSecBugs e SBOM | Gates locais executados; chave NVD configurada e validada em 2026-11-09, preflight integral em validacao. Gate complementar Semgrep/Gitleaks/FindSecBugs/OSV aprovado em Docker; triagens em security-actuator.md e security-nvd-2026-11-09.md. ZAP health passivo sem alertas; fluxos autenticados ainda nao varridos. |
| 12 — Agentes CI/CD | Quality/SAST/secrets/SCA/mutacao, SHA de actions, minimo privilegio, CODEOWNERS, template PR e revisao OpenAI manual limitada ao diff do ultimo commit | actionlint passou; zizmor pedante offline sem achados. GitHub Actions e branch protection nao foram executados/configurados remotamente. Destino OpenAI e envio do diff autorizados em 06/11; dez testes locais passam sem API. Chave GitHub e execucao real pendentes. |
| 13 — Desempenho/observabilidade | Actuator/Prometheus, OTel/JDBC Boot 4, metrica apos commit, ECS, LGTM compose, SLO, digest e smoke k6+OTLP | Carga local e chegada dos spans HTTP/JDBC comprovadas. Sem alegar ganho antes/depois, volume de producao ou dashboard Docker executado. Listas permanecem sem paginacao. |
| Catalogo de referencia | Flyway/H2 isolado, PostgreSQL em prod, Failsafe, OpenSpec/rastreabilidade adaptados a corretora | Banco legado nao foi migrado nem apagado. V1 e para banco novo; reconciliacao depende do titular. |
| PR-SECURITY-VALIDATION | Base explicita, commits + worktree publicavel, ferramentas/queries fixadas, SCA, CodeQL duas linguagens, SARIF fail-closed e baseline datada vazia | Nenhum bypass ou aprovacao parcial de publicacao. NVD_API_KEY validada; publicacao autorizada pelo titular e condicionada ao preflight integral. |

## Evidencias

- Backend: **45 testes unitarios/contexto/arquitetura + 29 integracoes = 74**, sem falhas; Spotless, Checkstyle, PMD e JaCoCo aprovados.
- Cobertura backend: **435/454 linhas (95,81%)** e **110/118 ramos (93,22%)**; DTOs/entidades Lombok e classe principal fora do contador, com persistencia/contratos exercitados por integracao.
- PIT: **39 mutantes gerados, 39 eliminados**, 100% de forca no escopo CarteiraService. Limites de 80% preservados; assercoes foram fortalecidas a partir de 14 sobreviventes/sem cobertura iniciais.
- Angular: **29 testes**, **100%** de linhas/ramos/funcoes/instrucoes **somente no escopo auth.service, auth.guard, admin.guard e auth.interceptor**; nao e cobertura global das telas. Lint e build aprovados, bundle inicial **413,49 kB**.
- npm: **0 vulnerabilidades runtime**, **18 moderadas no conjunto completo**, nenhuma alta/critica; politica runtime high/critical e build critical aprovada.
- CodeQL **2.27.4**, Java queries **1.12.0**, JavaScript queries **2.5.0** e dependencias fixadas: duas linguagens e duas suites por linguagem analisadas; gate SARIF aprovado sem excecao nova. Observacoes nao bloqueantes: random usado uma vez em teste e use-before-declaration em extern do proprio extrator.
- Gitleaks **8.30.1**: intervalo dos novos commits e worktree publicavel sem achados. **9 ocorrencias historicas anteriores** permanecem documentadas sem valores; dependem de rotacao pelo titular.
- Gate SARIF: **12 testes**; loops: **7 testes**; TTSR: **10 casos positivos/negativos** e **zero ocorrencias na producao**.
- Skills: **18 externas** com origem, commit e hash LF-normalizado; **6 OpenSpec** geradas e **coverage-gate** local. O lock tem algoritmo documentado e e verificado por scripts/check_skills.py.
- Carga: k6 **2.3.0**, **5 usuarios / 30s**, H2 em memoria com um titular ficticio e carteira vazia: **12.707 requisicoes**, **0% de erro**, **p95 25,48 ms**. O receptor OTLP decodificou spans HTTP e JDBC; relatorio so guarda nomes e contagens, sem atributos pessoais.
- SpotBugs/FindSecBugs e CycloneDX executados; SBOM atualizado com **170 componentes**, OSV encontrou 170 pacotes e reportou zero achados. Nao substituem a auditoria de CVEs por Dependency-Check.

## Pendencias reais

Consulte **operations-pending.md**: rotacao de credenciais historicas, NVD_API_KEY, DAST autenticado, secret OPENAI_API_KEY no GitHub, branch protection, aceite humano e conciliacao PostgreSQL legado.
Essas pendencias nao foram escondidas, marcadas como feitas ou transformadas em excecoes de scanner. O commit local foi autorizado; publicacao remota continua condicionada ao preflight integral.

Atualizacao 06/11: Boot 4.0.9/Cloud 2025.1.4 e BOM OpenTelemetry 1.67.0 corrigiram 87 ocorrencias pacote/vulnerabilidade do primeiro OSV. Gate complementar completo aprovado; nenhuma excecao CodeQL/SCA adicionada. A supressao Semgrep pontual de Prometheus e documentada e testada. Nova rodada de carga: 3.492 requisicoes, zero erros, p95 96,84 ms, 38.496 spans, com auditorias simultaneas; sem comparacao de desempenho. ZAP e somente baseline health, com aviso de spider na raiz 401.

## Perfis solicitados pelo titular

Extensao do pedido de 06/11: login USER/ADMIN, bootstrap explicito sem senha padrao, migracao V2 que preserva usuarios existentes, administracao paginada sem CPF/hash, metricas somente ADMIN e isolamento patrimonial mantido. Backend distingue401/403 em servidor real; papeis sao consultados no banco por requisicao. Angular confirma perfil na API, encerra sessao expirada e nao envia tokens ao login ou URLs externas. Recuperacao ficticia removida: indisponivel por escolha expressa do titular.

Evidencia: 74 testes backend, 29 Angular, 31 cenarios com metodo e execucao real aprovada, diff coverage 86/86 linhas desde 6cd0ef5. Semgrep tem zero achados ativos e uma supressao pontual documentada; CodeQL passou novamente nas duas linguagens. Consulte perfis-acesso.md e review-perfis-2026-11-06.md.
