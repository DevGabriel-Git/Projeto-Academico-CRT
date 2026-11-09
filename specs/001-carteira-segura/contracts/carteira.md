# Contrato HTTP
`POST /carteira/operar`, Authorization Bearer, JSON com corretoraId, acaoId, tipo COMPRA|VENDA, quantidade positiva e precoUnitario opcional positivo.
200: posição atualizada. 400: entrada inválida ou saldo insuficiente. 401: autenticação inválida. 404: recurso ausente ou alheio.
`GET /carteira`, `/carteira/corretora/{id}`: somente posições próprias.
`GET /carteira/{id}`, `/carteira/{id}/historico`: 404 para recurso alheio.

Preco explicito admite no maximo duas casas decimais. Erros usam application/problem+json (RFC 9457), mantendo message para compatibilidade. Cookie sem Bearer nao autentica a API e nao dispensa CSRF.
