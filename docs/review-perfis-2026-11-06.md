# Revisao dos perfis e evidencias

Base 6cd0ef5. Especificacao inicial: specs/002-perfis-acesso/spec.md, escrita antes do
codigo. Dois agentes independentes conforme skill code-review; nao e aprovacao humana.

## Standards

Relatorio final: zero achados acionaveis. RBAC consulta o banco, cadastro fixa USER,
migracao preserva V1, DTO administrativo minimiza dados e bootstrap usa trava transacional.
A observacao inicial sobre expiracao durante paginacao foi corrigida no interceptor.

## Spec

Dois P2 iniciais: bootstrap idempotente aceitava CPF divergente;401 durante paginacao
nao encerrava sessao. Ambos corrigidos e reavaliados sem pendencias. Validacao de CPF
antecede retorno idempotente; interceptor faz logout e navega ao login com aviso de
expiracao. Titular escolheu retirar a simulacao de recuperacao e manter indisponibilidade.

Resumo: Standards 0; Spec 0 pendente, 2 corrigidos. Nao houve elevacao de privilegios nos
casos identificados; eram conflitos de identidade/fluxo de sessao.

## Evidencias de execucao

- RED inicial: 4 testes de perfis falharam pelos contratos ausentes; testes do guard
  falharam para anonimo/USER/expiracao/erro antes da implementacao.
- HTTP real revelou403 convertido em401 por sendError/dispatch de erro. Teste de
  regressao reproduziu 401; resposta direta de seguranca preserva 401/403/200.
  Caminhos temporarios curtos corrigem falha do seletor JDK Windows sem excluir o teste.
- Bearer antigo bloqueava novo login: RED 401, agora credenciais validas em POST auth
  recebem novo token. Interceptor limita envio ao caminho da API e ignora login/cadastro.
- RED de bootstrap com CPF divergente esperava excecao; GREEN dos 7 testes de bootstrap.
  RED de expiracao no interceptor foi corrigido; 29 testes Angular passam, cobertura 100%
  somente auth.service/auth.guard/admin.guard/auth.interceptor. Tela/menu/login tambem
  tem testes, sem alegar cobertura global. Build 413,49 kB.
- Verify completo: 45 unitarios/contexto/arquitetura e 29 integracoes, 74 no total.
  Cobertura 435/454 linhas (95,81%), 110/118 ramos (93,22%); diff 86/86 linhas desde 6cd0ef5.
- Rastreabilidade: 31 cenarios, agora exige metodo existente e testcase Maven aprovado;
  quatro testes do gate rejeitam ausencia de execucao, falha, skip e metodo divergente.
- Smoke do JAR: bootstrap real via profile, H2 efemero, credenciais aleatorias nao
  persistidas, cadastro malicioso continuaUSER, admin 401/403/200, DTO minimo e metricas.
- CodeQL repetido depois da revisao: Java e JavaScript/TypeScript, duas suites por lingua,
  gate aprovado. Observacoes de qualidade em testes (random/toString) e externs do
  extrator nao foram transformadas em excecoes de seguranca.
- Gate complementar final aprovado: Semgrep zero ativos, 1 supressao Actuator documentada;
  Gitleaks zero segredos novos; FindSecBugs zero; OSV encontrou 170 pacotes, zero achados.

Nao foi alterado banco real, criado admin de producao, publicado commit ou configurado
secret GitHub. NVD_API_KEY ausente continua bloqueando o preflight integral/publicacao.

O mesmo smoke passou tambem com Maven spring-boot:run no Windows, H2 efemero e
profile de bootstrap. O plugin configura os caminhos temporarios curtos para evitar
a falha de loopback do JDK neste ambiente. O processo de laboratorio foi encerrado.
