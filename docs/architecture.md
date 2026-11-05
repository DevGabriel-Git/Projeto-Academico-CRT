# Arquitetura e limites

Fluxo: Angular → controller → service → repository → PostgreSQL. Adaptadores chamam BrasilAPI, ViaCEP, Brapi e TwelveData.
Identidade vem do JWT validado e é resolvida por `UsuarioAtual`; recursos financeiros são privados por usuário.
`CarteiraService` concentra compra, venda e histórico em uma transação. `@Version` evita atualização perdida em uma carteira existente; a restrição única evita posições duplicadas em criação concorrente.
`CotacaoService` seleciona implementações reais da porta `AcaoApi`, mantendo regras de seleção em um lugar.
Timeout de conexão 3s e leitura 5s no RestTemplate compartilhado. Feign recebe limites equivalentes.

## Decisão 001 — estratégias de cotação

Data: 2026-11-05. Status: implementada.
Problema: cadastro e atualização repetiam seleção BR/EUA e dependiam de provedores concretos.
Alternativas: manter if duplicado; usar herança Template Method; selecionar implementações de `AcaoApi` por composição.
Escolha: composição com mapa pequeno em `CotacaoService` e injeção qualificada de dois provedores reais. Evita hierarquia e concentra seleção; novo mercado exige registro explícito.
Custo: configuração explícita do mapa. Não criar factories ou registries dinâmicos até existir necessidade.

## Decisão 002 — schema versionado

Flyway cria bancos novos; Hibernate apenas valida. H2 cobre testes rápidos; produção mantém PostgreSQL.
Banco legado exige backup e reconciliação manual de schema antes de baseline; nunca habilitar baseline automático nem aplicar V1 sobre dados existentes.
Não foi feita migração de dados do usuário nesta adequação.

## Revisão

ArchUnit impede entidade depender de serviço/controller/adaptador e impede repository depender de serviço/controller.
Dívida preservada e identificada: endpoints antigos ainda retornam entidades; avaliar DTOs públicos com contratos de frontend antes de alterar. Listas ainda não são paginadas. CVM indisponível continua significando `validadaNaCvm=false`; isso não prova irregularidade da corretora.
