
from datetime import datetime, timedelta

from app.database import SessionLocal, Base, engine
from app.models import (
    User,
    Community,
    Association,
    Role,
    Demand,
    DemandStatus,
    Priority,
    DemandHistory,
)
from app.security import hash_password


# Cria as tabelas caso ainda não existam
# Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Verifica se o administrador já está cadastrado
    admin_exists = (
        db.query(User)
        .filter_by(email="admin@agrodemanda.com")
        .first()
    )

    if not admin_exists:

        # ==========================================
        # 1. CADASTRO DOS USUÁRIOS
        # ==========================================

        admin = User(
            name="Administrador AGRODEMANDA",
            email="admin@agrodemanda.com",
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

        # ==========================================
        # 2. CADASTRO DAS COMUNIDADES
        # ==========================================

        names = [
            "Magana",
            "Lagoa do Barbosa",
            "Barra da Cruz",
            "Cacimba de Baixo",
            "Carrapicho Velho",
            "Carrapicho Novo",
        ]

        communities = [
            Community(name=name)
            for name in names
        ]

        db.add_all(communities)
        db.flush()

        # ==========================================
        # 3. CADASTRO DA ASSOCIAÇÃO
        # ==========================================

        association = Association(
            name="Associação Rural de Magana",
            community_id=communities[0].id,
            contact_name="João Silva",
        )

        db.add(association)

        # ==========================================
        # 4. DADOS DAS DEMANDAS DE DEMONSTRAÇÃO
        # ==========================================

        samples = [
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

        # ==========================================
        # 5. CADASTRO DAS DEMANDAS E HISTÓRICOS
        # ==========================================

        for i, (
            title,
            desc,
            category,
            community_index,
            status,
            priority,
        ) in enumerate(samples):

            demand_status = next(
                item for item in DemandStatus
                if item.value == status
            )

            demand_priority = next(
                item for item in Priority
                if item.value == priority
            )

            demand = Demand(
                title=title,
                description=desc,
                category=category,
                kind="Coletiva" if i == 1 else "Individual",
                community_id=communities[community_index].id,
                requester_id=farmer.id,
                estimated_quantity=2.5 if i == 0 else None,
                quantity_unit="hectares" if i == 0 else None,
                status=demand_status,
                priority=demand_priority,
                assigned_to="Equipe de campo" if i in (1, 2) else None,
                created_at=datetime.utcnow() - timedelta(days=18 - i * 3),
                completed_at=(
                    datetime.utcnow() - timedelta(days=4)
                    if i == 2
                    else None
                ),
            )

            db.add(demand)
            db.flush()

            # Registra o histórico da demanda
            history = DemandHistory(
                demand_id=demand.id,
                user_id=staff.id,
                new_status=demand_status.value,
                note="Registro inicial de demonstração",
            )

            db.add(history)

        # ==========================================
        # 6. SALVAMENTO NO BANCO DE DADOS
        # ==========================================

        db.commit()

        print("Dados de demonstração cadastrados com sucesso!")

    else:
        print("O administrador já existe. Nenhum dado foi inserido.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()
