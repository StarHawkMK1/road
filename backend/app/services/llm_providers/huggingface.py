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

class HuggingFaceProvider(BaseLLMProvider):
    """Hugging Face LLM provider implementation."""
    
    def __init__(self):
        super().__init__()
        self.provider_name = "Hugging Face"
        self.api_key = settings.HUGGINGFACE_API_KEY
    
    def get_available_models(self) -> List[ModelInfo]:
        """Get list of available Hugging Face models."""
        models = [
            ModelInfo(
                name="microsoft/DialoGPT-medium",
                provider=LLMProvider.HUGGINGFACE,
                description="DialoGPT Medium - Conversational AI model",
                max_tokens=1024,
                supports_streaming=False,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 0.7},
                    "max_tokens": {"min": 1, "max": 1024, "default": 100},
                    "top_p": {"min": 0, "max": 1, "default": 0.9}
                }
            ),
            ModelInfo(
                name="meta-llama/Llama-2-7b-chat-hf",
                provider=LLMProvider.HUGGINGFACE,
                description="Llama 2 7B Chat - Open source conversational model",
                max_tokens=4096,
                supports_streaming=False,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 0.7},
                    "max_tokens": {"min": 1, "max": 4096, "default": 512},
                    "top_p": {"min": 0, "max": 1, "default": 0.9}
                }
            ),
            ModelInfo(
                name="mistralai/Mistral-7B-Instruct-v0.1",
                provider=LLMProvider.HUGGINGFACE,
                description="Mistral 7B Instruct - High-performance instruction following",
                max_tokens=8192,
                supports_streaming=False,
                parameters={
                    "temperature": {"min": 0, "max": 1, "default": 0.7},
                    "max_tokens": {"min": 1, "max": 8192, "default": 512},
                    "top_p": {"min": 0, "max": 1, "default": 0.9}
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
        """Send a chat request to Hugging Face."""
        if not self.api_key:
            raise Exception("Hugging Face API key not configured.")
        
        # TODO: Implement actual Hugging Face API integration
        return LLMResponse(
            content="This is a mock response from Hugging Face. HF integration will be implemented in Phase 2.",
            usage={"prompt_tokens": 12, "completion_tokens": 18, "total_tokens": 30},
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
        """Stream chat responses from Hugging Face."""
        if not self.api_key:
            raise Exception("Hugging Face API key not configured.")
        
        mock_response = "This is a mock streaming response from Hugging Face."
        for char in mock_response:
            yield StreamChunk(content=char, finished=False)
        
        yield StreamChunk(content="", finished=True)
    
    async def test_connection(self, model_name: Optional[str] = None) -> bool:
        """Test connection to Hugging Face."""
        return self.api_key is not None
    
    def is_available(self) -> bool:
        """Check if Hugging Face is properly configured."""
        return self.api_key is not None 