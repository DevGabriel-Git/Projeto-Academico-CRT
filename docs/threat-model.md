# STRIDE — fronteiras da corretora

| Fronteira | Ameaca | Controle | Evidencia |
|---|---|---|---|
| JWT -> API | Spoofing | assinatura, expiracao e 401 para token invalido | CarteiraApiIT, AuthenticationTest |
| IDs -> carteira | Elevation of privilege / IDOR | consultas incluem usuario, associacao acao/corretora | CarteiraServiceTest e API |
| Operacao -> banco | Tampering | validacao decimal, quantidade positiva, transacao e versao otimista | precisao, rollback e conflito nos testes |
| Historico | Repudiation | registro junto com a posicao, mesmo timestamp | rollback e historico testados |
| Resposta/log/trace | Information disclosure | resposta de erro segura, usuario/senha ignorados, labels fixos | teste API e relatorios sanitizados |
| Provedores HTTP | Denial of service | timeout conexao/leitura; falha segura sem payload do provedor | HttpClientConfig e testes de adaptador |
| CI -> agente | Prompt injection | entrada como dado, ferramentas somente leitura, sem token GitHub, limite de tempo | scripts e revisao humana; modelo nao executado |
| Dependencias | Supply chain | lockfile, proveniencia de skills, checksum de binarios, SCA/SAST | npm audit/Gitleaks; preflight integral pendente |

Riscos residuais: credenciais historicas exigem rotacao pelo titular; protecao de branch e revisao humana dependem do GitHub; listas ainda podem crescer sem paginacao; tokens no navegador seguem politica atual do frontend.
