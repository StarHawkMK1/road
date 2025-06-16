from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.db.session import get_db
from app.schemas.prompt import (
    PromptCreate,
    PromptUpdate,
    PromptResponse,
    PromptListResponse,
    PromptVersionResponse,
    StorageConfigUpdate,
    PromptSearchRequest
)
from app.services.prompt_service import PromptService

router = APIRouter()

@router.get("", response_model=PromptListResponse)
async def list_prompts(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query"),
    tags: Optional[List[str]] = Query(None, description="Filter by tags"),
    author: Optional[str] = Query(None, description="Filter by author"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    """Get list of prompts with optional filtering."""
    search_request = PromptSearchRequest(
        query=search,
        tags=tags,
        author=author,
        is_active=is_active,
        page=page,
        page_size=page_size
    )
    
    prompt_service = PromptService(db)
    result = await prompt_service.search_prompts(search_request)
    return result

@router.get("/{prompt_id}", response_model=PromptResponse)
async def get_prompt(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get a specific prompt by ID."""
    prompt_service = PromptService(db)
    prompt = await prompt_service.get_prompt(prompt_id)
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return prompt

@router.post("", response_model=PromptResponse, status_code=201)
async def create_prompt(
    prompt: PromptCreate,
    db: Session = Depends(get_db)
):
    """Create a new prompt."""
    prompt_service = PromptService(db)
    
    # Check if prompt with same name and version already exists
    existing = await prompt_service.get_prompt_by_name_version(prompt.name, prompt.version)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Prompt with name '{prompt.name}' and version '{prompt.version}' already exists"
        )
    
    new_prompt = await prompt_service.create_prompt(prompt)
    return new_prompt

@router.put("/{prompt_id}", response_model=PromptResponse)
async def update_prompt(
    prompt_id: uuid.UUID,
    prompt_update: PromptUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing prompt."""
    prompt_service = PromptService(db)
    
    # Check if prompt exists
    existing_prompt = await prompt_service.get_prompt(prompt_id)
    if not existing_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Check for name/version conflicts if updating those fields
    if prompt_update.name or prompt_update.version:
        name = prompt_update.name or existing_prompt.name
        version = prompt_update.version or existing_prompt.version
        
        if name != existing_prompt.name or version != existing_prompt.version:
            conflict_prompt = await prompt_service.get_prompt_by_name_version(name, version)
            if conflict_prompt and conflict_prompt.id != prompt_id:
                raise HTTPException(
                    status_code=400,
                    detail=f"Prompt with name '{name}' and version '{version}' already exists"
                )
    
    updated_prompt = await prompt_service.update_prompt(prompt_id, prompt_update)
    return updated_prompt

@router.delete("/{prompt_id}", status_code=204)
async def delete_prompt(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Delete a prompt."""
    prompt_service = PromptService(db)
    
    success = await prompt_service.delete_prompt(prompt_id)
    if not success:
        raise HTTPException(status_code=404, detail="Prompt not found")

@router.get("/{prompt_id}/versions", response_model=PromptVersionResponse)
async def get_prompt_versions(
    prompt_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get all versions of a prompt by its name."""
    prompt_service = PromptService(db)
    
    # First get the prompt to find its name
    prompt = await prompt_service.get_prompt(prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    versions = await prompt_service.get_prompt_versions(prompt.name)
    return PromptVersionResponse(
        versions=versions,
        total_versions=len(versions)
    )

@router.post("/storage-config")
async def update_storage_config(
    config: StorageConfigUpdate,
    db: Session = Depends(get_db)
):
    """Update storage configuration settings."""
    prompt_service = PromptService(db)
    result = await prompt_service.update_storage_config(config)
    
    return {
        "message": "Storage configuration updated successfully",
        "config": result
    }

@router.get("/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db)
):
    """Get search suggestions for prompts."""
    prompt_service = PromptService(db)
    suggestions = await prompt_service.get_search_suggestions(query)
    
    return {
        "suggestions": suggestions
    } 