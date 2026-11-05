---
description: Como aplicar cada princípio SOLID em Spring Boot neste projeto
globs: ["**/*.java"]
---
- SRP: controller (HTTP) → service de caso de uso → repository; regras de negócio nas entidades.
  Um service por caso de uso ou agregado, nunca um "PedidoService" com tudo.
- OCP: variações como implementações @Component de uma interface; injete List<Interface>
  e monte um Map pela chave. Novos interessados em eventos via @EventListener.
- LSP: toda interface com mais de uma implementação ganha um teste de contrato abstrato
  (classe *ContractTest) herdado pelos testes de cada implementação.
- ISP: interfaces pequenas, desenhadas pelo cliente que as usa. Repositórios expõem só
  os métodos usados pelo domínio.
- DIP: interfaces das fronteiras no pacote do domínio; implementações no pacote infra.
  Injeção por construtor com campos private final; sem @Autowired em campo; sem new de
  Repository/Service/Client/Gateway/Dao em código de produção.
