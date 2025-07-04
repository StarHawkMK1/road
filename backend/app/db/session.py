from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(
    settings.database_url_sync,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.DEBUG
)

# Create SessionLocal class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create Base class for models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    Used with FastAPI's Depends() function.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create database tables."""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """Drop all database tables (use with caution!)."""
    Base.metadata.drop_all(bind=engine) 