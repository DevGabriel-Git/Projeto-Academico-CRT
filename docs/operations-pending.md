# Operacoes que nao podem ser atestadas somente com codigo
- Revogar/rotacionar credenciais antigas encontradas em nove ocorrencias do historico; ver security-findings.md. Nenhum valor foi reproduzido nem o historico foi reescrito.
- Concluir Dependency-Check/preflight integral antes da publicacao. NVD_API_KEY foi configurada fora do Git e validada em 2026-11-09; triagem em security-nvd-2026-11-09.md.
- Gate complementar executado e aprovado com Docker. ZAP baseline health executado sem alertas; ampliar DAST aos fluxos autenticados antes de atestar cobertura geral.
- Destino OpenAI e envio do diff autorizados em 2026-11-06. Configurar o secret OPENAI_API_KEY no GitHub e executar o workflow manual apos publicacao revisada; ver ci-agent-activation.md. Nenhuma chamada real foi feita localmente.
- Configurar branch protection/CODEOWNERS no GitHub e revisar o diff antes de push/PR.
- Conciliar e migrar PostgreSQL legado apenas depois de backup e revisao do schema.
- Ratificar a constituicao e realizar os exercicios conceituais da disciplina. Instalacao de ferramentas nao comprova aprendizado nem TDD retroativo.

- Escolher a identidade real do primeiro administrador e executar tools/start_with_admin.ps1 com o ambiente local configurado. Nenhuma conta/senha real foi criada nos testes. Recuperacao por e-mail foi removida por escolha do titular; a tela informa indisponibilidade.
