# Checklist de implementacao e aceite tecnico

- [x] Spec antes do codigo e RED dos contratos de login/perfis.
- [x] Migracao V2 preserva dados V1 e atribui USER a contas existentes.
- [x] USER/ADMIN, sessao minima, cadastro sem elevacao e autoridades recarregadas.
- [x] Administracao paginada por DTO e metricas somente ADMIN.
- [x] Bootstrap explicito, hash, trava, idempotencia e conflito de identidade.
- [x] Guard real, menu, destinos de login, erro/expiracao e tokens restritos a API.
- [x] Recuperacao ficticia removida por escolha explicita do titular.
- [x] Testes de isolamento financeiro tambem para ADMIN.
- [x] Verify, cobertura/diff, Angular, rastreabilidade e revisoes independentes.
- [x] CodeQL e gate complementar aprovados no escopo implementado.
- [ ] Aceite humano e criacao da identidade real do primeiro administrador.
- [ ] Configuracao externa de segredos, preflight integral e publicacao revisada.
