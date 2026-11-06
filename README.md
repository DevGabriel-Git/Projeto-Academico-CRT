# CRT — Sistema de Gestão de Ações

Projeto acadêmico da UniFEF, disciplina de Sistemas da Informação, professor Jefferson.
Autores: Gabriel Pereira, Rian Araújo e Paulo Candido.

API de corretoras, ações, carteira e histórico privado por usuário; frontend Angular.
A adequação ao curso está detalhada em [docs/adequacao-curso.md](docs/adequacao-curso.md), com evidências e pendências por módulo.

## Ambiente

Java 21, Maven Wrapper 3.9.14, Node 24 LTS e npm. Backend Spring Boot 4; Angular 21.
As ferramentas do curso são adaptadas à aplicação existente; o catálogo de referência não substitui o domínio da corretora.

## Verificar

Na raiz, Windows PowerShell:

```powershell
.\mvnw.cmd clean verify
python scripts/check_traceability.py
python scripts/check_diff_coverage.py HEAD
python scripts/context_budget.py
python -m unittest discover -s security/tests -v
cd corretora-frontend
npm ci
npm run lint
npm run test:coverage
npm run build
```

Linux/macOS: use `bash mvnw clean verify`. Testes usam H2 isolado, migrações Flyway e nenhum provedor externo.
`verify` inclui Spotless, Checkstyle, PMD, unitários, ArchUnit, integração MockMvc com segurança/banco e JaCoCo mínimo 80% de linhas e ramos.
DTOs, entidades com acesso gerado pelo Lombok e a classe principal ficam fora do cálculo; mapeamento/persistência são exercitados na integração.
O relatório de cobertura é gerado em `target/site/jacoco/index.html`.

## Executar localmente

Configure variáveis de ambiente da sessão com base em `.env.example`.
`JWT_SECRET` deve ser Base64 de pelo menos 32 bytes aleatórios; gere com um gerenciador de segredos ou `SecureRandom`. Nunca use chave de teste em produção.
`BRAPI_TOKEN`, `TWELVEDATA_KEY` e `ALPHAVANTAGE_KEY` são credenciais externas.
Spring não carrega `.env` automaticamente; Docker Compose usa esse arquivo, e execução pela IDE/terminal exige exportar as variáveis na configuração da execução.

```powershell
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=dev'
```

Perfil `dev`: H2 em arquivo `data/corretora-dev`, API na porta 8080, console H2 desabilitado.
Em outro terminal: `cd corretora-frontend`, `npm start -- --proxy-config proxy.conf.json`; frontend na porta 4200.
Swagger: `/swagger-ui/index.html`; autenticação `/auth/register` e `/auth/login`; health `/actuator/health`.
Cadastro exige senha entre 12 e 72 caracteres. Operações de compra/venda exigem quantidade positiva; preço omitido usa a cotação atual.

## Banco e produção

Perfil `prod` usa PostgreSQL: `DB_URL`, `DB_USER`, `DB_PASSWORD`. Flyway versiona schema; Hibernate usa `validate`.
V1 serve para banco novo. Banco legado precisa de backup, reconciliação de colunas/índices/restrições/sequências e baseline revisado antes de atualizar. Nunca apague dados para fazer a migração passar.
Docker backend usa build em duas etapas, Java 21 e usuário sem privilégio. O compose continua usando PostgreSQL do host e exige `.env` local. Porta de gestão 9090 deve permanecer interna.

## Segurança e publicação

`python tools/preflight.py origin/main` executa o portão integral e falha quando ferramenta/credencial/relatório está ausente. Use a base real se o branch principal tiver outro nome.
Não há autorização de publicação nesta entrega: há achados históricos de credenciais e verificações externas pendentes. Consulte [security/README.md](security/README.md).
GitHub Actions estão preparados, mas a execução remota e a proteção de branch exigem configuração no repositório.

## Integrações

BrasilAPI (CNPJ/CVM), ViaCEP (endereço), Brapi (Brasil), TwelveData (EUA); adaptador AlphaVantage mantido como alternativa. Clientes usam timeouts e testes substituem a rede.
Cotação de laboratório não é recomendação de investimento.


## Kit da disciplina
18 skills externas estao fixadas por origem/commit/hash em skills-lock.json. OpenSpec 1.13.2 e Spec Kit 1.0.12 foram inicializados; os comandos OMP estao em .omp/commands. Ferramentas locais ficam em .tools, ignorado pelo Git; versoes em tools/versions.json.
`python scripts/check_skills.py` verifica a integridade; `python scripts/check_rules.py` executa casos e scan OMP; `python scripts/context_budget.py` mede tokens reais, incluindo descricoes das skills.
O hook em .githooks/pre-commit executa verify e rastreabilidade. Ative neste clone com `git config core.hooksPath .githooks`.
Teste de mutacao: `mvnw.cmd -Pmutation test-compile org.pitest:pitest-maven:mutationCoverage`.
Observabilidade/carga local: `python scripts/smoke_observability.py`; exige k6 e dependencias tools/requirements.txt. Usa banco efemero, credenciais aleatorias, loopback e encerra os processos criados.

## Perfis de acesso

Login unico para USER e ADMIN por e-mail ou CPF. Cadastro publico cria USER; ADMIN recebe a tela /admin com consulta paginada de usuarios e acesso exclusivo as metricas. Carteiras permanecem privadas por titular, inclusive para administradores.

Primeiro administrador: `tools/start_with_admin.ps1` pede os dados localmente, com senha oculta, e inicia o bootstrap explicito. Nao ha senha padrao nem conta criada em seu banco durante os testes. Veja [docs/perfis-acesso.md](docs/perfis-acesso.md). Smoke real isolado: `python scripts/smoke_roles.py`, depois de gerar o JAR.
