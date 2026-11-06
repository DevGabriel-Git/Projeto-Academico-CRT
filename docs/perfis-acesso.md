# Login de administrador e usuario

Ambos entram em `/login` por e-mail ou CPF. A conta autenticada determina o perfil;
nao existe seletor que permita elevar privilegios. ADMIN vai para `/admin`, USER
para `/dashboard`. Cadastro publico (`/register`) cria somente USER.

O administrador consulta usuarios paginados (nome, e-mail, perfil) e metricas Prometheus.
Nao visualiza carteiras, historicos ou operacoes de outros titulares. A tela administrativa
e de consulta; nao existe endpoint publico para promover perfis nem resetar senhas.
Usuario comum recebe403 na API administrativa e nas metricas. Sem login recebe401.
O backend consulta o papel no banco a cada requisicao; alterar localStorage nao o muda.

## Primeiro administrador

Configure o ambiente normal descrito no README (JWT_SECRET e chaves dos provedores).
Em banco novo/local ou banco Flyway ja reconciliado, execute na raiz do projeto:

```powershell
.\tools\start_with_admin.ps1
```

O script pede nome, e-mail, CPF e senha com entrada oculta; nao grava credenciais.
Inicia `dev,bootstrap-admin`, aplica V2 no H2 de desenvolvimento e cria o primeiro admin
com BCrypt. Depois de parar o servidor, restaura o ambiente anterior. Na proxima execucao,
use apenas profile dev. A criacao e idempotente e nao redefine a senha existente.
Nao use esse procedimento sobre banco legado antes de backup/reconciliacao.

Linux/IDE: configurar ADMIN_NAME, ADMIN_EMAIL, ADMIN_CPF, ADMIN_PASSWORD fora do Git e
iniciar uma vez com os profiles apropriados e bootstrap-admin. Nao passar senha como
argumento de linha de comando. Sem profile explicito, o bootstrap nunca e executado.
Nome/email/CPF invalidos ou senha <12 caracteres/>72 bytes falham sem imprimir valores.
Uma trava de banco serializa o bootstrap concorrente. Conta USER existente nunca e
promovida automaticamente; segundo ADMIN por bootstrap e rejeitado.

Nenhuma conta/senha de producao foi criada silenciosamente durante os testes. Os testes
usam contas ficticias e bancos efemeros; a escolha da identidade real e feita localmente.

## Contratos

- POST /auth/login e /auth/register: token, nome, email e perfil.
- GET /auth/me: id, nome, email e perfil do proprio usuario, sem CPF/hash/token.
- GET /admin/usuarios?page=0&size=20: items, page, size, totalElements, totalPages.
  Ordenacao por id, size1..100, page>=0. Parametros invalidos retornam400.
- GET /actuator/prometheus: somente ADMIN. GET /actuator/health: publico.

Migracao V2 adiciona USER as contas existentes e preserva V1. Testes cobrem cadastro
com perfil injetado, 401/403/200, login por email/CPF, papel recarregado, DTO minimo,
paginacao, bootstrap e isolamento patrimonial, alem do guard Angular consultando a API.

Fontes: [autorizacao Spring Security](https://docs.spring.io/spring-security/reference/7.0/servlet/authorization/authorize-http-requests.html)
e [configuracao externa Spring Boot](https://docs.spring.io/spring-boot/reference/features/external-config.html).
O catalogo didatico nao possui autenticacao; esta extensao vem do pedido adicional do titular.

## Recuperacao de senha

Por escolha explicita do titular em 06/11/2026, a simulacao de envio foi removida.
A rota /forgot-password informa indisponibilidade e oferece retorno ao login; nao pede
CPF/e-mail, nao apresenta formulario de envio e nao afirma ter enviado mensagem.
SMTP e recuperacao automatica ficam fora desta entrega, conforme a escolha.
