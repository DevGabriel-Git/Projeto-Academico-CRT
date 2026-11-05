---
description: Convenções de código Java e Spring deste projeto
globs: ["**/*.java"]
---
- Injeção de dependência por construtor; campos `private final`. Nunca @Autowired em campo.
- DTOs como `record`. Entidades JPA não saem da camada de serviço.
- Dinheiro em BigDecimal, nunca double.
- Log com SLF4J (`LoggerFactory.getLogger`), com placeholders `{}`, nunca concatenação.
- Erros de API em ProblemDetail (RFC 9457) via @RestControllerAdvice.
- Nomes de testes descrevem o comportamento: `deveRecusarPedidoSemItens()`.
