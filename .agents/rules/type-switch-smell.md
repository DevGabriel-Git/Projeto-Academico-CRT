---
description: Alerta para cadeias de instanceof, sinal de que Strategy, State ou polimorfismo cabem melhor
condition: "else\\s+if\\s*\\(\\s*\\w+\\s+instanceof"
globs: ["src/main/**/*.java"]
---
Cadeia de if/else com instanceof detectada. Antes de continuar, avalie:
- o comportamento varia por tipo? → polimorfismo (método na própria classe) ou Strategy;
- varia pelo estado do objeto? → State;
- é uma hierarquia fechada? → sealed interface + switch com pattern matching (Java 21) é aceitável.
Consulte skill://gof-patterns/pattern-selection.md e justifique a escolha.
