from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime

from app.db.models import Prompt
from app.schemas.prompt import (
    PromptCreate,
    PromptUpdate,
    PromptResponse,
    PromptListResponse,
    PromptSearchRequest,
    StorageConfigUpdate
)
from app.core.config import settings

class PromptService:
    """Service class for prompt management operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_prompt(self, prompt_id: uuid.UUID) -> Optional[PromptResponse]:
        """Get a prompt by ID."""
        prompt = self.db.query(Prompt).filter(Prompt.id == prompt_id).first()
        return PromptResponse.from_orm(prompt) if prompt else None
    
    async def get_prompt_by_name_version(
        self, 
        name: str, 
        version: str
    ) -> Optional[PromptResponse]:
        """Get a prompt by name and version."""
        prompt = self.db.query(Prompt).filter(
            and_(Prompt.name == name, Prompt.version == version)
        ).first()
        return PromptResponse.from_orm(prompt) if prompt else None
    
    async def search_prompts(
        self, 
        search_request: PromptSearchRequest
    ) -> PromptListResponse:
        """Search prompts with filtering and pagination."""
        query = self.db.query(Prompt)
        
        # Apply filters
        if search_request.query:
            search_term = f"%{search_request.query}%"
            query = query.filter(
                or_(
                    Prompt.name.ilike(search_term),
                    Prompt.content.ilike(search_term),
                    Prompt.description.ilike(search_term)
                )
            )
        
        if search_request.tags:
            query = query.filter(Prompt.tags.overlap(search_request.tags))
        
        if search_request.author:
            query = query.filter(Prompt.author == search_request.author)
        
        if search_request.is_active is not None:
            query = query.filter(Prompt.is_active == search_request.is_active)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (search_request.page - 1) * search_request.page_size
        prompts = query.offset(offset).limit(search_request.page_size).all()
        
        return PromptListResponse(
            prompts=[PromptResponse.from_orm(prompt) for prompt in prompts],
            total=total,
            page=search_request.page,
            page_size=search_request.page_size
        )
    
    async def create_prompt(self, prompt_data: PromptCreate) -> PromptResponse:
        """Create a new prompt."""
        # Create database record
        db_prompt = Prompt(
            name=prompt_data.name,
            version=prompt_data.version,
            content=prompt_data.content,
            description=prompt_data.description,
            author=prompt_data.author,
            tags=prompt_data.tags or []
        )
        
        self.db.add(db_prompt)
        self.db.commit()
        self.db.refresh(db_prompt)
        
        # Save to JSON if enabled
        if settings.ENABLE_JSON_STORAGE:
            await self._save_to_json(db_prompt)
        
        return PromptResponse.from_orm(db_prompt)
    
    async def update_prompt(
        self, 
        prompt_id: uuid.UUID, 
        prompt_update: PromptUpdate
    ) -> Optional[PromptResponse]:
        """Update an existing prompt."""
        db_prompt = self.db.query(Prompt).filter(Prompt.id == prompt_id).first()
        
        if not db_prompt:
            return None
        
        # Update fields
        update_data = prompt_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_prompt, field, value)
        
        self.db.commit()
        self.db.refresh(db_prompt)
        
        # Update JSON if enabled
        if settings.ENABLE_JSON_STORAGE:
            await self._save_to_json(db_prompt)
        
        return PromptResponse.from_orm(db_prompt)
    
    async def delete_prompt(self, prompt_id: uuid.UUID) -> bool:
        """Delete a prompt."""
        db_prompt = self.db.query(Prompt).filter(Prompt.id == prompt_id).first()
        
        if not db_prompt:
            return False
        
        # Delete from JSON if enabled
        if settings.ENABLE_JSON_STORAGE:
            await self._delete_from_json(db_prompt)
        
        self.db.delete(db_prompt)
        self.db.commit()
        
        return True
    
    async def get_prompt_versions(self, name: str) -> List[PromptResponse]:
        """Get all versions of a prompt by name."""
        prompts = self.db.query(Prompt).filter(
            Prompt.name == name
        ).order_by(Prompt.created_at.desc()).all()
        
        return [PromptResponse.from_orm(prompt) for prompt in prompts]
    
    async def get_search_suggestions(self, query: str) -> List[str]:
        """Get search suggestions based on query."""
        suggestions = []
        
        # Get name suggestions
        names = self.db.query(Prompt.name).filter(
            Prompt.name.ilike(f"%{query}%")
        ).distinct().limit(5).all()
        suggestions.extend([name[0] for name in names])
        
        # Get tag suggestions
        if len(suggestions) < 10:
            # This is a simplified approach - in production you might want a proper tag index
            tags = self.db.query(Prompt.tags).filter(
                Prompt.tags.isnot(None)
            ).limit(20).all()
            
            for tag_array in tags:
                if tag_array:
                    for tag in tag_array:
                        if query.lower() in tag.lower() and tag not in suggestions:
                            suggestions.append(tag)
                            if len(suggestions) >= 10:
                                break
                if len(suggestions) >= 10:
                    break
        
        return suggestions[:10]
    
    async def update_storage_config(self, config: StorageConfigUpdate) -> dict:
        """Update storage configuration."""
        # This would typically update application settings
        # For now, we'll return the current config
        return {
            "enable_json_storage": config.enable_json_storage,
            "enable_db_storage": config.enable_db_storage,
            "json_storage_path": config.json_storage_path or settings.JSON_STORAGE_PATH
        }
    
    async def _save_to_json(self, prompt: Prompt) -> None:
        """Save prompt to JSON file."""
        try:
            os.makedirs(settings.JSON_STORAGE_PATH, exist_ok=True)
            
            filename = f"{prompt.name}_{prompt.version}.json"
            filepath = os.path.join(settings.JSON_STORAGE_PATH, filename)
            
            prompt_data = {
                "id": str(prompt.id),
                "name": prompt.name,
                "version": prompt.version,
                "content": prompt.content,
                "description": prompt.description,
                "author": prompt.author,
                "tags": prompt.tags,
                "is_active": prompt.is_active,
                "created_at": prompt.created_at.isoformat() if prompt.created_at else None,
                "updated_at": prompt.updated_at.isoformat() if prompt.updated_at else None
            }
            
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(prompt_data, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"Error saving prompt to JSON: {e}")
    
    async def _delete_from_json(self, prompt: Prompt) -> None:
        """Delete prompt JSON file."""
        try:
            filename = f"{prompt.name}_{prompt.version}.json"
            filepath = os.path.join(settings.JSON_STORAGE_PATH, filename)
            
            if os.path.exists(filepath):
                os.remove(filepath)
                
        except Exception as e:
            print(f"Error deleting prompt JSON file: {e}") 