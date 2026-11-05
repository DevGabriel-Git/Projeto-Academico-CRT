---
description: LSP — alerta para UnsupportedOperationException em código de produção
condition: "throw\\s+new\\s+UnsupportedOperationException"
globs: ["src/main/**/*.java"]
---
Lançar UnsupportedOperationException ao implementar uma interface ou sobrescrever um método costuma violar LSP
(o subtipo não cumpre o contrato do tipo base) e ISP (a interface é grande demais).
Avalie dividir a interface ou trocar herança por composição. Se for intencional (ex.: coleção imutável), justifique no Javadoc.
