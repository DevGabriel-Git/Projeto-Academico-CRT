---
description: Explicita conflitos e lacunas de contexto em vez de escolher em silêncio
alwaysApply: true
---
Se duas fontes de contexto se contradizem (rule, AGENTS.md, spec, skill, código existente, pedido),
ou se falta informação para decidir, NÃO escolha em silêncio. Pare e responda com um bloco CONFLITO:
as fontes (arquivo e linha), o que cada uma diz, duas ou três opções e a sua recomendação.
Ordem de precedência quando o pedido não diz outra coisa: pedido atual > rules > spec vigente
> AGENTS.md > skills > código existente. Não invente requisito para preencher lacuna.
