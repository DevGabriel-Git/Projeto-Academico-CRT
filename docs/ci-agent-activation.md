# Revisao consultiva OpenAI no CI

O titular autorizou explicitamente em 2026-11-06 o envio do diff do seu projeto a API da OpenAI. Essa autorizacao resolve a pendencia de destino que havia causado a rejeicao automatica anterior.

O workflow `Manual OpenAI advisory review` tem disparo manual e faz checkout somente da branch padrao, sem persistir credenciais Git. Envia apenas o diff textual do ultimo commit para `https://api.openai.com/v1/responses`, depois de Gitleaks. Nao revisa uma PR inteira. Diff vazio ou maior que 24000 bytes bloqueia a chamada, sem truncamento. Usa `gpt-6-luna`, uma requisicao sem retry, timeout 120s, no maximo 2000 tokens de saida, nenhuma ferramenta e `store=false`. Esses limites limitam consumo por execucao, mas nao sao um teto monetario da conta; configure limites de gastos no projeto OpenAI.

Para ativar apos publicacao revisada: adicionar `OPENAI_API_KEY` em Settings > Secrets and variables > Actions do seu repositorio, com acesso ao modelo e faturamento API. Nao colocar chave em arquivo, issue ou chat. Executar manualmente na aba Actions. Sem chave, com recusa, resposta incompleta ou erro, a etapa falha. Nao ha aprovacao, comentario, alteracao de codigo ou merge automatico. Relatorio consultivo somente no artefato, retido por sete dias e tratado como conteudo nao confiavel.

`store=false` nao significa retencao zero: logs de monitoramento de abuso podem reter conteudo por ate 30 dias, conforme os controles da conta. Consulte a [documentacao de dados](https://developers.openai.com/api/docs/guides/your-data). Implementacao baseada na [Responses API](https://developers.openai.com/api/docs/guides/text) e no [modelo GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna).

Validacao local usa respostas simuladas, sem exportar codigo ou consumir API. Execucao real no GitHub e configuracao do secret continuam pendentes.
