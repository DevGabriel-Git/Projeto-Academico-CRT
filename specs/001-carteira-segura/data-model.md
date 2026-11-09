# Modelo de dados
Usuario 1:N Corretora e Acao. Acao pertence a uma corretora e usuario.
Carteira e unica por (usuario, corretora, acao), com quantidade >=0, preco_medio decimal(38,2) e version otimista.
HistoricoCarteira pertence a carteira e usuario; registra tipo, quantidade positiva, preco_unitario decimal(38,2), valor_total e data.
Compra aumenta quantidade e recalcula media. Venda exige saldo, reduz quantidade e preserva media. Mesmo timestamp liga atualizacao e evento.
IDs nunca autorizam acesso por si. Usuario, senha e relacoes internas nao aparecem nos records publicos.
