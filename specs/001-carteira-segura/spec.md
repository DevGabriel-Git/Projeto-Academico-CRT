# Feature 001 — Carteira privada e consistente

## P1 — Operar patrimônio próprio
Como titular, quero comprar e vender apenas meus ativos, com saldo, preço médio e histórico coerentes.
FR-001: Recursos de outra pessoa devem ser inacessíveis, mesmo com IDs conhecidos.
FR-002: Compra usa média ponderada com duas casas e arredondamento meio para cima.
FR-003: Venda mantém a média; sem preço explícito usa a cotação atual.
FR-004: Quantidade e preço são positivos; venda acima do saldo é rejeitada.
FR-005: Histórico e posição são persistidos ou revertidos juntos.
SC-001: Cenários da spec vigente têm teste rastreável; suíte HTTP/MVC cobre autenticação e IDOR.
SC-002: Nenhuma gravação em operação rejeitada; build bloqueia abaixo de 80%.

Critérios detalhados e valores de aceitação: `../../openspec/specs/carteira/spec.md`.
Este artefato é autoral no formato do exercício; não foi gerado pela CLI Spec Kit.
