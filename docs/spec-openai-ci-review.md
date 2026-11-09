# Revisao consultiva pela OpenAI

Autorizacao do titular em 2026-11-06: enviar o diff do projeto para a API da OpenAI.
O workflow deve ser exclusivamente manual e executar codigo da branch padrao confiavel.
Enviar somente o diff textual do ultimo commit, apos Gitleaks, para
https://api.openai.com/v1/responses. Nao enviar historico completo, segredos ou entrada livre.
Limitar a entrada a 24000 bytes UTF-8, sem truncamento silencioso, e a saida a 2000 tokens.
Uma requisicao, sem retry, timeout de 120 segundos, store=false e nenhuma ferramenta.
Chave somente no secret OPENAI_API_KEY; nao receber token GitHub nem aceitar redirecionamentos.
Falhar sem expor corpo de erro, chave ou prompt se faltar chave, exceder limite, houver recusa,
resposta incompleta ou formato invalido. Resultado apenas como artefato, nunca aprovacao,
comentario, alteracao de codigo ou merge. Testes locais nao devem chamar a API real.
