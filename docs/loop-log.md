# Registro de verificação — 2026-11-05

- Baseline: teste original falhou ao tentar PostgreSQL local. Correção: perfil test H2 isolado e Flyway; contexto iniciou.
- Angular: teste gerado esperava título inexistente. Substituído por comportamento de navegação/sessão; 3 testes passaram e build gerou ~404 kB.
- Ambiente: sandbox bloqueou cache Vitest e attach Mockito; execução com acesso necessário resolveu o bloqueio. Nenhum gate foi afrouxado.
- Integração: MockMvc atravessa autenticação, controller, serviço e banco real H2; não depende de abrir socket local.
- Serialização: desativar OSIV revelou coleções tardias; carregamento explícito e histórico separado corrigem a fronteira de resposta.

Este registro não comprova RED anterior à implementação: testes foram adicionados durante a adequação de legado. Para próximas mudanças, preservar cada RED/Green real.
