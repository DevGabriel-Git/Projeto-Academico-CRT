# Desempenho e observabilidade

Actuator expõe somente health e prometheus; info esta desabilitado. Detalhes de saúde ficam ocultos; health é público, metricas exigem ADMIN. Produção usa porta de gestão 9090, que deve permanecer interna. Logs ECS no perfil prod não devem conter tokens/CPF.
Métricas HTTP têm histograma por rota normalizada. Objetivos iniciais de laboratório: erro <1%, p95 <500 ms, 5 usuários por 30s.
`k6 run -e BASE_URL=http://localhost:8080 -e TOKEN=<token-de-teste> performance/carteira.js` usa somente leitura e reprova limites violados.
Antes e depois de otimizar, preservar JSON do k6, dataset, hardware e commit; não usar medição sem ambiente comparável.
Índices por usuário/carteira e EntityGraph evitam carga tardia na serialização. Histórico é buscado por endpoint próprio e não embutido na posição.
OpenTelemetry/JDBC foram adicionados com starter Boot 4 e datasource-micrometer 2.0.1. Perfil observability envia spans OTLP; metricas continuam via Prometheus (push OTLP desabilitado por padrao).
Smoke executado: 5 usuarios/30s, 9.954 requisicoes, erro 0%, p95 31,89 ms (10/11/2026); receptor OTLP confirmou spans HTTP e JDBC em H2 isolado, com usuario ficticio e carteira vazia. Isso nao mede desempenho de producao nem ganho antes/depois.
LGTM esta preparado em observability/docker-compose.yml, e ainda nao foi executado como dashboard nesta entrega. Pendencias: paginacao, dashboard e comparacao com dataset realista/mesmo ambiente.
