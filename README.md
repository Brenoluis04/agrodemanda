# AGRODEMANDA

Sistema web para registro, acompanhamento e gestão de demandas rurais, conectando agricultores, associações e a Secretaria de Agricultura. As solicitações são organizadas por comunidade rural e categoria de serviço, com protocolo, histórico de atendimento e indicadores em um painel de controle.

## Tecnologias

- **Frontend:** React, TypeScript, Vite e Recharts (gráficos)
- **Backend:** Python 3.12 e FastAPI (API REST), com autenticação JWT
- **Banco de dados:** PostgreSQL 17, SQLAlchemy e Alembic (migrações)

## Funcionalidades

- Login com três perfis de usuário
- Registro de demandas com categoria, comunidade, associação, quantidade estimada e coordenadas (opcionais)
- Protocolo único e histórico de cada atualização de status
- Acompanhamento do atendimento: status, prioridade, responsável e observações
- Painel com indicadores e gráficos (demandas por comunidade e por status, taxa de conclusão, tempo médio de atendimento)
- Mapa de demandas, com links para a localização no OpenStreetMap
- Relatório de demandas em CSV (rota `GET /api/reports/demands.csv`, exige login da equipe ou do admin)

## Perfis de usuário

| Perfil     | O que pode fazer                                                              |
|------------|-------------------------------------------------------------------------------|
| Agricultor | Registrar solicitações e acompanhar as próprias demandas                      |
| Equipe     | Ver todas as demandas, atualizar status/prioridade/responsável, ver o mapa    |
| Admin      | Tudo o que a equipe faz, mais a administração de usuários (pela API)          |

## Credenciais de demonstração

Criadas pelo `seed.py`:

| Perfil     | E-mail                       | Senha     |
|------------|------------------------------|-----------|
| Admin      | admin@agrodemanda.com        | Admin@123 |
| Equipe     | secretaria@agrodemanda.com   | Agro@123  |
| Agricultor | agricultor@agrodemanda.com   | Agro@123  |

## Estrutura do projeto

```
agrodemanda/
├── backend/
│   ├── app/            API FastAPI (main, models, schemas, security, config, database)
│   ├── alembic/        Migrações do banco (versions/)
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── seed.py         Dados de demonstração
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx         Rotas e provedor de autenticação
│   │   ├── api.ts          Tipos e cliente HTTP da API
│   │   ├── constants.ts    Categorias, status, prioridades e cores
│   │   ├── context/        Contexto de autenticação
│   │   ├── layout/         Menu lateral e topo (Shell)
│   │   ├── components/     Componentes reutilizáveis (tabela, status, cabeçalho...)
│   │   └── pages/          Telas (Login, Painel, Demandas, Nova demanda, Detalhe, Mapa)
│   └── package.json
└── README.md
```

## O que é o Alembic e qual o papel dele aqui

O Alembic é a ferramenta de **migrações** do SQLAlchemy: um controle de versão para a estrutura do banco. Cada alteração em tabelas ou colunas fica registrada em um arquivo de migração, que pode ser aplicado em qualquer banco, na ordem certa, sem apagar dados.

No AGRODEMANDA:

- `backend/alembic/versions/` guarda a migração inicial, que cria as tabelas `users`, `communities`, `associations`, `demands` e `demand_history`.
- `backend/alembic/env.py` lê a `DATABASE_URL` do `.env` e compara os modelos (`app/models.py`) com o banco.
- A tabela `alembic_version`, dentro do banco, registra a versão em que ele está.
- Em uma máquina nova, `alembic upgrade head` cria todas as tabelas. Não é preciso criá-las à mão.

## Passo a passo para rodar em uma máquina nova (Windows)

### 1. Instalar os programas

| Programa   | Versão usada no projeto | Observação |
|------------|-------------------------|------------|
| Python     | 3.12                    | https://www.python.org/downloads/ — marque **Add python.exe to PATH** |
| Node.js    | 20 LTS ou superior      | https://nodejs.org/pt (inclui o npm) |
| PostgreSQL | 17                      | https://www.postgresql.org/download/windows/ — anote a **senha do usuário `postgres`**. O pgAdmin 4 vem junto |
| Git        | qualquer recente        | https://git-scm.com/download/win |

Depois de instalar, **feche e abra o terminal** e confira:

```powershell
python --version
node -v
npm -v
git --version
```

### 2. Baixar o projeto

```powershell
git clone https://github.com/Brenoluis04/agrodemanda.git
cd agrodemanda
```

### 3. Criar o banco de dados

No pgAdmin 4: clique com o botão direito em **Databases > Create > Database**, digite `agrodemanda`, mantenha o Owner `postgres` e salve.

Ou, pelo terminal (use o caminho do `psql` da sua instalação):

```powershell
psql -U postgres -c "CREATE DATABASE agrodemanda;"
```

### 4. Configurar e iniciar o backend

```powershell
cd backend
py -3.12 -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
copy .env.example .env
```

Abra o arquivo `backend\.env` e preencha:

```
DATABASE_URL=postgresql+psycopg://postgres:SUA_SENHA@localhost:5432/agrodemanda
SECRET_KEY=uma-chave-longa-e-aleatoria
CORS_ORIGINS=http://localhost:5173
```

- Troque `SUA_SENHA` pela senha do `postgres`. Se ela tiver caracteres especiais, codifique-os na URL (`@` vira `%40`, `#` vira `%23`).
- Para gerar uma `SECRET_KEY`:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Crie as tabelas, popule os dados de demonstração e inicie a API:

```powershell
alembic upgrade head
python seed.py
python -m uvicorn app.main:app --reload
```

Confira em http://127.0.0.1:8000/api/health (status ok) e em http://127.0.0.1:8000/docs (documentação da API). Deixe este terminal aberto.

### 5. Iniciar o frontend

Abra **outro terminal** na pasta do projeto:

```powershell
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173 e entre com uma das credenciais de demonstração.

O frontend usa `http://localhost:8000/api` como endereço da API. Para mudar, crie `frontend/.env` com `VITE_API_URL=http://endereco-da-api/api`.

### 6. Uso no dia a dia

Para abrir o projeto novamente, são sempre dois terminais abertos ao mesmo tempo:

```powershell
# Terminal 1 (backend)
cd agrodemanda\backend
.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload

# Terminal 2 (frontend)
cd agrodemanda\frontend
npm run dev
```

## Migrações (Alembic)

Quando mudar um modelo em `app/models.py`:

```powershell
cd backend
alembic revision --autogenerate -m "descrição da mudança"
alembic upgrade head
```

Confira o arquivo gerado em `alembic/versions/` antes de aplicar e versione-o no Git. Outros comandos úteis:

| Comando                | Função                                                          |
|------------------------|-----------------------------------------------------------------|
| `alembic current`      | Mostra a versão atual do banco                                  |
| `alembic check`        | Verifica se há diferenças entre os modelos e as migrações       |
| `alembic downgrade -1` | Desfaz a última migração                                        |

## Problemas comuns

| Mensagem ou sintoma                                   | Causa e solução |
|-------------------------------------------------------|-----------------|
| `node`, `npm`, `python` ou `git` não reconhecido       | Programa não instalado ou terminal aberto antes da instalação. Instale e reabra o terminal |
| `ENOENT ... package.json` no `npm install`            | Terminal fora da pasta `frontend`. Use `cd frontend` |
| `Activate.ps1` bloqueado                              | Rode `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` e ative de novo |
| `password authentication failed for user "postgres"`  | Senha errada na `DATABASE_URL` do `.env` |
| `database "agrodemanda" does not exist`               | Crie o banco (passo 3) |
| `Failed to fetch` no login                            | Backend parado. Inicie o Uvicorn e teste `http://127.0.0.1:8000/docs` |
| Login sem resposta ou erro de CORS                    | Confira `CORS_ORIGINS=http://localhost:5173` no `backend/.env` e reinicie a API |
| `Address already in use` (portas 8000 ou 5173)        | Já há um servidor rodando. Feche o terminal antigo (Ctrl+C) |
| `relation "users" does not exist`                     | Faltou `alembic upgrade head` |

## Observações

- O arquivo `backend/.env` contém senhas e **não é versionado** (está no `.gitignore`). O `.env.example` mostra o formato.
- Os dados criados pelo `seed.py` são de demonstração.
