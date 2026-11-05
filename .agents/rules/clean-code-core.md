---
description: Regras essenciais de Clean Code do projeto
alwaysApply: true
---
- Nomes revelam intenção; sem abreviações (qtd, tmp, val) nem nomes genéricos (Manager, Helper, Util, data).
- Funções fazem uma coisa, com no máximo 30 linhas e 3 parâmetros; acima disso, extraia ou agrupe em objeto.
- Sem argumentos booleanos de controle: crie duas funções com nomes claros.
- Cláusulas de guarda em vez de if aninhado; no máximo 2 níveis de aninhamento.
- Sem números mágicos: constantes com nome.
- Nunca retorne null: use Optional ou coleção vazia.
- Nunca engula exceções; relance com contexto e causa.
- Comentários explicam o porquê, nunca o quê. Sem código comentado.
- Não altere arquivos fora do escopo da tarefa.
