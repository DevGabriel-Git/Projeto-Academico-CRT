# Validação NVD para publicação

O titular configurou NVD_API_KEY no Windows em 2026-11-09 e autorizou publicar
somente Projeto-Academico-CRT. Nunca imprimir, versionar ou gravar a chave.

- Preservar a análise Dependency-Check, CVSS >= 7 bloqueante e falha em erro.
- Atualizar a ferramenta 12.1.8 para 12.2.2, cuja migração amplia a coluna de URL
  e corrige a importação de referências longas de CVE da Mozilla.
- Evidência anterior à alteração: a execução real 12.1.8 falhou ao importar
  CVE-2026-6785/6786 (URL VARCHAR(1000)); relatório em reports/publication-sca.log.
- Sincronizar e analisar novamente sem descartar erros ou desativar atualização.
- Executar o preflight integral antes do push da branch codex/adequacao-curso.
- Usar diretório temporário curto nesta sessão Windows para evitar falha de
  conexão loopback do seletor Java. Não alterar o banco da aplicação.
- Atualizar Swagger UI para 5.34.1 (DOMPurify 3.4.17), garantindo por integração
  que o JavaScript continua acessível na rota pública de documentação.
- Tratar apenas os falsos positivos comprovados CVE-2026-53914 em kotlin-stdlib
  2.2.21 (a falha está no KAPT) e CVE-2022-31691 em spring-boot-devtools 4.0.9
  (a falha está nos editores Spring Tools). Escopo exato de pacote/versão/CVE,
  dono e expiração; não suprimir falhas do DOMPurify nem novas versões.

Fonte: https://github.com/dependency-check/DependencyCheck/releases/tag/v12.2.2
