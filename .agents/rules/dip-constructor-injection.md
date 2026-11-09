---
description: DIP — injeção de dependência por construtor, nunca @Autowired em campo
condition: "@Autowired\\s+(private|protected)\\s+(final\\s+)?[\\w.<>, ]+\\s+\\w+\\s*;"
globs: ["src/main/**/*.java"]
---
Use injeção por construtor com campos private final. @Autowired em campo esconde dependências, impede imutabilidade e dificulta testes.
