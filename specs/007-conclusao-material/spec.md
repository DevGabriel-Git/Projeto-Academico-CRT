# Conclusão verificável da adequação ao curso

Pedido de retomada do titular em 2026-11-10, base main 783e7e1. Manter o domínio,
as contas reais, o PostgreSQL local e a recuperação de senha indisponível.

## Segurança dinâmica

- Executar autenticação, autorização vertical e IDOR com dois USER e um ADMIN
  fictícios, carteira e histórico não vazios. Credenciais aleatórias a cada execução.
- Executar ZAP passivo e ativo autenticado somente contra uma instância de
  laboratório, H2 em memória, rede Docker interna, sem portas publicadas e sem
  chamadas aos provedores. Recusar seed em qualquer outro banco.
- Confirmar token válido antes de cada varredura, limitar explicitamente as rotas,
  aguardar conclusão e fila passiva vazia. Timeout/erro/varredura vazia não aprovam.
- Relatório contém somente contagens, regras, rotas e resultados; nunca senha,
  JWT, nome/e-mail/CPF reais nem cabeçalhos de autorização.
- Triar alertas com justificativa específica e prazo; nenhum ignore global.
- Corrigir retornos500 indevidos encontrados nas consultas privadas de corretora/ativo:
  usar404 também para ADMIN, sem alterar os registros nem chamar o provedor.
- Remover somente containers/rede/fixture temporários criados pela execução.
- Fixar digests oficiais do scanner/runtime e preparar workflow PR/manual/semanal
  sem secrets. PR usa seu merge commit; execuções manuais/semanal usam a branch
  padrão. Permissões somente leitura, laboratório descartável e relatório sanitizado.

## GitHub e integrações

- Proteger main exigindo PR, branch atualizada, conversas resolvidas e checks
  Backend, Frontend, Secrets e as duas matrizes Codeql da GitHub Actions.
- Bloquear force-push e exclusão, inclusive para administradores. Não exigir
  aprovação de terceiros numa manutenção individual; documentar esse limite.
- Configuração de proteção é versionada e confirmada por leitura da API oficial.
- Manter revisão OpenAI manual, limitada, somente consultiva e sem ferramentas;
  executar somente com chave fornecida localmente pelo titular. Nunca inventar
  execução nem ativação quando secret/modelo/conta estiver indisponível.
- Verificar provedores somente quando as chaves existirem. Não reutilizar chaves
  expostas no histórico e não afirmar rotação sem confirmação do titular.

## Execução local portável

- Compose publica somente em loopback: backend8080 e frontend8081 por padrão,
  configuráveis por BACKEND_PORT/FRONTEND_PORT. Não depender de .tools ignorado
  para contornar a porta80 bloqueada no Windows.
- Build Angular usa Node24 compatível com a versão21; não copiar node_modules,
  caches Windows, arquivos de ambiente ou .npmrc para o contexto do Docker.

## Evidências e entrega

- Atualizar matriz dos 14 módulos com datas, contagens atuais e limitações reais.
- Separar tarefas técnicas concluídas das ações pessoais/de conta ainda pendentes.
- Preservar hashes das skills, limites dos gates e testes; revisão nos dois eixos,
  preflight integral, commit/push somente em Projeto-Academico-CRT.

Decisão do titular nesta retomada: não ativar OpenAI nem provedores de cotação agora.
Manter a implementação preparada, sem instalar chaves ou executar essas integrações.
Rotação de chaves antigas dos provedores continua não confirmada; JWT local já difere
da chave histórica. Não confundir integração desativada com credencial revogada.
