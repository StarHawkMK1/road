from typing import List, Optional, AsyncGenerator

from app.core.config import settings
from app.schemas.llm import (
    ChatMessage,
    LLMParameters,
    ModelInfo,
    LLMProvider,
    StreamChunk
)
from app.services.llm_providers.base_provider import BaseLLMProvider, LLMResponse

class GroqProvider(BaseLLMProvider):
    """Groq LLM provider implementation."""
    
    def __init__(self):
        super().__init__()
        self.provider_name = "Groq"
        self.api_key = settings.GROQ_API_KEY
    
    def get_available_models(self) -> List[ModelInfo]:
        """Get list of available Groq models."""
        models = [
            ModelInfo(
                name="llama3-8b-8192",
                provider=LLMProvider.GROQ,
                description="Llama 3 8B - Fast inference with 8K context",
                max_tokens=8192,
                supports_streaming=True,
                parameters={
                    "temperature": {"min": 0, "max": 2, "default": 1},
                    "max_tokens": {"min": 1, "max": 8192, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1}
                }
            ),
            ModelInfo(
                name="llama3-70b-8192",
                provider=LLMProvider.GROQ,
                description="Llama 3 70B - More capable with 8K context",
                max_tokens=8192,
                supports_streaming=True,
                parameters={
                    "temperature": {"min": 0, "max": 2, "default": 1},
                    "max_tokens": {"min": 1, "max": 8192, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1}
                }
            ),
            ModelInfo(
                name="mixtral-8x7b-32768",
                provider=LLMProvider.GROQ,
                description="Mixtral 8x7B - High performance mixture of experts",
                max_tokens=32768,
                supports_streaming=True,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 0.5},
                    "max_tokens": {"min": 1, "max": 32768, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1}
                }
            )
        ]
        return models
    
    async def chat(
        self,
        model_name: str,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        parameters: Optional[LLMParameters] = None
    ) -> LLMResponse:
        """Send a chat request to Groq."""
        if not self.api_key:
            raise Exception("Groq API key not configured.")
        
        # TODO: Implement actual Groq API integration
        return LLMResponse(
            content="This is a mock response from Groq. Groq integration will be implemented in Phase 2.",
            usage={"prompt_tokens": 6, "completion_tokens": 10, "total_tokens": 16},
            model=model_name,
            finish_reason="stop"
        )
    
    async def stream_chat(
        self,
        model_name: str,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        parameters: Optional[LLMParameters] = None
    ) -> AsyncGenerator[StreamChunk, None]:
        """Stream chat responses from Groq."""
        if not self.api_key:
            raise Exception("Groq API key not configured.")
        
        mock_response = "This is a mock streaming response from Groq."
        for char in mock_response:
            yield StreamChunk(content=char, finished=False)
        
        yield StreamChunk(content="", finished=True)
    
    async def test_connection(self, model_name: Optional[str] = None) -> bool:
        """Test connection to Groq."""
        return self.api_key is not None
    
    def is_available(self) -> bool:
        """Check if Groq is properly configured."""
        return self.api_key is not None 