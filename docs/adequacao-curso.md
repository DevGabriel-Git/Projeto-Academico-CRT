# Adequacao ao curso — 10 de novembro de 2026

Projeto: **DevGabriel-Git/Projeto-Academico-CRT**. Referencia Jefferson somente para leitura: commit `a54c35fd28508355aa992ae3bc30f0fa07da9140`. Esta conclusao parte de `783e7e1`, apos a PR #1 integrada. Dominio da corretora e frontend Angular preservados.

| Modulo | Entrega e evidencia | Limite |
|---|---|---|
| 0 — Fundamentos IA | docs/fundamentos-ia.md, privacidade e verificacao | Exercicios pessoais nao atestados por arquivos. |
| 1 — Ambiente | Java 21, Node 24, Maven Wrapper; regras, ferramentas e 18 skills fixadas | Credenciais externas nao sao distribuidas no Git. |
| 2 — Clean Code | Spotless, Checkstyle, PMD, ESLint, records e ProblemDetail | Gates de build preservados. |
| 3 — TDD/cobertura | 79 testes Java; 51 Angular; JaCoCo 95,82% linhas/93,22% ramos; diff coverage | PIT CarteiraService 39/39 em 06/11; sem alegar TDD retroativo. Cobertura Angular 92,41% linhas/88,43% ramos em sete arquivos criticos, nao global. |
| 4 — SOLID | Injecao por construtor, identidade central, adapters de provedores e ArchUnit | Chamadas reais de cotacao desativadas por escolha do titular. |
| 5 — Design/revisao | ADRs, CONTEXT, servicos de aplicacao e revisao em dois eixos | Aceite final humano separado das ferramentas. |
| 6 — Padroes | Strategy de cotacoes e facade HTTP; custos documentados | Sem interfaces especulativas ou troca do dominio pelo catalogo. |
| 7 — OpenSpec | CLI 1.13.2, seis skills, specs estritas; 33 cenarios rastreados a testes executados | Sem inventar ciclos anteriores. |
| 8 — Spec Kit | CLI 1.0.12, comandos OMP, constituicao, plano, contratos e checklists | Ratificacao humana pendente; instalacao nao equivale a todos os comandos executados com modelo. |
| 9 — Context Engineering | AGENTS curto, vocabulario/regras separados e tokenizer real | Gate de 4.000 tokens; skills sob demanda. |
| 10 — Loop Engineering | Estado em arquivos, limites, BLOQUEIO e condicao deterministica | Sete estados testados; sem alegar execucao de loop autonomo externo. |
| 11 — Seguranca | JWT/BCrypt, USER/ADMIN, isolamento patrimonial, SCA/CodeQL/secrets, DAST autenticado | 23 checks, 878 requests, 222 mensagens autenticadas, seis scans concluidos; duas infos exatas triadas ate 10/12. Revogacao de duas chaves historicas depende do titular. |
| 12 — Agentes CI/CD | Quality/SAST/secrets/SCA/mutacao, actions por SHA, minimo privilegio, PR e CODEOWNERS | Actions ja executados; main protegida por cinco checks. NVD secret e SCA remoto aprovados em 10/11. OpenAI manual preparado, desativado por escolha do titular. |
| 13 — Desempenho/observabilidade | Actuator, Prometheus ADMIN, OTel/JDBC/ECS, k6 e LGTM preparado | Carga H2/carteira vazia: 5 usuarios/30s, 9.954 requests, zero erros, p95 31,89ms; spans HTTP/JDBC recebidos. Sem comparacao de producao. |
| Catalogo Spring Boot | Flyway, PostgreSQL prod, H2 de teste, Failsafe e rastreabilidade adaptados | Banco atual preservado; banco legado exige reconciliacao previa. |
| PR-SECURITY-VALIDATION | Base real, preflight integral, SCA, CodeQL duas linguagens, SARIF fail-closed | Publicacao exige gates completos; sem reduzir limites ou silenciar achados novos. |

## Evidencias desta conclusao

Backend: 47 testes unitarios/contexto/arquitetura e 32 integracoes, sem falhas. Cobertura 436/455 linhas e 110/118 ramos. Python: 33 testes de scripts e 21 de seguranca; suites tambem executadas em Linux. Fixture DAST exclusivamente de teste rejeita qualquer banco diferente do H2 em memoria antes de iniciar Spring. Testes RED/GREEN registraram e corrigiram HTTP 500 para recurso privado alheio, diretorio ausente no checkout limpo e resultado antigo de scanner que poderia parecer aprovado.

DAST usa rede Docker interna, nenhum host port, usuarios ficticios e chaves aleatorias; verifica ADMIN, registro, JWT, acesso cruzado nos dois sentidos e ausencia de efeitos parciais. Quatro regras GET delimitadas, seis scans com fim comprovado e fila passiva drenada. Gate rejeita qualquer alerta sem triagem; apenas duas informacoes de descoberta de sessao JWT sao aceitas por rota/regra/risco e prazo exatos. Nao e pentest exaustivo nem validacao de TLS, Angular ou PostgreSQL de producao.

Builds Docker frontend/backend aprovados em 10/11. Frontend usa Node 24 e exclui dependencias Windows/segredos do contexto. Compose publica API em loopback8080 e site em loopback8081, configuraveis por BACKEND_PORT/FRONTEND_PORT.

SCA remoto aprovado: https://github.com/DevGabriel-Git/Projeto-Academico-CRT/actions/runs/42806910156 . Main exige PR atualizada, cinco checks Actions e resolucao de conversas; proibe force push/exclusao, inclusive para administradores. Nao exige aprovacao de terceiro no repositorio de mantenedor unico.

Contagens e escopos: verification.json. Pendencias externas e decisoes do titular: operations-pending.md. Nenhuma chave, senha ou CPF e publicado nos relatorios versionados. Administrador real foi criado e autenticado em 09/11; nao ha senha padrao e recuperacao de senha permanece indisponivel por escolha do titular.
