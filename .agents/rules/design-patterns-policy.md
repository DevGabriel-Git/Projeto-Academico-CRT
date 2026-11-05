---
description: Política de uso de padrões de projeto
alwaysApply: true
---
- Não introduza padrão de projeto sem um problema concreto demonstrado no código atual.
- Uma interface com uma única implementação só é permitida em fronteiras externas
  (banco, HTTP, fila, provedor de pagamento).
- Antes de implementar um padrão: nomeie o problema, compare dois candidatos
  (skill gof-patterns, seção "When NOT to Use") e a alternativa sem padrão. Aguarde aprovação.
- Nomes pelo domínio, nunca pelo padrão (proibido: *StrategyImpl, *FactoryImpl, *Manager).
