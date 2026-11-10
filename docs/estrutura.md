# Guia das pastas

## Uso diário

| Caminho | Conteúdo |
| --- | --- |
| `src/main/` | Backend Java e configuração do Spring Boot |
| `src/test/` | Testes do backend |
| `corretora-frontend/src/` | Telas, estilos e testes Angular |
| `README.md` | Como configurar, executar e verificar |
| `.env.example` | Modelo das variáveis locais; copiar para `.env` |
| `docker-compose.yml`, `Dockerfile` | Execução e build com Docker |
| `pom.xml`, `mvnw`, `mvnw.cmd`, `.mvn/` | Dependências e execução do Maven |

## Documentação e disciplina

| Caminho | Conteúdo |
| --- | --- |
| `docs/` | Arquitetura, decisões, guias e evidências resumidas |
| `docs/adequacao-curso.md` | Situação dos módulos do curso |
| `docs/perfis-acesso.md` | Login e criação do primeiro administrador |
| `docs/frontend-interativo.md` | Funcionalidades e validação da interface |
| `specs/`, `openspec/` | Especificações das funcionalidades |
| `AGENTS.md`, `CONTEXT.md` | Instruções e vocabulário para os agentes |
| `.agents/`, `.omp/`, `.specify/`, `skills-lock.json` | Ferramentas e regras exigidas pelo material |

## Automação e qualidade

| Caminho | Conteúdo |
| --- | --- |
| `scripts/` | Verificações e testes de execução |
| `tools/` | Preparação das ferramentas e preflight |
| `quality/` | Configuração de qualidade Java |
| `security/`, `security-policy/`, `semgrep-rules/` | Verificações e políticas de segurança |
| `observability/`, `performance/` | Monitoramento e carga |
| `.github/`, `.githooks/` | CI e verificações de commit |

## Arquivos gerados e locais

`target/`, `corretora-frontend/dist/`, `corretora-frontend/coverage/`,
`corretora-frontend/node_modules/`, `corretora-frontend/.angular/`, `reports/`
e `.tools/` são saídas de build, dependências, caches e relatórios ignorados pelo Git.
`data/` guarda dados locais e também não é versionado. Não excluir `data/` como limpeza.

As pastas técnicas mantêm seus caminhos porque Maven, Angular, CI e ferramentas do
curso os utilizam. Os arquivos soltos da pasta superior foram reunidos em
`D:\Projeto\_arquivos-locais`, fora deste repositório.

Laboratorio autenticado: scripts/smoke_authenticated_dast.py, testes em security/tests e src/test/java/lab/crt/dast, politicas em security-policy/dast-*.json. Evidencias resumidas em docs/verification.json; relatorios detalhados gerados em reports/, sem versionar credenciais.
