---
description: Proíbe blocos catch vazios
condition: "catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}"
globs: ["src/**/*.java"]
---
Nunca engula exceções. Trate, ou relance com contexto: throw new XxxException("mensagem com contexto", e).
