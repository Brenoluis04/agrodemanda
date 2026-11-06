import enum, uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Float, Enum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base

class Role(str, enum.Enum):
    admin = "admin"
    staff = "staff"
    farmer = "farmer"

class DemandStatus(str, enum.Enum):
    pending = "Pendente"
    analysis = "Em análise"
    scheduled = "Programada"
    in_progress = "Em execução"
    completed = "Concluída"
    rejected = "Indeferida"

class Priority(str, enum.Enum):
    low = "Baixa"
    medium = "Média"
    high = "Alta"
    urgent = "Urgente"

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(140))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.farmer)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    demands: Mapped[list["Demand"]] = relationship(back_populates="requester", foreign_keys="Demand.requester_id")

class Community(Base):
    __tablename__ = "communities"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    demands: Mapped[list["Demand"]] = relationship(back_populates="community")

class Association(Base):
    __tablename__ = "associations"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    community_id: Mapped[int] = mapped_column(ForeignKey("communities.id"))
    contact_name: Mapped[str | None] = mapped_column(String(140), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)

class Demand(Base):
    __tablename__ = "demands"
    id: Mapped[int] = mapped_column(primary_key=True)
    protocol: Mapped[str] = mapped_column(String(32), unique=True, index=True, default=lambda: "AGD-" + uuid.uuid4().hex[:10].upper())
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(120))
    kind: Mapped[str] = mapped_column(String(20), default="Individual")
    estimated_quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    quantity_unit: Mapped[str | None] = mapped_column(String(30), nullable=True)
    community_id: Mapped[int] = mapped_column(ForeignKey("communities.id"))
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    association_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    location_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[DemandStatus] = mapped_column(Enum(DemandStatus), default=DemandStatus.pending)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.medium)
    assigned_to: Mapped[str | None] = mapped_column(String(140), nullable=True)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    requester: Mapped[User] = relationship(back_populates="demands", foreign_keys=[requester_id])
    community: Mapped[Community] = relationship(back_populates="demands")
    history: Mapped[list["DemandHistory"]] = relationship(back_populates="demand", cascade="all, delete-orphan", order_by="DemandHistory.created_at")

class DemandHistory(Base):
    __tablename__ = "demand_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    demand_id: Mapped[int] = mapped_column(ForeignKey("demands.id"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    old_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    new_status: Mapped[str] = mapped_column(String(40))
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    demand: Mapped[Demand] = relationship(back_populates="history")
