"""Popula o banco com dados de demonstração.

Pré-requisito: as tabelas já devem existir (rode `alembic upgrade head` antes).
O script é seguro para rodar mais de uma vez: se o administrador já existe,
nada é criado.
"""
from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models import (
    Association,
    Community,
    Demand,
    DemandHistory,
    DemandStatus,
    Priority,
    Role,
    User,
)
from app.security import hash_password

ADMIN_EMAIL = "admin@agrodemanda.com"

COMMUNITY_NAMES = [
    "Magana",
    "Lagoa do Barbosa",
    "Barra da Cruz",
    "Cacimba de Baixo",
    "Carrapicho Velho",
    "Carrapicho Novo",
]

# (título, descrição, categoria, índice da comunidade, status, prioridade)
DEMAND_SAMPLES = [
    (
        "Preparo de solo para plantio",
        "Solicitação de apoio para preparo de solo em área de milho.",
        "Preparo e correção de solo",
        0,
        "Em análise",
        "Alta",
    ),
    (
        "Manutenção de estrada rural",
        "Trecho de acesso precisa de manutenção para escoamento da produção.",
        "Manutenção de estradas rurais",
        1,
        "Programada",
        "Urgente",
    ),
    (
        "Distribuição de sementes",
        "Solicitação de sementes para o próximo período de plantio.",
        "Distribuição de sementes",
        2,
        "Concluída",
        "Média",
    ),
    (
        "Abastecimento de água",
        "Apoio para abastecimento de água na comunidade.",
        "Abastecimento e recursos hídricos",
        3,
        "Pendente",
        "Alta",
    ),
]


def create_users(db):
    admin = User(
        name="Administrador AGRODEMANDA",
        email=ADMIN_EMAIL,
        phone="(81) 90000-0000",
        password_hash=hash_password("Admin@123"),
        role=Role.admin,
    )
    staff = User(
        name="Equipe Secretaria",
        email="secretaria@agrodemanda.com",
        password_hash=hash_password("Agro@123"),
        role=Role.staff,
    )
    farmer = User(
        name="Maria de Souza",
        email="agricultor@agrodemanda.com",
        phone="(81) 98888-0000",
        password_hash=hash_password("Agro@123"),
        role=Role.farmer,
    )
    db.add_all([admin, staff, farmer])
    db.flush()
    return staff, farmer


def create_communities(db):
    communities = [Community(name=name) for name in COMMUNITY_NAMES]
    db.add_all(communities)
    db.flush()

    db.add(
        Association(
            name="Associação Rural de Magana",
            community_id=communities[0].id,
            contact_name="João Silva",
        )
    )
    return communities


def create_demands(db, communities, staff, farmer):
    now = datetime.utcnow()

    for i, (title, description, category, community_index, status, priority) in enumerate(
        DEMAND_SAMPLES
    ):
        demand_status = next(x for x in DemandStatus if x.value == status)
        demand_priority = next(x for x in Priority if x.value == priority)

        demand = Demand(
            title=title,
            description=description,
            category=category,
            kind="Coletiva" if i == 1 else "Individual",
            community_id=communities[community_index].id,
            requester_id=farmer.id,
            estimated_quantity=2.5 if i == 0 else None,
            quantity_unit="hectares" if i == 0 else None,
            status=demand_status,
            priority=demand_priority,
            assigned_to="Equipe de campo" if i in (1, 2) else None,
            created_at=now - timedelta(days=18 - i * 3),
            completed_at=now - timedelta(days=4) if i == 2 else None,
        )
        db.add(demand)
        db.flush()

        db.add(
            DemandHistory(
                demand_id=demand.id,
                user_id=staff.id,
                new_status=demand_status.value,
                note="Registro inicial de demonstração",
            )
        )


def seed():
    db = SessionLocal()
    try:
        if db.query(User).filter_by(email=ADMIN_EMAIL).first():
            print("Dados de demonstração já existem. Nada foi alterado.")
            return

        staff, farmer = create_users(db)
        communities = create_communities(db)
        create_demands(db, communities, staff, farmer)

        db.commit()
        print("Dados de demonstração criados com sucesso.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
