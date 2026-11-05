# Carteira segura

## Purpose
Proteger patrimônio e histórico por usuário e manter cálculo monetário consistente.

## Requirements

### Requirement: Operação de compra
O sistema SHALL calcular a posição e registrar um histórico para cada compra válida.

#### Scenario: Compra com histórico
- **GIVEN** uma carteira vazia e cotação 30,00
- **WHEN** o titular compra 10 unidades
- **THEN** a posição contém 10 unidades a 30,00 e histórico total 300,00

#### Scenario: Preço médio ponderado
- **GIVEN** 10 unidades a 10,00
- **WHEN** o titular compra 10 a 20,00
- **THEN** o saldo é 20 e o preço médio é 15,00

### Requirement: Operação de venda
O sistema SHALL usar a cotação quando não houver preço explícito e rejeitar venda sem saldo.

#### Scenario: Venda sem preço explícito
- **GIVEN** 10 unidades a 10,00 e cotação 30,00
- **WHEN** o titular vende 4 sem informar preço
- **THEN** o saldo é 6, a média permanece 10,00 e o histórico totaliza 120,00

#### Scenario: Saldo insuficiente
- **GIVEN** uma posição vazia
- **WHEN** o titular tenta vender 10
- **THEN** a operação é rejeitada sem salvar posição nem histórico

### Requirement: Autorização
O sistema SHALL permitir operações apenas em recursos do usuário autenticado e da corretora escolhida.

#### Scenario: Corretora de outro usuário
- **GIVEN** uma corretora pertencente a outra pessoa
- **WHEN** um usuário tenta operar nela
- **THEN** o recurso não é encontrado e nada é persistido

#### Scenario: Ação de outro usuário
- **GIVEN** uma ação pertencente a outra pessoa
- **WHEN** um usuário tenta operar nela
- **THEN** o recurso não é encontrado e nada é persistido

#### Scenario: Ação de outra corretora
- **GIVEN** ação e corretora do titular sem associação entre si
- **WHEN** o titular tenta operar combinando os IDs
- **THEN** a operação é rejeitada sem persistência

### Requirement: Integridade
O sistema SHALL rejeitar preço não positivo, cotação ausente e acesso a histórico alheio.

#### Scenario: Preço inválido
- **GIVEN** uma operação de compra
- **WHEN** o titular informa preço zero
- **THEN** a operação é rejeitada sem histórico

#### Scenario: Cotação ausente
- **GIVEN** uma ação sem cotação atual
- **WHEN** o titular opera sem preço explícito
- **THEN** a operação é rejeitada sem persistência

#### Scenario: Histórico de outro usuário
- **GIVEN** uma carteira privada
- **WHEN** outra pessoa consulta seu histórico
- **THEN** o recurso não é encontrado e o histórico não é consultado

### Requirement: Precisao monetaria
O sistema SHALL rejeitar preco explicito com mais de duas casas decimais, antes de persistir a operacao.

#### Scenario: Precisao monetaria nao suportada
- **GIVEN** uma compra autorizada de dez unidades
- **WHEN** o titular informa preco unitario 0.001
- **THEN** a resposta e 400 e nenhuma posicao ou historico e gravado

### Requirement: CSRF e autenticacao explicita
O sistema SHALL preservar a protecao CSRF para requisicoes com cookie sem Bearer; operacoes autenticadas por Bearer e login/cadastro JSON continuam acessiveis conforme seu contrato.

#### Scenario: Cookie sem Bearer nao dispensa CSRF
- **GIVEN** uma requisicao com cookie de sessao e sem cabecalho Bearer
- **WHEN** o cliente tenta operar a carteira
- **THEN** a resposta e 403 e nenhuma posicao e persistida
