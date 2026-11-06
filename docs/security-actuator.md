# Triagem Semgrep: Actuator

Data 2026-11-06. Responsavel: mantenedor do projeto (DevGabriel-Git).
Regra: `java.spring.security.audit.spring-actuator-non-health-enabled.spring-actuator-dangerous-endpoints-enabled`.

O scanner alerta sobre qualquer exposicao alem de health, sem analisar a autorizacao
da SecurityFilterChain. Removemos info, que nao e necessario. Prometheus e necessario
para o modulo 13 e agora exige JWT com perfil ADMIN: somente health e publico. Nao ha env, beans, heapdump, loggers ou shutdown expostos.

Uma supressao inline se aplica apenas a essa regra nessa unica propriedade; nao ha
allowlist global. `CarteiraApiIT.metricasExigemTokenEInfoPermaneceDesativado` verifica
401 sem JWT/com JWT invalido, 403 com USER e 200 com ADMIN, ausencia do token/email nas metricas
e 404 para info. O teste existente verifica 404 para env. Sao dados operacionais
agregados; somente administradores conseguem consultar metricas. A separacao de
operadores e titulares foi implementada conforme pedido adicional em 06/11.

Reavaliar a decisao ate 2027-02-06 ou antes se mudar SecurityConfig, labels, bind de
management, endpoints expostos ou politica de papeis. Nao e aprovacao de publicacao.
