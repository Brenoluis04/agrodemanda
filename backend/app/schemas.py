from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from .models import Role, DemandStatus, Priority

class UserCreate(BaseModel):
    name: str = Field(min_length=3, max_length=140)
    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=8, max_length=72)

class UserOut(BaseModel):
    id: int; name: str; email: EmailStr; phone: str | None; role: Role
    model_config = ConfigDict(from_attributes=True)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class CommunityOut(BaseModel):
    id: int; name: str; description: str | None
    model_config = ConfigDict(from_attributes=True)

class AssociationIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    community_id: int
    contact_name: str | None = None
    phone: str | None = None

class AssociationOut(AssociationIn):
    id: int
    model_config = ConfigDict(from_attributes=True)

class DemandCreate(BaseModel):
    title: str = Field(min_length=4, max_length=160)
    description: str = Field(min_length=10)
    category: str
    kind: str = "Individual"
    estimated_quantity: float | None = Field(default=None, ge=0)
    quantity_unit: str | None = None
    community_id: int
    association_name: str | None = None
    location_text: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)

class DemandUpdate(BaseModel):
    status: DemandStatus | None = None
    priority: Priority | None = None
    assigned_to: str | None = None
    scheduled_for: datetime | None = None
    note: str | None = None

class DemandOut(BaseModel):
    id: int; protocol: str; title: str; description: str; category: str; kind: str
    estimated_quantity: float | None; quantity_unit: str | None; community_id: int
    community_name: str; requester_id: int; requester_name: str; association_name: str | None
    location_text: str | None; latitude: float | None; longitude: float | None
    status: DemandStatus; priority: Priority; assigned_to: str | None
    scheduled_for: datetime | None; created_at: datetime; updated_at: datetime; completed_at: datetime | None
    model_config = ConfigDict(from_attributes=True)

class HistoryOut(BaseModel):
    id: int; user_id: int; old_status: str | None; new_status: str; note: str | None; created_at: datetime
    model_config = ConfigDict(from_attributes=True)
