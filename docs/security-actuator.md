# Triagem Semgrep: Actuator

Data 2026-11-06. Responsavel: mantenedor do projeto (DevGabriel-Git).
Regra: `java.spring.security.audit.spring-actuator-non-health-enabled.spring-actuator-dangerous-endpoints-enabled`.

O scanner alerta sobre qualquer exposicao alem de health, sem analisar a autorizacao
da SecurityFilterChain. Removemos info, que nao e necessario. Prometheus e necessario
para o modulo 13 e permanece protegido por JWT: somente health e publico, qualquer outra
rota exige autenticacao. Nao ha env, beans, heapdump, loggers ou shutdown expostos.

Uma supressao inline se aplica apenas a essa regra nessa unica propriedade; nao ha
allowlist global. `CarteiraApiIT.metricasExigemTokenEInfoPermaneceDesativado` verifica
401 sem JWT/com JWT invalido, 200 com JWT valido, ausencia do token/email nas metricas
e 404 para info. O teste existente verifica 404 para env. Sao dados operacionais
agregados; usuarios autenticados conseguem consultar metricas, limite desta autorizacao.
Caso seja necessario separar operadores de titulares, adicionar identidade/role de
operacao e atualizar os testes antes de expor o servico em producao.

Reavaliar a decisao ate 2027-02-06 ou antes se mudar SecurityConfig, labels, bind de
management, endpoints expostos ou politica de papeis. Nao e aprovacao de publicacao.
