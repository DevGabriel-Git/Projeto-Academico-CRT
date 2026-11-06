# Operacoes que nao podem ser atestadas somente com codigo
- Revogar/rotacionar credenciais antigas encontradas em nove ocorrencias do historico; ver security-findings.md. Nenhum valor foi reproduzido nem o historico foi reescrito.
- Disponibilizar NVD_API_KEY fora do Git e executar Dependency-Check/preflight integral.
- Gate complementar executado e aprovado com Docker. ZAP baseline health executado sem alertas; ampliar DAST aos fluxos autenticados antes de atestar cobertura geral.
- Destino OpenAI e envio do diff autorizados em 2026-11-06. Configurar o secret OPENAI_API_KEY no GitHub e executar o workflow manual apos publicacao revisada; ver ci-agent-activation.md. Nenhuma chamada real foi feita localmente.
- Configurar branch protection/CODEOWNERS no GitHub e revisar o diff antes de push/PR.
- Conciliar e migrar PostgreSQL legado apenas depois de backup e revisao do schema.
- Ratificar a constituicao e realizar os exercicios conceituais da disciplina. Instalacao de ferramentas nao comprova aprendizado nem TDD retroativo.
