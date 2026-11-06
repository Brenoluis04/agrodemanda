# AGRODEMANDA

Sistema municipal de gestão das demandas rurais de Santa Cruz do Capibaribe/PE. O projeto conecta agricultores e associações à Secretaria, centralizando solicitações, protocolos, acompanhamento e indicadores.

## Tecnologias
- Front-end: React 18, TypeScript, Vite, CSS responsivo, Recharts e React Router.
- Back-end: Python 3.12, FastAPI, API REST, SQLAlchemy 2, Alembic e JWT.
- Banco: PostgreSQL 16.
- Execução local: PostgreSQL, FastAPI e Vite, sem Docker.

## Funcionalidades implementadas
- Cadastro de usuário agricultor e login por e-mail/senha.
- Perfis `farmer`, `staff` e `admin`, com rotas protegidas no back-end.
- Cadastro inicial de comunidades rurais e associação demonstrativa.
- Registro de demandas individuais e coletivas com comunidade, categoria, quantidade, referência e coordenadas opcionais.
- Protocolo automático, consulta e acompanhamento pelo solicitante.
- Painel da Secretaria com indicadores, gráficos por comunidade e status.
- Atualização de status, prioridade, responsável e observações com histórico.
- Filtros, mapa de links geográficos (OpenStreetMap) e exportação CSV.
- Dados iniciais para demonstração.

## Pré-requisitos (sem Docker)
- PostgreSQL instalado e em execução localmente.
- Python 3.11 ou 3.12 e Node.js 20+ com npm.
- Criar o banco de dados `agrodemanda` no PostgreSQL (pelo pgAdmin ou SQL: `CREATE DATABASE agrodemanda;`).

## 1. Configurar e iniciar o back-end
No terminal, na pasta `backend`:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edite `backend/.env`: substitua `SUA_SENHA` pela senha do usuário `postgres` que você criou na instalação do PostgreSQL; se usar outro usuário ou porta, ajuste a URL. Troque também `SECRET_KEY`. Se sua senha contiver caracteres especiais, faça a codificação de URL correspondente.

```powershell
alembic upgrade head
python seed.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

A API fica em `http://localhost:8000`, com documentação em `http://localhost:8000/docs`. No Linux/macOS, ative o ambiente com `source .venv/bin/activate` e use `cp` em vez de `Copy-Item`.

## 2. Iniciar o front-end
Abra outro terminal na pasta `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O front-end chama a API em `http://localhost:8000/api` por padrão. Se necessário, defina `VITE_API_URL` em `frontend/.env`.

## Contas demonstrativas
| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@agrodemanda.local` | `Admin@123` |
| Secretaria | `secretaria@agrodemanda.local` | `Agro@123` |
| Agricultor | `agricultor@agrodemanda.local` | `Agro@123` |

Troque as senhas e a chave JWT antes de qualquer implantação real. O cadastro público cria contas com perfil agricultor; ele não permite autoelevação para equipe ou administrador.

## Migrações e manutenção
O schema inicial está em `backend/alembic/versions/0001_initial.py`. Para gerar uma migração após alterar os modelos:

```bash
cd backend
alembic revision --autogenerate -m "descreva a alteracao"
alembic upgrade head
```

A configuração local está descrita no início deste README.

## API principal
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/communities`, `GET/POST /api/associations`
- `GET/POST /api/demands`, `GET/PATCH /api/demands/{id}`, `GET /api/demands/{id}/history`
- `GET /api/dashboard`, `GET /api/reports/demands.csv`
- `GET /api/admin/users`, `PATCH /api/admin/users/{id}/role`

## Modelo de dados
- `users`: identidade, credenciais e perfil de acesso.
- `communities`: localidades rurais.
- `associations`: associações ligadas a uma comunidade.
- `demands`: solicitações, protocolo, localização, classificação, prioridade, responsável e datas.
- `demand_history`: trilha de alterações de status e observações.

## Decisões e limites conhecidos
- O estudo descreve anexos de fotografias/documentos como funcionalidade desejável. O fluxo de upload binário ainda não foi implementado; o formulário contempla localização textual e coordenadas. Não envie arquivos até que esse módulo seja adicionado.
- O mapa lista solicitações com coordenadas e abre a localização no OpenStreetMap; não é um mapa incorporado nem geocodifica endereços automaticamente.
- O primeiro PDF não especifica regras de autenticação, anexos obrigatórios, campos cadastrais detalhados ou metodologia técnica; as decisões mínimas adotadas estão descritas no código.
- A plataforma é complementar aos processos oficiais da Prefeitura, conforme o estudo complementar.
- Dados demográficos/CAF citados no documento são contexto do diagnóstico, não são apresentados como contagens em tempo real no dashboard.
- Antes de produção: configurar HTTPS, segredo JWT robusto, política de backup, gestão de senhas, logs/monitoramento, limites de upload, política de privacidade/LGPD, revisão de permissões e testes de segurança. Credenciais seed são exclusivamente demonstrativas.

## Testes e validação
- `python -m compileall backend` verifica sintaxe dos módulos Python.
- `npm run build` verifica tipos TypeScript e gera o bundle de produção.
- Para testar a integração, inicie PostgreSQL, API e Vite localmente e teste login, cadastro e atualização de demandas.
- A API possui endpoint `/api/health` e documentação OpenAPI em `/docs`.

Não há garantia de implantação produtiva sem configuração de ambiente, testes com usuários reais e validação das regras da Secretaria. Verifique os resultados locais dos comandos acima antes da apresentação.
