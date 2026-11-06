# Perfis de acesso da corretora

Pedido adicional do titular em 06/11/2026: login de administrador e usuario.
O catalogo de referencia nao possui autenticacao; esta capability adapta os principios
dos modulos 3, 7, 11 e 13 ao dominio da corretora, sem atribuir ao curso requisitos novos.

## Contrato

- Login unico por email ou CPF; resposta inclui perfil USER ou ADMIN vindo do banco.
- Cadastro publico sempre USER, mesmo com perfil ADMIN injetado no JSON. Sem senha fixa.
- Usuario existente recebe USER por migracao Flyway V2, sem alterar V1 aplicada.
- GET /auth/me autenticado retorna somente id, nome, email e perfil do proprio titular.
- /admin/** exige ADMIN: anonimo401, USER403, ADMIN200. JWT nao carrega permissao confiavel:
  autoridades sao recarregadas do banco a cada requisicao. Rebaixamento vale no proximo acesso.
- GET /admin/usuarios retorna DTOs paginados de id/nome/email/perfil, ordenados por id;
  pagina >=0, tamanho1..100; nenhum CPF, hash, token ou dado financeiro de terceiros.
- Prometheus exige ADMIN; health permanece publico. Info/env continuam desativados.
- Administrador continua sujeito ao isolamento de titular nas operacoes financeiras.
- Bootstrap explicito em profile bootstrap-admin, com nome/email/CPF/senha do ambiente.
  Somente cria o primeiro ADMIN, BCrypt, transacional, sem logs de credenciais;
  idempotente para o mesmo admin, sem reset de senha e sem promover conta USER existente.
  Campos invalidos ou conflito falham com mensagem fixa, sem imprimir valores.
- Angular tem rota /admin protegida por consulta real a /auth/me, menu por perfil e lista
  paginada. Login ADMIN vai a /admin; USER vai ao dashboard. Alterar localStorage nao
  concede autorizacao. Erros 401/403 encerram/negam a navegacao de forma clara.

## Aceite

Testes de integracao para cadastro malicioso, login por email/CPF de ambos os perfis,
401/403/200 em admin/metricas, pagina fora do limite, minimizacao de DTO, /auth/me,
mudanca de papel no banco e isolamento financeiro. Testes do bootstrap cobrem criacao,
hash, idempotencia, conflito e segredo invalido. Frontend cobre guard com API e sessao
malformada, redirecionamento por perfil e tela administrativa. Cobertura >=80% mantida.
