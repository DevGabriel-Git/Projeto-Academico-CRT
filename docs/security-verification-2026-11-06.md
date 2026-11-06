# Validacao complementar de seguranca

Boot 4.0.9 e Cloud 2025.1.4 foram conferidos nos anuncios oficiais:
[Boot](https://spring.io/blog/2026/10/23/spring-boot-4-0-9-available-now/),
[Cloud e compatibilidade](https://spring.io/blog/2026/10/23/spring-cloud-2025-1-4-has-been-released/).
OTel BOM 1.67.0 corrige os avisos do OSV e mantem o conjunto alinhado.

Primeiro OSV: 87 ocorrencias pacote/vulnerabilidade. Depois: 170 pacotes encontrados,
zero resultados, exit 0. Gate complementar completo (`scripts/security_gate.sh` desde
1d36936efa7098ce309b042cf3a8bcd720891a87) aprovado: Semgrep 1.178.0, Gitleaks 8.30.1,
FindSecBugs 1.14.0/SpotBugs 4.10.4.1, CycloneDX 2.9.1, OSV 2.6.0. Uma triagem
Semgrep de Prometheus em security-actuator.md; nao altera baseline CodeQL nem SCA.
Fallback Docker monta somente fontes/regras/relatorios: inventario do workspace com
caches de ferramentas travou na primeira tentativa e foi interrompido, sem alegar sucesso.

Teste Actuator: primeira tentativa sem compilar o novo teste executou zero testes e foi
descartada. Depois de test-compile, um teste falhou pelo motivo correto (info esperado404,
obtido200). Removido info, verify completo passou com 43 unitarios +12 integracoes,
incluindo JWT invalido/ausente401 e valido200 nas metricas. Cobertura preservada.

Carga/OTLP depois de atualizar dependencias: 5VUs/30s, 3492 requisicoes, zero erros,
p95 96,84494ms, 38496 spans HTTP/JDBC. H2 efemero, um titular ficticio, carteira vazia.
Auditorias simultaneas; nao comparar com a rodada anterior como regressao/melhoria.

ZAP passivo: script smoke_dast.py, rede interna Docker sem portas publicadas, H2 em
memoria, credenciais aleatorias, cleanup em finally. Scanner digest
9624669db72f54d86c4b46a7064518bd9bf79d8c61a4c31befa9923489f328af;
runtime Temurin21 digest 0b99b3376fbb50dbf9c0af8535fdd5b8eb0d3fdfc8b1e4967f383b6919f6901a.
Exit0, zero alertas, 62 regras PASS. Escopo estrito: health anonimo. Spider da raiz
retornou401 e a metrica agregada de falhas de rede foi53%; NAO e aprovacao DAST geral.
Fluxos autenticados e endpoints nao exercitados permanecem fora desta evidencia.

Revisao independente: Standards encontrou main longo e cinco parametros em helpers;
extraidos helpers de ate22linhas e no maximo3parametros. Spec sem desvio concreto;
salientou limites DAST e necessidade de GREEN, agora registrado acima.
Relatorios locais em reports/ (ignorados no Git). NVD_API_KEY ainda ausente:
preflight integral/publicacao continuam bloqueados. Nenhum push ou PR foi feito.
