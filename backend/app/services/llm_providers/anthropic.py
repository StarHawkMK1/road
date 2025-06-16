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

class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude LLM provider implementation."""
    
    def __init__(self):
        super().__init__()
        self.provider_name = "Anthropic"
        self.api_key = settings.ANTHROPIC_API_KEY
    
    def get_available_models(self) -> List[ModelInfo]:
        """Get list of available Anthropic models."""
        models = [
            ModelInfo(
                name="claude-3-opus-20240229",
                provider=LLMProvider.ANTHROPIC,
                description="Claude 3 Opus - Most powerful model for complex tasks",
                max_tokens=4096,
                supports_streaming=True,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 1},
                    "max_tokens": {"min": 1, "max": 4096, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1}
                }
            ),
            ModelInfo(
                name="claude-3-sonnet-20240229",
                provider=LLMProvider.ANTHROPIC,
                description="Claude 3 Sonnet - Balanced performance and speed",
                max_tokens=4096,
                supports_streaming=True,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 1},
                    "max_tokens": {"min": 1, "max": 4096, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1}
                }
            ),
            ModelInfo(
                name="claude-3-haiku-20240307",
                provider=LLMProvider.ANTHROPIC,
                description="Claude 3 Haiku - Fast and efficient",
                max_tokens=4096,
                supports_streaming=True,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 1},
                    "max_tokens": {"min": 1, "max": 4096, "default": 1000},
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
        """Send a chat request to Anthropic Claude."""
        if not self.api_key:
            raise Exception("Anthropic API key not configured.")
        
        # TODO: Implement actual Anthropic API integration
        # For now, return a mock response
        return LLMResponse(
            content="This is a mock response from Claude. Anthropic integration will be implemented in Phase 2.",
            usage={"prompt_tokens": 10, "completion_tokens": 15, "total_tokens": 25},
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
        """Stream chat responses from Anthropic Claude."""
        if not self.api_key:
            raise Exception("Anthropic API key not configured.")
        
        # TODO: Implement actual streaming
        mock_response = "This is a mock streaming response from Claude."
        for i, char in enumerate(mock_response):
            yield StreamChunk(content=char, finished=False)
        
        yield StreamChunk(content="", finished=True)
    
    async def test_connection(self, model_name: Optional[str] = None) -> bool:
        """Test connection to Anthropic."""
        return self.api_key is not None
    
    def is_available(self) -> bool:
        """Check if Anthropic is properly configured."""
        return self.api_key is not None 