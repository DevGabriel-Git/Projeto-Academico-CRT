# Vocabulário do domínio
Usuário: titular autenticado; fronteira de isolamento de dados.
Corretora: empresa cadastrada pelo titular, consultada por CNPJ e opcionalmente CVM.
Ação: ativo/ticker, mercado BR/EUA, associado à corretora e ao titular.
Carteira: posição única por titular/corretora/ação, quantidade e preço médio decimal.
Compra: aumenta quantidade e recalcula média ponderada com HALF_UP e duas casas.
Venda: reduz quantidade, exige saldo e preserva média; preço omitido usa cotação.
Histórico: registro de operação confirmado junto com a posição na mesma transação.
CVM indisponível não comprova irregularidade; a flag somente registra resultado da consulta.
PII: CPF, e-mail e nome; nunca são labels de métrica ou conteúdo de log operacional.
