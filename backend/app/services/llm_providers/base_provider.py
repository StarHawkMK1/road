from abc import ABC, abstractmethod
from typing import List, Optional, AsyncGenerator
from dataclasses import dataclass

from app.schemas.llm import (
    ChatMessage,
    LLMParameters,
    ModelInfo,
    LLMProvider,
    StreamChunk
)

@dataclass
class LLMResponse:
    """Response from LLM provider."""
    content: str
    usage: Optional[dict] = None
    model: Optional[str] = None
    finish_reason: Optional[str] = None

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""
    
    def __init__(self):
        self.provider_name = ""
        self.api_key = None
        self.base_url = None
    
    @abstractmethod
    def get_available_models(self) -> List[ModelInfo]:
        """Get list of available models for this provider."""
        pass
    
    @abstractmethod
    async def chat(
        self,
        model_name: str,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        parameters: Optional[LLMParameters] = None
    ) -> LLMResponse:
        """Send a chat request to the LLM."""
        pass
    
    @abstractmethod
    async def stream_chat(
        self,
        model_name: str,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        parameters: Optional[LLMParameters] = None
    ) -> AsyncGenerator[StreamChunk, None]:
        """Stream chat responses from the LLM."""
        pass
    
    @abstractmethod
    async def test_connection(self, model_name: Optional[str] = None) -> bool:
        """Test connection to the provider."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is properly configured and available."""
        pass
    
    def _format_messages(
        self, 
        messages: List[ChatMessage], 
        system_prompt: Optional[str] = None
    ) -> List[dict]:
        """Format messages for the provider's API."""
        formatted_messages = []
        
        # Add system prompt if provided
        if system_prompt:
            formatted_messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Add conversation messages
        for message in messages:
            formatted_messages.append({
                "role": message.role.value if hasattr(message.role, 'value') else message.role,
                "content": message.content
            })
        
        return formatted_messages
    
    def _prepare_parameters(self, parameters: Optional[LLMParameters]) -> dict:
        """Prepare parameters for the provider's API."""
        if not parameters:
            return {}
        
        # Convert to dict and remove None values
        params = parameters.dict(exclude_none=True)
        
        # Convert to provider-specific parameter names if needed
        return self._convert_parameters(params)
    
    def _convert_parameters(self, params: dict) -> dict:
        """Convert standard parameters to provider-specific names."""
        # Base implementation - override in subclasses if needed
        return params
    
    def _handle_error(self, error: Exception) -> str:
        """Handle and format errors consistently."""
        error_msg = str(error)
        
        # Common error handling
        if "authentication" in error_msg.lower() or "unauthorized" in error_msg.lower():
            return f"Authentication failed for {self.provider_name}. Please check your API key."
        elif "rate limit" in error_msg.lower():
            return f"Rate limit exceeded for {self.provider_name}. Please try again later."
        elif "model" in error_msg.lower() and "not found" in error_msg.lower():
            return f"Model not found or not available for {self.provider_name}."
        else:
            return f"{self.provider_name} error: {error_msg}" 