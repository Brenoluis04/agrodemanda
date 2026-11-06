from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Classe base dos modelos do SQLAlchemy."""


def get_db():
    """Fornece uma sessão do banco para cada requisição e a fecha ao final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
