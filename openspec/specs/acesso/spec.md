# Perfis de acesso

## Purpose
Separar administrador e titular, preservando patrimonio privado e criacao segura do primeiro admin.
Spec inicial anterior ao codigo: specs/002-perfis-acesso/spec.md.

## Requirements

### Requirement: Cadastro publico sem elevacao
O sistema SHALL criar somente USER no cadastro publico, mesmo se o cliente enviar ADMIN.

#### Scenario: Cadastro publico sem elevacao
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Administracao exige perfil
O sistema SHALL retornar401 para anonimo e403 para USER em /admin/usuarios.

#### Scenario: Administracao exige perfil
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Sessao minima do titular
O sistema SHALL exigir autenticacao em /auth/me e retornar somente os dados do proprio titular sem CPF/hash.

#### Scenario: Sessao minima do titular
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Login do usuario por email e CPF
O sistema SHALL autenticar USER por email ou CPF e informar o papel do banco.

#### Scenario: Login do usuario por email e CPF
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Listagem administrativa limitada
O sistema SHALL retornar DTOs paginados sem CPF/hash/token para ADMIN, rejeitando pagina negativa e tamanho fora de1..100.

#### Scenario: Listagem administrativa limitada
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Papel consultado a cada acesso
O sistema SHALL retirar privilegios no proximo acesso apos mudar o papel no banco, mesmo com JWT ainda valido.

#### Scenario: Papel consultado a cada acesso
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Login do administrador por email e CPF
O sistema SHALL autenticar ADMIN por email ou CPF e informar ADMIN na resposta.

#### Scenario: Login do administrador por email e CPF
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Bootstrap idempotente e hash
O sistema SHALL criar o primeiro ADMIN com BCrypt e preservar sua senha ao repetir o bootstrap.

#### Scenario: Bootstrap idempotente e hash
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Bootstrap nao promove titular
O sistema SHALL rejeitar bootstrap que tente promover USER existente.

#### Scenario: Bootstrap nao promove titular
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Bootstrap nao cria segundo admin
O sistema SHALL rejeitar bootstrap de outro ADMIN se ja existe um administrador.

#### Scenario: Bootstrap nao cria segundo admin
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Bootstrap respeita CPF unico
O sistema SHALL rejeitar CPF ja cadastrado sem alterar contas.

#### Scenario: Bootstrap respeita CPF unico
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Bootstrap protege senha invalida
O sistema SHALL rejeitar segredo ausente, curto ou acima de72bytes sem reproduzir valores.

#### Scenario: Bootstrap protege senha invalida
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Bootstrap somente explicito
O sistema SHALL executar bootstrap somente com profile bootstrap-admin explicito.

#### Scenario: Bootstrap somente explicito
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Administrador nao acessa patrimonio alheio
O sistema SHALL preservar isolamento financeiro por titular tambem para ADMIN.

#### Scenario: Administrador nao acessa patrimonio alheio
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Metricas somente administrativas
O sistema SHALL exigir ADMIN no Prometheus, negar USER, preservar health publico e info desativado.

#### Scenario: Metricas somente administrativas
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Migracao conserva papel minimo
O sistema SHALL preservar conta existente na V1 e atribuir USER ao migrar para V2.

#### Scenario: Migracao conserva papel minimo
- **WHEN** o fluxo correspondente e solicitado
- **THEN** o contrato de acesso e persistencia descrito no requisito e respeitado

### Requirement: Autorizacao preservada em HTTP real
O sistema SHALL distinguir401,403 e200 em HTTP real, sem converter acesso negado em falta de login.

#### Scenario: Autorizacao preservada em HTTP real
- **WHEN** anonimo, USER e ADMIN consultam a administracao no servidor real
- **THEN** recebem401,403 e200 respectivamente

### Requirement: Novo login ignora token antigo
O sistema SHALL autenticar novas credenciais validas mesmo que exista um Bearer antigo na chamada publica de login.

#### Scenario: Novo login ignora token antigo
- **WHEN** credenciais validas sao enviadas com um Bearer invalido em POST /auth/login
- **THEN** o login e concluido com um novo token e o perfil correto

### Requirement: Bootstrap exige mesma identidade
O sistema SHALL rejeitar CPF divergente mesmo quando o email informado pertence a ADMIN existente.

#### Scenario: Bootstrap exige mesma identidade
- **WHEN** o bootstrap repete email de ADMIN com CPF diferente
- **THEN** falha com mensagem fixa sem alterar contas

### Requirement: Corretoras e ativos privados nao revelam existencia
O sistema SHALL responder404 para consulta, exclusao ou atualizacao de recursos de outro titular, incluindo quando o solicitante e ADMIN.

#### Scenario: Corretoras e ativos privados nao revelam existencia
- **WHEN** USER ou ADMIN consulta corretora por id/CNPJ, ativo por id/ticker, exclui corretora ou atualiza cotacao pertencente a outra pessoa
- **THEN** recebe404 e os registros e a cotacao permanecem inalterados

### Requirement: Consulta de corretora preserva colecoes e privacidade
O sistema SHALL carregar os ativos da corretora do titular e retornar apenas DTOs publicos.

#### Scenario: Consulta de corretora preserva colecoes e privacidade
- **WHEN** o titular lista ou consulta por id/CNPJ uma corretora com ativos
- **THEN** recebe200 com os ativos, sem senha ou CPF e sem falha de colecao nao carregada
