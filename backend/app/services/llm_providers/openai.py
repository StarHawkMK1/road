from typing import List, Optional, AsyncGenerator
import openai
from openai import AsyncOpenAI

from app.core.config import settings
from app.schemas.llm import (
    ChatMessage,
    LLMParameters,
    ModelInfo,
    LLMProvider,
    StreamChunk
)
from app.services.llm_providers.base_provider import BaseLLMProvider, LLMResponse

class OpenAIProvider(BaseLLMProvider):
    """OpenAI LLM provider implementation."""
    
    def __init__(self):
        super().__init__()
        self.provider_name = "OpenAI"
        self.api_key = settings.OPENAI_API_KEY
        self.client = None
        
        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)
    
    def get_available_models(self) -> List[ModelInfo]:
        """Get list of available OpenAI models."""
        models = [
            ModelInfo(
                name="gpt-4.1",
                provider=LLMProvider.OPENAI,
                description="GPT-4.1 - 복잡한 작업을 위한 플래그십 GPT 모델",
                max_tokens=32768,
                supports_streaming=True,
                supports_functions=True,
                parameters={
                    "temperature": {"min": 0, "max": 2, "default": 1},
                    "max_tokens": {"min": 1, "max": 32768, "default": 20000},
                    "top_p": {"min": 0, "max": 1, "default": 1},
                    "presence_penalty": {"min": -2, "max": 2, "default": 0},
                    "frequency_penalty": {"min": -2, "max": 2, "default": 0}
                }
            ),
            ModelInfo(
                name="gpt-4-turbo-preview",
                provider=LLMProvider.OPENAI,
                description="GPT-4 Turbo - Faster and more cost-effective",
                max_tokens=128000,
                supports_streaming=True,
                supports_functions=True,
                parameters={
                    "temperature": {"min": 0, "max": 2, "default": 1},
                    "max_tokens": {"min": 1, "max": 4096, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1},
                    "presence_penalty": {"min": -2, "max": 2, "default": 0},
                    "frequency_penalty": {"min": -2, "max": 2, "default": 0}
                }
            ),
            ModelInfo(
                name="gpt-3.5-turbo",
                provider=LLMProvider.OPENAI,
                description="GPT-3.5 Turbo - Fast and efficient for most tasks",
                max_tokens=4096,
                supports_streaming=True,
                supports_functions=True,
                parameters={
                    "temperature": {"min": 0, "max": 2, "default": 1},
                    "max_tokens": {"min": 1, "max": 4096, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1},
                    "presence_penalty": {"min": -2, "max": 2, "default": 0},
                    "frequency_penalty": {"min": -2, "max": 2, "default": 0}
                }
            ),
            ModelInfo(
                name="gpt-3.5-turbo-16k",
                provider=LLMProvider.OPENAI,
                description="GPT-3.5 Turbo with 16K context window",
                max_tokens=16384,
                supports_streaming=True,
                supports_functions=True,
                parameters={
                    "temperature": {"min": 0, "max": 2, "default": 1},
                    "max_tokens": {"min": 1, "max": 16384, "default": 1000},
                    "top_p": {"min": 0, "max": 1, "default": 1},
                    "presence_penalty": {"min": -2, "max": 2, "default": 0},
                    "frequency_penalty": {"min": -2, "max": 2, "default": 0}
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
        """Send a chat request to OpenAI."""
        if not self.client:
            raise Exception("OpenAI client not initialized. Please check your API key.")
        
        try:
            formatted_messages = self._format_messages(messages, system_prompt)
            params = self._prepare_parameters(parameters)
            
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=formatted_messages,
                stream=False,
                **params
            )
            
            usage_info = None
            if hasattr(response, 'usage') and response.usage:
                usage_info = {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            
            return LLMResponse(
                content=response.choices[0].message.content,
                usage=usage_info,
                model=response.model,
                finish_reason=response.choices[0].finish_reason
            )
            
        except Exception as e:
            raise Exception(self._handle_error(e))
    
    async def stream_chat(
        self,
        model_name: str,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        parameters: Optional[LLMParameters] = None
    ) -> AsyncGenerator[StreamChunk, None]:
        """Stream chat responses from OpenAI."""
        if not self.client:
            raise Exception("OpenAI client not initialized. Please check your API key.")
        
        try:
            formatted_messages = self._format_messages(messages, system_prompt)
            params = self._prepare_parameters(parameters)
            
            stream = await self.client.chat.completions.create(
                model=model_name,
                messages=formatted_messages,
                stream=True,
                **params
            )
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield StreamChunk(
                        content=chunk.choices[0].delta.content,
                        finished=False
                    )
            
            # Send final chunk
            yield StreamChunk(content="", finished=True)
            
        except Exception as e:
            raise Exception(self._handle_error(e))
    
    async def test_connection(self, model_name: Optional[str] = None) -> bool:
        """Test connection to OpenAI."""
        if not self.client:
            return False
        
        try:
            test_model = model_name or "gpt-3.5-turbo"
            response = await self.client.chat.completions.create(
                model=test_model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=1
            )
            return response is not None
            
        except Exception:
            return False
    
    def is_available(self) -> bool:
        """Check if OpenAI is properly configured."""
        return self.api_key is not None and self.client is not None 