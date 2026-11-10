# Acoes externas e limites — 10/11/2026

- Revogar as chaves historicas BRAPI_TOKEN e TWELVEDATA_KEY nos respectivos provedores. O titular consultara o outro computador depois; revogacao ainda nao confirmada. Copiar ou apagar o .env nao revoga chaves. A JWT local foi substituida e difere da historica; ver security-findings.md.
- OpenAI e cotacoes reais ficam desativados por escolha expressa do titular em 10/11. Implementacoes e testes locais permanecem; nao ativar secrets ou chamadas sem novo pedido.
- Ratificacao da constituicao, exercicios pessoais e aceite final do trabalho cabem ao aluno. Arquivos preparados nao comprovam aprendizado ou execucao de todos os comandos com um modelo.
- Revisar e integrar a PR desta entrega depois dos gates. Protecao da main esta ativa, com cinco checks obrigatorios e sem aprovacao independente obrigatoria para nao bloquear o mantenedor unico.

## Operacoes ja comprovadas

Administrador real criado e autenticado em 09/11; PostgreSQL atual funciona. NVD configurada como secret criptografado do repositorio com autorizacao, e workflow SCA remoto aprovado em 10/11. DAST autenticado isolado aprovado: 23 verificacoes, seis scans concluidos, 878 requests e duas informacoes explicitamente triadas ate 10/12. Nenhum alerta baixo/medio/alto. Recursos temporarios removidos.

O DAST cobre API/H2 e quatro regras ativas delimitadas; nao atesta infraestrutura de producao, TLS ou teste de invasao exaustivo. LGTM esta preparado; carga local com carteira vazia nao substitui dataset realista. Conciliacao de banco legado so se aplica se outro banco antigo for importado, sempre com backup/revisao; nao e pendencia do banco novo atual.
