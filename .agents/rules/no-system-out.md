---
description: Proíbe System.out.println em código de produção
condition: "System\\.out\\.println"
globs: ["src/main/**/*.java"]
---
Use um logger (SLF4J) em vez de System.out.println.
