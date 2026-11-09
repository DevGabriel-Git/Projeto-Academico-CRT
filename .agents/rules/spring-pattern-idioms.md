---
description: Forma idiomática de cada padrão GoF em Spring Boot
globs: ["**/*.java"]
---
- Singleton: @Component/@Service (escopo singleton do contêiner). Nunca getInstance().
- Factory Method / Abstract Factory: métodos @Bean em @Configuration; FactoryBean só se necessário.
- Builder: record para até ~4 campos; Builder (ou @Builder do Lombok) acima disso.
- Strategy: interface + uma implementação @Component por variante; injete List<Interface>
  e monte um Map pela chave de seleção. Lambdas para estratégias sem estado.
- Chain of Responsibility: List<Etapa> injetada com @Order.
- Observer: ApplicationEventPublisher + @EventListener (@TransactionalEventListener se depender do commit).
- Proxy / Decorator transversal (log, cache, transação, permissão): AOP do Spring
  (@Transactional, @Cacheable, @PreAuthorize, @Aspect) antes de escrever proxies à mão.
- Template Method: prefira os *Template do Spring (JdbcTemplate, RestClient, TransactionTemplate)
  ou Strategy por composição; herança só quando o esqueleto for realmente fixo.
- State: sealed interface + records para estados; enum + switch se houver até 3 estados simples.
- Visitor: para hierarquia sealed, prefira switch com pattern matching (Java 21).
