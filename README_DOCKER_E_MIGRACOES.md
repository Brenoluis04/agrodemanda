AGRODEMANDA

Sistema web para registro, acompanhamento e gestão de demandas rurais, conectando agricultores, associações e a Secretaria de Agricultura. As solicitações são organizadas por comunidade rural e categoria de serviço, com protocolo, histórico de atendimento e indicadores em um painel de controle.

Tecnologias
Frontend: React, TypeScript, Vite e CSS responsivo (gráficos com Recharts)
Backend: Python 3.12 e FastAPI (API REST), com autenticação JWT
Banco de dados: PostgreSQL, SQLAlchemy e Alembic (migrações)
Funcionalidades
Login com três perfis de usuário
Registro de demandas com categoria, comunidade, associação, quantidade estimada e coordenadas (opcionais)
Protocolo único e histórico de cada atualização de status
Acompanhamento do atendimento: status, prioridade, responsável e observações
Painel com indicadores e gráficos (demandas por comunidade e por status, taxa de conclusão e tempo médio de atendimento)
Mapa de demandas com links para a localização no OpenStreetMap
Relatório em CSV
Perfis de usuário
Perfil	O que pode fazer
Agricultor	Registrar solicitações e acompanhar as próprias demandas
Equipe	Ver todas as demandas, atualizar status, prioridade e responsável, ver o mapa
Admin	Tudo o que a equipe faz, mais a administração de usuários
Estrutura do projeto
agrodemanda/
├── backend/      API FastAPI, modelos, migrações (alembic/) e seed.py
├── frontend/     Aplicação React + Vite
├── docker-compose.yml
└── README.md
Pré-requisitos
Python 3.12
Node.js 20 ou superior
PostgreSQL 17 (para execução local) ou Docker Desktop (para Docker Compose)
Configuração do banco e do .env (execução local)

Antes de rodar as migrações, crie o banco no PostgreSQL (pelo pgAdmin ou pelo psql):

sql
CREATE DATABASE agrodemanda;

Depois de copiar o .env.example para backend/.env, edite o arquivo:

DATABASE_URL=postgresql+psycopg://postgres:SUA_SENHA@localhost:5432/agrodemanda
SECRET_KEY=uma-chave-longa-e-aleatoria
CORS_ORIGINS=http://localhost:5173
Troque SUA_SENHA pela senha do usuário postgres. Se ela tiver caracteres especiais, codifique-os na URL (por exemplo, @ vira %40 e # vira %23).
Para gerar uma SECRET_KEY:
bash
python -c "import secrets; print(secrets.token_hex(32))"
Observações para Windows (PowerShell)

Se o PowerShell bloquear a ativação do ambiente virtual, libere a execução de scripts apenas na sessão atual:

powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

No PowerShell, use copy .env.example .env no lugar de cp .env.example .env.

O backend e o frontend rodam em terminais separados. Mantenha os dois abertos durante o uso:

API: http://127.0.0.1:8000 (documentação em /docs)
Frontend: http://localhost:5173

## Credenciais de demonstração

| Perfil     | E-mail                        | Senha      |
|------------|-------------------------------|------------|
| Admin      | admin@agrodemanda.com         | Admin@123  |
| Equipe     | secretaria@agrodemanda.com    | Agro@123   |
| Agricultor | agricultor@agrodemanda.com    | Agro@123   |

## Executando com Docker Compose

Pré-requisito: Docker Desktop.

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- API: http://localhost:8000/api/health
- Documentação da API: http://localhost:8000/docs

Ao subir, o backend aplica as migrações (`alembic upgrade head`) e executa o
`seed.py`, que só cria os dados de demonstração se eles ainda não existirem.

Variáveis opcionais (arquivo `.env` na raiz): `POSTGRES_PASSWORD` e `SECRET_KEY`.

Para parar: `docker compose down` (use `-v` para apagar também o banco).

## Executando localmente (sem Docker)

Backend:

```bash
cd backend
python -m venv .venv
# Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env        # ajuste DATABASE_URL e SECRET_KEY
alembic upgrade head
python seed.py
python -m uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Migrações (Alembic)

```bash
cd backend
alembic revision --autogenerate -m "descrição"
alembic upgrade head
```
## Pré-requisitos

- Python 3.12
- Node.js 20 ou superior
- PostgreSQL 17 (para execução local) ou Docker Desktop (para Docker Compose)

## Crie o banco no PostgreSQL (pgAdmin ou psql):

CREATE DATABASE agrodemanda;
    
## Edite `backend/.env`:

DATABASE_URL=postgresql+psycopg://postgres:SUA_SENHA@localhost:5432/agrodemanda
SECRET_KEY=uma-chave-longa-e-aleatoria
CORS_ORIGINS=http://localhost:5173

# PowerShell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1