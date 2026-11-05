# Operacoes que nao podem ser atestadas somente com codigo
- Revogar/rotacionar credenciais antigas encontradas em nove ocorrencias do historico; ver security-findings.md. Nenhum valor foi reproduzido nem o historico foi reescrito.
- Disponibilizar NVD_API_KEY fora do Git e executar Dependency-Check/preflight integral.
- Iniciar Docker para executar os containers e a auditoria complementar Semgrep/OSV/ZAP em laboratorio.
- Configurar AGENT e provedor de destino e aprovar explicitamente a exportacao do diff antes de ativar qualquer agente externo. O workflow atual so prepara um pacote no proprio GitHub e nao chama modelo.
- Configurar branch protection/CODEOWNERS no GitHub e revisar o diff antes de push/PR.
- Conciliar e migrar PostgreSQL legado apenas depois de backup e revisao do schema.
- Ratificar a constituicao e realizar os exercicios conceituais da disciplina. Instalacao de ferramentas nao comprova aprendizado nem TDD retroativo.
