from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .config import settings
from .database import get_db
from .models import User, Role


pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(value: str): return pwd.hash(value)

def verify_password(value: str, hashed: str): return pwd.verify(value, hashed)

def create_token(user: User):
    payload = {"sub": str(user.id), "role": user.role.value, "exp": datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")

def current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)):
    error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida ou expirada", headers={"WWW-Authenticate":"Bearer"})
    try: uid = jwt.decode(token, settings.secret_key, algorithms=["HS256"]).get("sub")
    except JWTError: raise error
    user = db.get(User, int(uid)) if uid else None
    if not user or not user.active: raise error
    return user

def require_staff(user: User = Depends(current_user)):
    if user.role not in (Role.admin, Role.staff): raise HTTPException(403, "Acesso restrito à equipe da Secretaria")
    return user

def require_admin(user: User = Depends(current_user)):
    if user.role != Role.admin: raise HTTPException(403, "Acesso exclusivo ao administrador")
    return user
