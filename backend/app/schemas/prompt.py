from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime
import uuid

class PromptBase(BaseModel):
    """Base schema for Prompt with common fields."""
    name: str = Field(..., min_length=1, max_length=255, description="Prompt name")
    version: str = Field(default="1.0", max_length=50, description="Prompt version")
    content: str = Field(..., min_length=1, description="Prompt content")
    description: Optional[str] = Field(None, description="Prompt description")
    author: Optional[str] = Field(None, max_length=255, description="Prompt author")
    tags: Optional[List[str]] = Field(default=[], description="Tags for categorization")
    
    @validator('tags')
    def validate_tags(cls, v):
        if v is None:
            return []
        return [tag.strip().lower() for tag in v if tag.strip()]

class PromptCreate(PromptBase):
    """Schema for creating a new prompt."""
    pass

class PromptUpdate(BaseModel):
    """Schema for updating an existing prompt."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    version: Optional[str] = Field(None, max_length=50)
    content: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    author: Optional[str] = Field(None, max_length=255)
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    
    @validator('tags')
    def validate_tags(cls, v):
        if v is None:
            return v
        return [tag.strip().lower() for tag in v if tag.strip()]

class PromptInDB(PromptBase):
    """Schema for prompt stored in database."""
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PromptResponse(PromptInDB):
    """Schema for prompt API response."""
    pass

class PromptListResponse(BaseModel):
    """Schema for list of prompts response."""
    prompts: List[PromptResponse]
    total: int
    page: int = 1
    page_size: int = 50

class PromptVersionResponse(BaseModel):
    """Schema for prompt version history."""
    versions: List[PromptResponse]
    total_versions: int

class StorageConfigUpdate(BaseModel):
    """Schema for updating storage configuration."""
    enable_json_storage: bool = Field(default=True, description="Enable JSON file storage")
    enable_db_storage: bool = Field(default=True, description="Enable database storage")
    json_storage_path: Optional[str] = Field(None, description="JSON storage path")

class PromptSearchRequest(BaseModel):
    """Schema for prompt search request."""
    query: Optional[str] = Field(None, description="Search query")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    author: Optional[str] = Field(None, description="Filter by author")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=50, ge=1, le=100, description="Items per page") 