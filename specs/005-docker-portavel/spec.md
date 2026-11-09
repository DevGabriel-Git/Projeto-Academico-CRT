# Build Docker portável

O titular apresentou falha real de build Linux em 2026-11-09: os 78 arquivos
Java copiados de um checkout Windows CRLF foram rejeitados pelo Spotless.

- Normalizar apenas CRLF dos fontes Java na etapa de build, antes da verificação.
- Fixar LF para arquivos Java no Git e no Spotless, independentemente do host.
- Copiar quality/ para que Checkstyle e PMD encontrem as configurações do projeto.
- Não desativar Spotless, Checkstyle, PMD, testes ou limites de cobertura.
- Preservar as etapas e o usuário sem privilégios da imagem final.
- Verificar construindo a imagem com os fontes CRLF atuais; não acessar banco,
  criar administrador ou inspecionar/alterar o arquivo .env do titular.

Validação local: imagem projeto-academico-crt-backend:portability-check construída
com sucesso a partir do checkout CRLF; Spotless aprovou 78 arquivos, Checkstyle
concluiu e o JAR foi empacotado. Relatório: reports/docker-portability-build.log.
Os 78 fontes normalizados localmente foram comparados byte a byte com HEAD e não
possuem mudança de conteúdo. Revisões Spec e Standards: sem achados acionáveis.
