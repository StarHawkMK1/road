from sqlalchemy import Column, String, Text, Boolean, DateTime, ARRAY, JSON, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from sqlalchemy.orm import relationship

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

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    graph_data = Column(JSON, nullable=False)  # stores nodes and edges
    workflow_metadata = Column(JSON, nullable=True)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    status = Column(String(50), nullable=False, default="running")
    inputs = Column(JSON, nullable=True)
    outputs = Column(JSON, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    node_executions = relationship("NodeExecution", back_populates="execution", cascade="all, delete-orphan")


class NodeExecution(Base):
    __tablename__ = "node_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False)
    node_id = Column(String(255), nullable=False)
    node_type = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="running")
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    execution = relationship("WorkflowExecution", back_populates="node_executions")


class WorkflowTemplate(Base):
    __tablename__ = "workflow_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    graph_data = Column(JSON, nullable=False)
    template_metadata = Column(JSON, nullable=True)
    is_public = Column(Boolean, default=False)
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WorkflowShare(Base):
    __tablename__ = "workflow_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    shared_by = Column(String(255), nullable=False)
    shared_with = Column(String(255), nullable=True)  # null means public
    permission = Column(String(20), default="read")  # read, write, execute
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    workflow = relationship("Workflow") 