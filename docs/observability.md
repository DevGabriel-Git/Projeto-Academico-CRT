# Desempenho e observabilidade

Actuator expõe somente health, info e prometheus. Detalhes de saúde ficam ocultos; health é público, métricas exigem autenticação. Produção usa porta de gestão 9090, que deve permanecer interna. Logs ECS no perfil prod não devem conter tokens/CPF.
Métricas HTTP têm histograma por rota normalizada. Objetivos iniciais de laboratório: erro <1%, p95 <500 ms, 5 usuários por 30s.
`k6 run -e BASE_URL=http://localhost:8080 -e TOKEN=<token-de-teste> performance/carteira.js` usa somente leitura e reprova limites violados.
Antes e depois de otimizar, preservar JSON do k6, dataset, hardware e commit; não usar medição sem ambiente comparável.
Índices por usuário/carteira e EntityGraph evitam carga tardia na serialização. Histórico é buscado por endpoint próprio e não embutido na posição.
Pendências: paginação das listas, traces OpenTelemetry/JDBC, dashboard Prometheus/Grafana, execução de carga antes/depois e teste de cardinalidade. Não há resultado de desempenho medido nesta adequação.
