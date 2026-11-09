---
description: DIP — proíbe instanciar colaboradores (repositórios, serviços, clientes) com new em código de produção
condition: "new\\s+(?!\\w*(Exception|Error)\\b)\\w*(Repository|Service|Client|Gateway|Dao)\\w*\\s*\\("
globs: ["src/main/**/service/*.java", "src/main/**/controller/*.java", "src/main/**/adapter/**/*.java"]
---
Não instancie colaboradores com new. Declare a dependência como uma interface no construtor e deixe o Spring injetar (DIP).
Exceções (objetos de valor, DTOs, records, coleções) podem usar new normalmente.

A composicao de dependencias em @Configuration/@Bean e uma fronteira legitima e fica fora deste gatilho.
