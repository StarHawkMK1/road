# backend/app/schemas/llm.py
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from enum import Enum

class LLMProvider(str, Enum):
    """Supported LLM providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    GROQ = "groq"
    HUGGINGFACE = "huggingface"

class MessageRole(str, Enum):
    """Chat message roles."""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessage(BaseModel):
    """Schema for chat messages."""
    model_config = {
        "protected_namespaces": (),
        "use_enum_values": True
    }
    
    role: MessageRole
    content: str = Field(..., min_length=1, description="Message content")
    timestamp: Optional[datetime] = None

class LLMParameters(BaseModel):
    """Schema for LLM generation parameters."""
    model_config = {"protected_namespaces": ()}
    
    temperature: float = Field(default=1.0, ge=0.0, le=2.0, description="Sampling temperature")
    max_tokens: int = Field(default=1000, ge=1, le=8192, description="Maximum tokens to generate")
    top_p: Optional[float] = Field(default=1.0, ge=0.0, le=1.0, description="Top-p sampling")
    presence_penalty: Optional[float] = Field(default=0.0, ge=-2.0, le=2.0, description="Presence penalty")
    frequency_penalty: Optional[float] = Field(default=0.0, ge=-2.0, le=2.0, description="Frequency penalty")
    stop: Optional[List[str]] = Field(default=None, description="Stop sequences")

class ChatRequest(BaseModel):
    """Schema for chat request."""
    model_config = {"protected_namespaces": ()}
    
    llm_model_name: str = Field(..., description="LLM model name")
    llm_model_provider: LLMProvider = Field(..., description="LLM provider")
    messages: List[ChatMessage] = Field(..., min_items=1, description="Conversation messages")
    system_prompt: Optional[str] = Field(None, description="System prompt")
    parameters: LLMParameters = Field(default_factory=LLMParameters, description="Generation parameters")
    stream: bool = Field(default=False, description="Enable streaming response")
    session_id: Optional[str] = Field(None, description="Session ID for conversation tracking")

class ChatResponse(BaseModel):
    """Schema for chat response."""
    model_config = {"protected_namespaces": ()}
    
    message: ChatMessage
    llm_model_name: str
    llm_model_provider: str
    parameters: LLMParameters
    usage: Optional[Dict[str, Any]] = None  # Token usage info
    response_time: Optional[float] = None  # Response time in seconds
    session_id: Optional[str] = None

class StreamChunk(BaseModel):
    """Schema for streaming response chunks."""
    model_config = {"protected_namespaces": ()}
    
    content: str
    finished: bool = False
    session_id: Optional[str] = None

class ModelInfo(BaseModel):
    """Schema for LLM model information."""
    model_config = {
        "protected_namespaces": (),
        "use_enum_values": True
    }
    
    name: str
    provider: LLMProvider
    description: str
    max_tokens: int
    supports_streaming: bool = True
    supports_functions: bool = False
    parameters: Dict[str, Dict[str, Any]]  # Parameter definitions with min/max/default

class ModelListResponse(BaseModel):
    """Schema for list of available models."""
    model_config = {"protected_namespaces": ()}
    
    models: List[ModelInfo]
    total: int

class ProviderInfo(BaseModel):
    """Schema for LLM provider information."""
    model_config = {"protected_namespaces": ()}
    
    id: str
    name: str
    description: str
    available: bool
    configured: bool
    error: Optional[str] = None

class ProviderListResponse(BaseModel):
    """Schema for list of available providers."""
    model_config = {"protected_namespaces": ()}
    
    providers: List[ProviderInfo]
    total: int

class ConversationSummary(BaseModel):
    """Schema for conversation summary."""
    model_config = {"protected_namespaces": ()}
    
    session_id: str
    llm_model_name: str
    llm_model_provider: str
    message_count: int
    first_message_at: datetime
    last_message_at: datetime
    total_tokens: Optional[int] = None

class ConversationListResponse(BaseModel):
    """Schema for list of conversations."""
    model_config = {"protected_namespaces": ()}
    
    conversations: List[ConversationSummary]
    total: int
    page: int = 1
    page_size: int = 50

class ConversationDetail(BaseModel):
    """Schema for detailed conversation."""
    model_config = {"protected_namespaces": ()}
    
    session_id: str
    llm_model_name: str
    llm_model_provider: str
    system_prompt: Optional[str]
    messages: List[ChatMessage]
    parameters: LLMParameters
    created_at: datetime
    updated_at: datetime