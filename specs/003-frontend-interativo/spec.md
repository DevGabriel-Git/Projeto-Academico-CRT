# Experiencia interativa da CRT

Pedido do titular: aplicar o redesign sugerido, mais interacoes e modos black/white.
Preservar os contratos/autorizacao da API e a recuperacao de senha indisponivel.

- Tema claro/escuro/sistema persistido; contraste, foco visivel, movimento reduzido e mobile.
- Shell com navegacao responsiva, menu ADMIN restrito, busca de paginas e privacidade dos valores.
- Dashboard com custo/valor estimado/resultado nao realizado, separado por moeda, sem cambio ficticio.
  Cotacao ausente nao vira prejuizo nem patrimonio zero: indicar indisponibilidade.
- Distribuicao interativa por ativo/corretora e movimentacao real por periodo (compras/vendas),
  nunca grafico de rentabilidade inventado. Carregamento/erro/vazio e repetir consulta explicitos.
- Carteira com busca, filtros, ordenacao, detalhes e operacao em painel lateral com previa,
  validacao de quantidade/preco/saldo e confirmacao antes do POST. Sem duplicar envio.
- Ativos com busca/mercado/favoritos locais, cadastro e atualizacao real de cotacao.
- Corretoras com busca, cadastro real e confirmacao de exclusao, sem alert/confirm do browser.
- Historico com busca/tipo/periodo/moeda, totais e CSV somente dos registros filtrados,
  com aspas/escape e protecao contra formulas. Erros parciais nao parecem historico vazio.
- Preferencias nao podem vazar dados entre sessoes; nada de dados pessoais em logs.
- Testes significativos para calculos, mistura de moedas, cotacoes ausentes, filtros,
  tema persistido, previa/confirmacao, erro e exportacao; manter gates existentes.
- Verificar visualmente desktop/mobile, ambos os temas, estados vazios e interacoes.
