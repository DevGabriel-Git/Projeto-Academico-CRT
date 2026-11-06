# Frontend interativo

Implementação da spec `specs/003-frontend-interativo/spec.md`, sobre a base
`8a52d0768f770acf581608aec954024d3602a44a`.

## Comportamento entregue

- Aparência clara, escura ou acompanhando o sistema, com preferência persistente.
- Navegação responsiva, busca de páginas, atalhos e opção de ocultar valores.
- Dashboard com indicadores por moeda, volume mensal real de operações e distribuição
  por ativo/corretora. Volume não representa rentabilidade; não há câmbio fictício.
- Carteira com pesquisa, filtros, ordenação, detalhes e painel de compra/venda com
  prévia, revisão e proteção contra envio duplicado. O backend continua autoritativo.
- Ativos com favoritos da sessão, catálogo, cadastro e atualização de cotação.
- Corretoras pesquisáveis, cadastro e confirmação de exclusão.
- Histórico com período, datas, moeda, tipo, paginação e CSV de todos os resultados
  filtrados. CSV protege células de texto contra fórmulas e informa que exporta valores completos.
- Administração preserva autorização e paginação no servidor; pesquisa e filtro
  indicam explicitamente que abrangem somente a página carregada.
- Troca de sessão limpa dados em memória; favoritos e privacidade não atravessam
  sessões. Recuperação de senha permanece explicitamente indisponível.

## Evidências locais em 2026-11-06

- ESLint e TypeScript: aprovados.
- Vitest: 51 testes aprovados em 14 arquivos. A cobertura instrumentada dos sete
  arquivos críticos é 92,41% de linhas e 88,43% de branches; não é cobertura global
  da interface. Limites existentes de 80% por arquivo foram preservados.
- Build de produção: 442,93 kB iniciais, abaixo do orçamento de aviso de 500 kB.
- CodeQL JavaScript/TypeScript: 51 de 51 arquivos analisados e gate SARIF aprovado;
  relatório Java anterior preservado, pois o backend não mudou. Gitleaks aprovou
  o intervalo de commits e o snapshot publicável sem novos segredos.
- Conferência visual em desktop e viewport 390 × 844: temas claro/escuro,
  navegação móvel, filtros, moeda, privacidade e CSV. Sem transbordamento horizontal
  da página; tabelas têm rolagem própria.
- Capturas em `reports/frontend/` usam exclusivamente dados fictícios de um
  servidor local de teste ignorado pelo Git. Não representam contas ou operações reais.
- Revisão independente em dois eixos: Spec e Standards aprovados. Achados
  corrigidos: falsos zeros durante carregamento/erro, erro do histórico parecendo
  vazio, arredondamento HALF_UP da prévia e validação duplicada de cotações.
- A prévia usa centavos inteiros e teste do caso 10,075 → 10,08. O registro definitivo
  mantém o cálculo BigDecimal do backend.

Os relatórios executáveis ficam em `reports/` (ignorado pelo Git). A autorização
existente cobre commit local; publicação remota continua sujeita ao preflight
completo descrito em `AGENTS.md`.
