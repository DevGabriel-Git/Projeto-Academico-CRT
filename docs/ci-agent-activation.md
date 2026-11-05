# Ativacao externa do agente CI — pendente

A revisao automatica rejeitou a criacao de um workflow persistente que enviaria o diff e entrada de usuario a um agente externo usando chaves de modelo: nao havia autorizacao especifica para o destino e a exportacao de conteudo privado.

Alternativa implementada: workflow manual prepara um pacote para revisao humana no proprio GitHub, verifica segredos e armazena artefato sem chamar modelo nem ler chave de provedor. Nao envia comentarios nem faz merge.

Proposta para uma ativacao futura: somente disparo manual; provedor/destino aprovado pelo titular; diff e pedido verificados antes de envio; ferramentas de leitura; sem token GitHub no agente; teto de 10 minutos e orcamento aprovado; resposta como artefato para revisao humana. Nenhum valor de chave deve ser enviado no chat.

A escolha do provedor, autorizacao de envio do codigo e configuracao da chave ficam pendentes. Scripts de executor estao versionados para revisao, sem invocacao automatica.
