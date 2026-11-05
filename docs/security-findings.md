# Credenciais no historico Git

Varredura Gitleaks 8.30.1 em 2026-11-05: 9 ocorrencias historicas. Valores omitidos. A presenca no historico exige tratar as credenciais como expostas, mesmo removidas do HEAD.

| Arquivo | Linha | Commit | Regra |
|---|---:|---|---|
| `src/main/resources/application.properties` | 2 | `3e577b99e0259f40bfe63758f2946817f2c7c3ec` | generic-api-key |
| `src/main/resources/application.properties` | 4 | `3e577b99e0259f40bfe63758f2946817f2c7c3ec` | generic-api-key |
| `src/main/resources/application.properties` | 2 | `762120d21c37722265c5ef36506ed4191ad6303a` | generic-api-key |
| `.env` | 1 | `9cb687c454c384a0adaad42f80e8be6b4556d1df` | generic-api-key |
| `src/main/resources/application.properties` | 4 | `762120d21c37722265c5ef36506ed4191ad6303a` | generic-api-key |
| `.env` | 3 | `9cb687c454c384a0adaad42f80e8be6b4556d1df` | generic-api-key |
| `.env` | 4 | `9cb687c454c384a0adaad42f80e8be6b4556d1df` | generic-api-key |
| `src/main/resources/application.properties` | 2 | `3838511ed6d35de7d9c0a44bac95455c3261173c` | generic-api-key |
| `src/main/resources/application.properties` | 4 | `3838511ed6d35de7d9c0a44bac95455c3261173c` | generic-api-key |

Acao do titular: revogar/rotacionar as credenciais afetadas nos provedores, atualizar somente o ambiente local/gerenciador de segredos e verificar uso indevido. Reescrever historico exige coordenacao com colaboradores e copias existentes; nao foi executado. Nunca publicar os relatorios brutos nem valores dos segredos.

As duas chaves fixas exclusivas dos testes novos foram substituidas por valores aleatorios em tempo de execucao, sem allowlist de scanner.
