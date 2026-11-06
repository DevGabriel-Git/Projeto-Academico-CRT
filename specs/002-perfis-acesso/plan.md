# Plano consolidado da implementacao

Spec escrita antes do codigo; este documento consolida o desenho final e as evidencias.
Preservar V1, migrar contas para USER na V2 e representar papeis como enum persistido.
Autorizar no SecurityFilterChain, recarregar autoridades do banco por requisicao e
preservar consultas financeiras por titular. Nao confiar em seletores/estado do browser.
Bootstrap opt-in por profile, dados do ambiente e senha BCrypt; trava em linha de banco
serializa inicializacao. Sem reset/promocao de contas preexistentes pelo bootstrap.
DTOs de consulta separados de JPA; administracao somente leitura, ordenada e paginada.
Angular confirma /auth/me no guard e trata401 centralmente, sem enviar token fora da API.
Validar em H2 efemero, MockMvc, HTTP real, DOM Angular e scanners; nunca em banco real.
Operacao e limites: ../../docs/perfis-acesso.md e ../../docs/review-perfis-2026-11-06.md.
