# Validação NVD para publicação

Base das correções: c1e03397ec1c7288ffa3741ff193997f18a52d29.
A chave do titular está nas variáveis de sistema do Windows, sem valor no repositório
ou nos relatórios. A API oficial respondeu HTTP 200 à consulta de validação.

## Ferramenta e achado corrigido

Dependency-Check 12.1.8 não importou CVE-2026-6785/6786: referências excediam
URL VARCHAR(1000). A versão 12.2.2 migra esse schema e corrige precisamente esse
caso, conforme o [changelog oficial](https://github.com/dependency-check/DependencyCheck/releases/tag/v12.2.2).

Swagger UI 5.32.0 trazia DOMPurify 3.2.6. O WebJar foi atualizado para 5.34.1,
com DOMPurify 3.4.17; a configuração do Springdoc acompanha a versão do recurso.
[Lock oficial](https://github.com/swagger-api/swagger-ui/blob/v5.34.1/package-lock.json),
[aviso do fornecedor](https://github.com/cure53/DOMPurify/security/advisories/GHSA-mrv2-3pqr-j5jr).
O teste de integração da rota pública falhou antes da atualização porque o
JavaScript não continha DOMPurify 3.4.17. Não foram suprimidos CVEs do sanitizador.

## Associações de produto incorretas

Responsável pela reavaliação: mantenedores de Projeto-Academico-CRT.
As duas exceções expiram em 2026-12-09 e abrangem somente a versão e o CVE indicados:

- CVE-2026-53914 em kotlin-stdlib 2.2.21: a falha está na desserialização de cache
  incremental do KAPT, não na biblioteca padrão de execução. A aplicação Java/Maven
  não usa KAPT/Gradle. [Correção do fornecedor](https://github.com/JetBrains/kotlin/commit/bf51df665b458fda7c3eaf436c4d88dc119d7ec6).
- CVE-2022-31691 em spring-boot-devtools 4.0.9: produto confundido pelo CPE;
  o aviso afeta os editores YAML do Spring Tools para Eclipse/VSCode, que não são
  essa biblioteca Maven. [Produtos afetados no aviso oficial](https://spring.io/security/cve-2022-31691/).

Limite CVSS 7, falha em erro, atualização da base e análise das dependências
continuam obrigatórios. Erros de importação ou relatórios incompletos não representam
aprovação. A execução integral e o push dependem do resultado final do preflight.

## Evidência das correções

- Teste da rota com versão antiga forçada por propriedades Maven: 1 falha;
  versão corrigida: 1 teste aprovado (reports/swagger-security-red.log e -green.log).
  A asserção verifica DOMPurify.version="3.4.17" no JavaScript realmente servido.
- Dependency-Check 12.2.2: BUILD SUCCESS, 110 entradas de dependências,
  duas supressões locais delimitadas e seis alertas ativos abaixo do limiar CVSS 7.
  Isso não significa ausência de todos os alertas; reports/publication-sca-fixed.log
  e target/dependency-check-report.json contêm a execução e os detalhes.
- Revisão estática independente Spec e Standards: sem achados acionáveis.
  As revisões não substituem a execução integral nem constituem aceite humano.
