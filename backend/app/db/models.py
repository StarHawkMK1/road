from sqlalchemy import Column, String, Text, Boolean, DateTime, ARRAY, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.session import Base

class Prompt(Base):
    """Prompt model for storing prompt templates and versions."""
    
    __tablename__ = "prompts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    version = Column(String(50), nullable=False, default="1.0")
    content = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    author = Column(String(255), nullable=True)
    tags = Column(ARRAY(String), nullable=True, default=[])
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Prompt(name='{self.name}', version='{self.version}')>"

class Conversation(Base):
    """Conversation model for storing chat history."""
    
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(String(255), nullable=False, index=True)
    model_name = Column(String(100), nullable=False)
    model_provider = Column(String(50), nullable=False)
    system_prompt = Column(Text, nullable=True)
    messages = Column(JSON, nullable=False)  # Store conversation messages as JSON
    parameters = Column(JSON, nullable=True)  # Store model parameters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Conversation(session_id='{self.session_id}', model='{self.model_name}')>"

class RAGPipeline(Base):
    """RAG Pipeline model for storing pipeline configurations (Phase 2)."""
    
    __tablename__ = "rag_pipelines"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    configuration = Column(JSON, nullable=False)  # Store pipeline config as JSON
    status = Column(String(50), default="draft")  # draft, active, inactive
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<RAGPipeline(name='{self.name}', status='{self.status}')>" 