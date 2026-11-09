---
description: Proíbe Singleton implementado à mão; no Spring, um @Component/@Service já é único por padrão
condition: "private\\s+static\\s+(final\\s+)?\\w+\\s+(instance|INSTANCE)\\b|static\\s+\\w+\\s+getInstance\\s*\\("
globs: ["src/main/**/*.java"]
---
Não implemente Singleton manualmente (campo static instance / getInstance()).
Em Spring, anote a classe com @Component/@Service: o contêiner cria uma única instância
(escopo singleton) e a injeta. Se o objeto não pode ser um bean, discuta com o usuário antes.
