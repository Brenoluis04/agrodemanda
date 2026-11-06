from app.database import SessionLocal, Base, engine
from app.models import User, Community, Association, Role, Demand, DemandStatus, Priority, DemandHistory
from app.security import hash_password
from datetime import datetime, timedelta
#Base.metadata.create_all(bind=engine)
db=SessionLocal()
try:
    if not db.query(User).filter_by(email="admin@agrodemanda.com").first():
        admin=User(name="Administrador AGRODEMANDA",email="admin@agrodemanda.com",phone="(81) 90000-0000",password_hash=hash_password("Admin@123"),role=Role.admin)
        staff=User(name="Equipe Secretaria",email="secretaria@agrodemanda.com",password_hash=hash_password("Agro@123"),role=Role.staff)
        farmer=User(name="Maria de Souza",email="agricultor@agrodemanda.com",phone="(81) 98888-0000",password_hash=hash_password("Agro@123"),role=Role.farmer)
        db.add_all([admin,staff,farmer]); db.flush()
        names=["Magana","Lagoa do Barbosa","Barra da Cruz","Cacimba de Baixo","Carrapicho Velho","Carrapicho Novo"]
        communities=[Community(name=n) for n in names]; db.add_all(communities); db.flush()
        db.add(Association(name="Associação Rural de Magana",community_id=communities[0].id,contact_name="João Silva"))
        samples=[("Preparo de solo para plantio","Solicitação de apoio para preparo de solo em área de milho.","Preparo e correção de solo",0,"Em análise","Alta"),("Manutenção de estrada rural","Trecho de acesso precisa de manutenção para escoamento da produção.","Manutenção de estradas rurais",1,"Programada","Urgente"),("Distribuição de sementes","Solicitação de sementes para o próximo período de plantio.","Distribuição de sementes",2,"Concluída","Média"),("Abastecimento de água","Apoio para abastecimento de água na comunidade.","Abastecimento e recursos hídricos",3,"Pendente","Alta")]
        for i,(title,desc,cat,cidx,status,priority) in enumerate(samples):
            st=next(x for x in DemandStatus if x.value==status); pr=next(x for x in Priority if x.value==priority)
            d=Demand(title=title,description=desc,category=cat,kind="Coletiva" if i==1 else "Individual",community_id=communities[cidx].id,requester_id=farmer.id,estimated_quantity=2.5 if i==0 else None,quantity_unit="hectares" if i==0 else None,status=st,priority=pr,assigned_to="Equipe de campo" if i in (1,2) else None,created_at=datetime.utcnow()-timedelta(days=18-i*3),completed_at=datetime.utcnow()-timedelta(days=4) if i==2 else None)
            db.add(d); db.flush(); db.add(DemandHistory(demand_id=d.id,user_id=staff.id,new_status=st.value,note="Registro inicial de demonstração"))
        db.commit()
finally: db.close()
