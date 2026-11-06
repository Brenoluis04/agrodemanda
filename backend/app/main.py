from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import csv, io
from .database import Base, engine, get_db
from . import models as m, schemas as s
from .security import hash_password, verify_password, create_token, current_user, require_staff, require_admin
from .config import settings

app = FastAPI(title=settings.app_name, version="1.0.0", description="Gestão municipal das demandas rurais")
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
#Base.metadata.create_all(bind=engine)

@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    db.execute(func.now())
    return {"status":"ok", "service":"AGRODEMANDA API"}

@app.post("/api/auth/register", response_model=s.TokenOut, status_code=201)
def register(data: s.UserCreate, db: Session = Depends(get_db)):
    if db.query(m.User).filter(m.User.email == data.email).first(): raise HTTPException(409, "E-mail já cadastrado")
    user = m.User(name=data.name, email=data.email, phone=data.phone, password_hash=hash_password(data.password), role=m.Role.farmer)
    db.add(user); db.commit(); db.refresh(user)
    return {"access_token":create_token(user), "user":user}

@app.post("/api/auth/login", response_model=s.TokenOut)
def login(data: s.LoginIn, db: Session = Depends(get_db)):
    user = db.query(m.User).filter(m.User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash): raise HTTPException(401, "E-mail ou senha incorretos")
    if not user.active: raise HTTPException(403, "Usuário desativado")
    return {"access_token":create_token(user), "user":user}

@app.get("/api/auth/me", response_model=s.UserOut)
def me(user: m.User = Depends(current_user)): return user

@app.get("/api/communities", response_model=list[s.CommunityOut])
def communities(db: Session = Depends(get_db)): return db.query(m.Community).order_by(m.Community.name).all()

@app.get("/api/associations", response_model=list[s.AssociationOut])
def associations(db: Session = Depends(get_db), user: m.User = Depends(current_user)):
    return db.query(m.Association).order_by(m.Association.name).all()

@app.post("/api/associations", response_model=s.AssociationOut, status_code=201)
def create_association(data: s.AssociationIn, db: Session = Depends(get_db), user: m.User = Depends(require_staff)):
    if not db.get(m.Community, data.community_id): raise HTTPException(404, "Comunidade não encontrada")
    item=m.Association(**data.model_dump()); db.add(item); db.commit(); db.refresh(item); return item

def serialize_demand(d):
    return {"id":d.id,"protocol":d.protocol,"title":d.title,"description":d.description,"category":d.category,"kind":d.kind,"estimated_quantity":d.estimated_quantity,"quantity_unit":d.quantity_unit,"community_id":d.community_id,"community_name":d.community.name,"requester_id":d.requester_id,"requester_name":d.requester.name,"association_name":d.association_name,"location_text":d.location_text,"latitude":d.latitude,"longitude":d.longitude,"status":d.status,"priority":d.priority,"assigned_to":d.assigned_to,"scheduled_for":d.scheduled_for,"created_at":d.created_at,"updated_at":d.updated_at,"completed_at":d.completed_at}

@app.post("/api/demands", response_model=s.DemandOut, status_code=201)
def create_demand(data: s.DemandCreate, db: Session = Depends(get_db), user: m.User = Depends(current_user)):
    if data.kind not in ("Individual", "Coletiva"): raise HTTPException(422, "Tipo de demanda inválido")
    if not db.get(m.Community, data.community_id): raise HTTPException(404, "Comunidade não encontrada")
    demand=m.Demand(**data.model_dump(), requester_id=user.id)
    db.add(demand); db.flush()
    db.add(m.DemandHistory(demand_id=demand.id,user_id=user.id,new_status=demand.status.value,note="Demanda registrada"))
    db.commit(); db.refresh(demand); return serialize_demand(demand)

@app.get("/api/demands", response_model=list[s.DemandOut])
def list_demands(status_filter: str|None=None, community_id: int|None=None, category: str|None=None, db: Session=Depends(get_db), user: m.User=Depends(current_user)):
    q=db.query(m.Demand).options(joinedload(m.Demand.community),joinedload(m.Demand.requester))
    if user.role == m.Role.farmer: q=q.filter(m.Demand.requester_id==user.id)
    if status_filter:
        try: parsed_status = m.DemandStatus(status_filter)
        except ValueError: raise HTTPException(422, "Status inválido")
        q=q.filter(m.Demand.status==parsed_status)
    if community_id: q=q.filter(m.Demand.community_id==community_id)
    if category: q=q.filter(m.Demand.category==category)
    return [serialize_demand(d) for d in q.order_by(m.Demand.created_at.desc()).all()]

@app.get("/api/demands/{demand_id}", response_model=s.DemandOut)
def get_demand(demand_id:int, db:Session=Depends(get_db), user:m.User=Depends(current_user)):
    d=db.query(m.Demand).options(joinedload(m.Demand.community),joinedload(m.Demand.requester)).filter(m.Demand.id==demand_id).first()
    if not d: raise HTTPException(404,"Demanda não encontrada")
    if user.role==m.Role.farmer and d.requester_id!=user.id: raise HTTPException(403,"Você não tem acesso a esta demanda")
    return serialize_demand(d)

@app.patch("/api/demands/{demand_id}", response_model=s.DemandOut)
def update_demand(demand_id:int, data:s.DemandUpdate, db:Session=Depends(get_db), user:m.User=Depends(require_staff)):
    d=db.query(m.Demand).options(joinedload(m.Demand.community),joinedload(m.Demand.requester)).filter(m.Demand.id==demand_id).first()
    if not d: raise HTTPException(404,"Demanda não encontrada")
    old=d.status.value
    values=data.model_dump(exclude_unset=True)
    note=values.pop("note",None)
    for k,v in values.items(): setattr(d,k,v)
    if d.status==m.DemandStatus.completed and not d.completed_at: d.completed_at=datetime.utcnow()
    if d.status!=m.DemandStatus.completed: d.completed_at=None
    if d.status.value!=old or note:
        db.add(m.DemandHistory(demand_id=d.id,user_id=user.id,old_status=old,new_status=d.status.value,note=note))
    db.commit(); db.refresh(d); return serialize_demand(d)

@app.get("/api/demands/{demand_id}/history", response_model=list[s.HistoryOut])
def demand_history(demand_id:int, db:Session=Depends(get_db), user:m.User=Depends(current_user)):
    d=db.get(m.Demand,demand_id)
    if not d: raise HTTPException(404,"Demanda não encontrada")
    if user.role==m.Role.farmer and d.requester_id!=user.id: raise HTTPException(403,"Sem permissão")
    return db.query(m.DemandHistory).filter_by(demand_id=demand_id).order_by(m.DemandHistory.created_at.desc()).all()

@app.get("/api/dashboard")
def dashboard(db:Session=Depends(get_db), user:m.User=Depends(require_staff)):
    total=db.query(m.Demand).count()
    by_status={x.value:db.query(m.Demand).filter(m.Demand.status==x).count() for x in m.DemandStatus}
    by_community=db.query(m.Community.name,func.count(m.Demand.id)).outerjoin(m.Demand).group_by(m.Community.id).order_by(func.count(m.Demand.id).desc()).all()
    by_category=db.query(m.Demand.category,func.count(m.Demand.id)).group_by(m.Demand.category).order_by(func.count(m.Demand.id).desc()).all()
    avg=db.query(func.avg(func.extract('epoch',m.Demand.completed_at-m.Demand.created_at)/86400)).filter(m.Demand.completed_at.isnot(None)).scalar()
    return {"total":total,"farmers":db.query(m.User).filter(m.User.role==m.Role.farmer).count(),"communities":db.query(m.Community).count(),"associations":db.query(m.Association).count(),"by_status":by_status,"by_community":[{"name":n,"total":c} for n,c in by_community],"by_category":[{"name":n,"total":c} for n,c in by_category],"average_days":round(float(avg),1) if avg else 0,"completed_rate":round(by_status.get("Concluída",0)*100/total,1) if total else 0}

@app.get("/api/reports/demands.csv")
def report_csv(db:Session=Depends(get_db), user:m.User=Depends(require_staff)):
    rows=db.query(m.Demand).options(joinedload(m.Demand.community),joinedload(m.Demand.requester)).order_by(m.Demand.created_at.desc()).all()
    stream=io.StringIO(); w=csv.writer(stream,delimiter=';'); w.writerow(["Protocolo","Título","Tipo","Categoria","Comunidade","Solicitante","Status","Prioridade","Responsável","Criada em","Concluída em"])
    for d in rows: w.writerow([d.protocol,d.title,d.kind,d.category,d.community.name,d.requester.name,d.status.value,d.priority.value,d.assigned_to or "",d.created_at.strftime('%d/%m/%Y'),d.completed_at.strftime('%d/%m/%Y') if d.completed_at else ""])
    stream.seek(0)
    return StreamingResponse(iter(["\ufeff"+stream.getvalue()]),media_type="text/csv; charset=utf-8",headers={"Content-Disposition":"attachment; filename=relatorio_agrodemanda.csv"})

@app.get("/api/admin/users", response_model=list[s.UserOut])
def users(db:Session=Depends(get_db), user:m.User=Depends(require_admin)): return db.query(m.User).order_by(m.User.name).all()

@app.patch("/api/admin/users/{user_id}/role", response_model=s.UserOut)
def set_role(user_id:int, role:m.Role, db:Session=Depends(get_db), user:m.User=Depends(require_admin)):
    target=db.get(m.User,user_id)
    if not target: raise HTTPException(404,"Usuário não encontrado")
    target.role=role; db.commit(); db.refresh(target); return target
