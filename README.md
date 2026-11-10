# CRT — Sistema de Gestão de Ações

Projeto acadêmico da UniFEF, da disciplina de Sistemas da Informação, com o professor Jefferson.
**Autores:** Gabriel Pereira, Rian Araújo e Paulo Candido.

O CRT permite cadastrar corretoras e ações, registrar compras e vendas e acompanhar a carteira e o histórico de cada usuário. O site tem temas claro e escuro. O administrador possui uma área para consultar usuários; as carteiras continuam privadas.

## Comece por aqui

Para rodar no Windows com Docker, siga os passos abaixo. Você precisa de:

- **Docker Desktop aberto**, com o mecanismo Linux em execução.
- **PostgreSQL instalado e em execução no seu computador**, na porta 5432.
- Um banco chamado **corretora**, com usuário e senha de acesso.

O Docker deste projeto sobe o site e a API. **Ele não instala nem inicia o PostgreSQL.** Java e Node são instalados dentro das imagens durante o build; você só precisa instalá-los no computador se quiser desenvolver sem Docker.

### 1. Prepare o arquivo .env

Abra o PowerShell na pasta `Projeto-Academico-CRT`, onde está o arquivo `docker-compose.yml`.

Se ainda não existir um `.env`, crie uma cópia do exemplo:

```powershell
Copy-Item .env.example .env
notepad .env
```

Se o arquivo já existir, apenas abra-o com `notepad .env`. Não substitua sua configuração atual pelo exemplo.

Preencha os campos:

| Campo | O que colocar |
|---|---|
| `DB_USER` | Usuário do seu PostgreSQL. |
| `DB_PASSWORD` | Senha desse usuário. |
| `DB_URL` | Endereço do banco para execução fora do Docker. No Compose, o endereço usado é `host.docker.internal:5432/corretora`. |
| `JWT_SECRET` | Chave aleatória usada para proteger o login. Deve ser Base64 de pelo menos 32 bytes aleatórios. |
| `BRAPI_TOKEN`, `TWELVEDATA_KEY`, `ALPHAVANTAGE_KEY` | Chaves dos serviços de cotação. Veja a seção de integrações abaixo. |

Substitua os marcadores entre `< >` nos campos obrigatórios. O `.env` fica **na raiz do projeto**, ao lado deste README, e não deve ser enviado ao GitHub.

Para gerar uma JWT_SECRET nova no PowerShell, execute o trecho abaixo e copie o resultado somente para seu `.env`:

```powershell
$jwtBytes = New-Object byte[] 32
$jwtGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$jwtGenerator.GetBytes($jwtBytes)
$jwtGenerator.Dispose()
[Convert]::ToBase64String($jwtBytes)
```

Em uma instalação existente, mantenha sua chave atual se ela já for segura. Trocar a JWT_SECRET invalida os logins existentes.

### 2. Inicie o sistema

```powershell
docker compose up -d --build
```

O primeiro build pode levar alguns minutos. Depois, abra:

| Acesso | Endereço |
|---|---|
| Site | [http://localhost:8081](http://localhost:8081) |
| API | [http://localhost:8080](http://localhost:8080) |
| Saúde da API | [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health) |

As portas ficam acessíveis apenas no próprio computador. Para alterá-las, configure `FRONTEND_PORT` e `BACKEND_PORT` no `.env`.

Comandos úteis:

```powershell
docker compose ps                 # Ver os serviços
docker compose logs --tail=100 backend  # Ver os últimos logs da API
docker compose down              # Parar os serviços
```

Ao atualizar o código, use novamente `docker compose up -d --build`.

### 3. Entre na sua conta

**Usuário comum:** abra o site, faça o cadastro e entre com e-mail ou CPF e senha. O cadastro público sempre cria uma conta USER. A senha deve ter entre 12 e 72 caracteres, respeitando o limite de 72 bytes UTF-8.

**Administrador:** entre pela mesma tela, com a conta ADMIN criada no seu banco. O sistema abre a área administrativa automaticamente. **Não existe usuário ou senha padrão.** Se você já criou o administrador, não precisa criá-lo de novo.

Para criar o primeiro administrador em uma instalação nova com Docker:

1. Adicione `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_CPF` e `ADMIN_PASSWORD` ao seu `.env`, com os dados escolhidos por você. A senha deve ter pelo menos 12 caracteres e no máximo 72 bytes UTF-8.
2. Execute:

```powershell
docker compose run --rm -e SPRING_PROFILES_ACTIVE=prod,bootstrap-admin backend
```

3. Aguarde a confirmação de criação no log e encerre essa execução com `Ctrl+C`.
4. Remova os quatro campos `ADMIN_*` do `.env` e inicie normalmente com `docker compose up -d`.

O bootstrap não promove uma conta USER existente nem redefine a senha de um administrador já criado. Para detalhes, veja [perfis de acesso](docs/perfis-acesso.md).

A recuperação automática de senha está indisponível por escolha do responsável pelo projeto; o sistema não simula envio de e-mail.

## Chaves e integrações

**Você não precisa de NVD_API_KEY nem OPENAI_API_KEY para abrir o site.**

| Integração | Para que serve | Situação |
|---|---|---|
| Brapi, Twelve Data e Alpha Vantage | Consultar cotações externas. | Sem novas chaves configuradas nesta entrega, por escolha do titular. |
| BrasilAPI e ViaCEP | Consultar informações de empresas e endereços. | Dependem de acesso à internet e disponibilidade dos serviços. |
| NVD | Verificar vulnerabilidades das dependências. | Chave configurada como secret criptografado no GitHub Actions. |
| OpenAI | Revisão consultiva de código em workflow manual. | Não ativada, por escolha do titular. |

Enquanto não quiser usar cotações, mantenha os campos de token com os marcadores do exemplo. Isso permite iniciar a aplicação, mas **não fornece cotações reais nem garante sucesso nas operações que consultam esses serviços**. Não há cotação fictícia automática para substituir uma falha.

Chaves antigas de Brapi/Twelve Data apareceram no histórico do Git e precisam ser revogadas nos painéis dos provedores, mesmo que ainda funcionem. Apagar ou substituir o valor no `.env` não revoga uma chave. Não envie chaves pelo chat nem faça commit do `.env`.

## Problemas comuns

| Problema | O que conferir |
|---|---|
| Erro com `dockerDesktopLinuxEngine` | Abra o Docker Desktop e aguarde o mecanismo Linux iniciar. |
| API não conecta ao banco | Confira PostgreSQL ativo, banco `corretora`, usuário e senha. O container também precisa ter permissão de conexão ao PostgreSQL do host. |
| Porta ocupada | Altere `BACKEND_PORT` ou `FRONTEND_PORT` no `.env` e execute o Compose novamente. |
| Login de administrador não funciona | Use a conta criada no mesmo banco do backend. O banco H2 de desenvolvimento é separado do PostgreSQL do Docker. |
| Cotação falha | Confira se deseja ativar o provedor, se a chave é válida e se o serviço está disponível. |

As migrações Flyway preparam um banco novo. Se for aproveitar um banco antigo de outra versão, faça backup e confira a compatibilidade antes; não apague dados para forçar a inicialização.

## Desenvolver sem Docker

Instale **Java 21** e **Node 24 LTS**. O Maven é fornecido pelo projeto. Configure as variáveis de ambiente na sessão do terminal ou na IDE: Spring não carrega o `.env` automaticamente.

Na raiz do projeto:

```powershell
.\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=dev'
```

Em outro terminal:

```powershell
cd corretora-frontend
npm ci
npm start -- --proxy-config proxy.conf.json
```

Abra [http://localhost:4200](http://localhost:4200). Esse modo usa o banco H2 em `data/corretora-dev`, separado do PostgreSQL. Para criar o primeiro administrador **desse banco de desenvolvimento**, use `.\tools\start_with_admin.ps1` com o ambiente configurado.

## Executar as verificações

Backend, na raiz:

```powershell
.\mvnw.cmd clean verify
python scripts/check_traceability.py
python -m unittest discover -s scripts/tests -v
python -m unittest discover -s security/tests -v
```

Frontend:

```powershell
cd corretora-frontend
npm ci
npm run lint
npm run test:coverage
npm run build
```

Os testes Java usam banco H2 isolado. O `verify` executa testes, formatação, análise de código e cobertura mínima de 80% de linhas e ramos. O relatório fica em `target/site/jacoco/index.html`. Em Linux/macOS, use `bash mvnw` no lugar de `.\mvnw.cmd`.

Antes de publicar, o projeto exige `python tools/preflight.py origin/main`, com as ferramentas e a NVD_API_KEY configuradas. O build Docker não substitui esses testes. O hook pode ser ativado com `git config core.hooksPath .githooks`.

Para executar o laboratório de segurança autenticado, após `clean verify`, com Docker e JDK disponíveis:

```powershell
python scripts/smoke_authenticated_dast.py --prepare-images
python scripts/smoke_authenticated_dast.py
```

Ele usa usuários fictícios e H2 em memória, sem acessar seu banco real. O resultado fica em `reports/authenticated-dast/result.json`. Esse laboratório não substitui um teste completo de segurança de produção.

## Documentação do projeto

- [Organização das pastas](docs/estrutura.md).
- [Adequação aos módulos do curso e evidências](docs/adequacao-curso.md).
- [Login e perfis USER/ADMIN](docs/perfis-acesso.md).
- [Arquitetura](docs/architecture.md) e [decisões técnicas](docs/adr/).
- [Segurança](security/README.md) e [ações externas pendentes](docs/operations-pending.md).
- [Desempenho e observabilidade](docs/observability.md).

As ferramentas OpenSpec, Spec Kit e skills da disciplina estão documentadas nesses arquivos. Ferramentas locais ficam em `.tools/`; relatórios gerados, em `reports/`. Essas pastas não são enviadas ao GitHub.
