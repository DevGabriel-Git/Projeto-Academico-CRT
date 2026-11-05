# ADR 004 — Contratos HTTP sem entidades JPA
Problema: controllers retornavam entidades, expondo contrato a futuros campos/relacionamentos JPA e exigindo carga tardia.
Alternativas: mapear no controller; mudar todos os metodos de dominio e testes; uma fronteira de aplicacao por dominio.
Escolha: application services pequenos, por dominio, transformam os modelos em records publicos dentro da camada service. Mantem testes e regras de negocio existentes e preserva os campos JSON consumidos pelo Angular, sem usuario/senha nem relacoes recursivas.
Nao introduzir interfaces ou hierarquias: estas classes delimitam contrato de transporte, nao provedores intercambiaveis. A composicao e a forma Spring do facade; o custo e uma camada explicita de montagem de respostas.
Verificacao: teste de API e regra ArchUnit que impede controllers dependerem de entidades.
