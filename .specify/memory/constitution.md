# Constituição da Corretora — 1.0.0
Ratificação proposta: 2026-11-05. Revisão humana pendente.
1. Dados financeiros são privados por usuário; toda operação exige autenticação e propriedade dos recursos.
2. Valores monetários usam decimal e regras de arredondamento explícitas; histórico e posição são atômicos.
3. Mudança exige especificação, teste verificável e revisão; cobertura mínima de 80% de linhas e ramos.
4. Nenhum segredo versionado, PII em log ou bypass de gate. Ferramenta ausente bloqueia publicação.
5. Preferir módulos coesos, construtores e abstrações com uso real; decisões irreversíveis exigem ADR.
6. CI usa mínimo privilégio; IA produz análise para revisão humana e não publica nem mescla automaticamente.
Emendas exigem justificativa, impacto em specs e aprovação do mantenedor.
