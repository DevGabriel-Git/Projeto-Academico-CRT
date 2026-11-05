# Pesquisa e decisoes

## Isolamento
Filtrar por ID apenas permitia IDOR. Escolha: consultas por ID + usuario autenticado, antes de qualquer gravacao. Alternativa rejeitada: buscar globalmente e confiar no ID recebido.

## Dinheiro
A coluna e decimal com duas casas. Alternativas: aceitar precisao arbitraria e arredondar; rejeitar mais de duas casas. Escolha: rejeitar entrada 0.001 com 400 antes de persistir; cotacao armazenada permanece decimal. Media usa HALF_UP.

## Falha e concorrencia
Posicao/historico compartilham transacao. @Version evita sobrescrever uma posicao carregada antes de outra operacao; UNIQUE impede duplicacao. Falha de historico reverte a posicao.

## Contrato
Records publicos sao montados na fronteira de aplicacao; regra de dominio continua independente da resposta HTTP. ProblemDetail preserva o campo message consumido pelo Angular. Ver ADR 004.

## Persistencia
Flyway V1 atende banco novo. Para banco legado, backup, comparacao de schema e baseline sao operacoes humanas; nunca limpar dados para obter um build verde.
