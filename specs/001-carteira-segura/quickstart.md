# Validação
Execute `./mvnw clean verify` e `python scripts/check_traceability.py` na raiz.
`CarteiraApiIT` cria dois titulares, cadastra posição do primeiro e confirma 404/[] para acesso do segundo, sem chamar provedores externos.
Depois execute o preflight contra a base real. A feature não possui aceite de publicação enquanto houver tarefa aberta.
