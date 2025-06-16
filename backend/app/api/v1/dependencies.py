from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.db.session import get_db
from app.core.config import settings

def get_database_session() -> Session:
    """Get database session dependency."""
    return Depends(get_db)

def verify_api_key(api_key: Optional[str] = None) -> bool:
    """
    Verify API key (placeholder for future authentication).
    Currently returns True as Phase 1 doesn't implement authentication.
    """
    # TODO: Implement actual API key verification in Phase 2
    return True

def check_rate_limit(request_id: Optional[str] = None) -> bool:
    """
    Check rate limiting (placeholder for future implementation).
    Currently returns True as Phase 1 doesn't implement rate limiting.
    """
    # TODO: Implement actual rate limiting in Phase 2
    return True

def validate_llm_provider(provider: str) -> str:
    """Validate LLM provider name."""
    valid_providers = ["openai", "anthropic", "google", "groq", "huggingface"]
    
    if provider.lower() not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid provider '{provider}'. Valid providers are: {', '.join(valid_providers)}"
        )
    
    return provider.lower()

def get_storage_config() -> dict:
    """Get current storage configuration."""
    return {
        "enable_json_storage": settings.ENABLE_JSON_STORAGE,
        "enable_db_storage": settings.ENABLE_DB_STORAGE,
        "json_storage_path": settings.JSON_STORAGE_PATH
    } 