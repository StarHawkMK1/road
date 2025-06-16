from typing import Dict, List, Optional
from abc import ABC, abstractmethod

from app.schemas.llm import ModelInfo, LLMProvider
from app.services.llm_providers.base_provider import BaseLLMProvider
from app.services.llm_providers.openai import OpenAIProvider
from app.services.llm_providers.anthropic import AnthropicProvider
from app.services.llm_providers.google import GoogleProvider
from app.services.llm_providers.groq import GroqProvider
from app.services.llm_providers.huggingface import HuggingFaceProvider

class LLMFactory:
    """Factory class for managing LLM providers."""
    
    _providers: Dict[str, BaseLLMProvider] = {}
    _initialized = False
    
    @classmethod
    def _initialize_providers(cls):
        """Initialize all LLM providers."""
        if cls._initialized:
            return
        
        cls._providers = {
            "openai": OpenAIProvider(),
            "anthropic": AnthropicProvider(),
            "google": GoogleProvider(),
            "groq": GroqProvider(),
            "huggingface": HuggingFaceProvider()
        }
        cls._initialized = True
    
    @classmethod
    def get_service(cls, provider: str) -> BaseLLMProvider:
        """Get LLM service by provider name."""
        cls._initialize_providers()
        
        if provider not in cls._providers:
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
        return cls._providers[provider]
    
    @classmethod
    def get_available_models(cls) -> List[ModelInfo]:
        """Get list of all available models from all providers."""
        cls._initialize_providers()
        
        all_models = []
        for provider_name, provider in cls._providers.items():
            try:
                models = provider.get_available_models()
                all_models.extend(models)
            except Exception as e:
                print(f"Error getting models from {provider_name}: {e}")
                # Continue with other providers
                continue
        
        return all_models
    
    @classmethod
    def get_provider_models(cls, provider: str) -> List[ModelInfo]:
        """Get models for a specific provider."""
        cls._initialize_providers()
        
        if provider not in cls._providers:
            raise ValueError(f"Unsupported LLM provider: {provider}")
        
        return cls._providers[provider].get_available_models()
    
    @classmethod
    def get_supported_providers(cls) -> List[str]:
        """Get list of supported provider names."""
        cls._initialize_providers()
        return list(cls._providers.keys())
    
    @classmethod
    def is_provider_available(cls, provider: str) -> bool:
        """Check if a provider is available and properly configured."""
        cls._initialize_providers()
        
        if provider not in cls._providers:
            return False
        
        try:
            return cls._providers[provider].is_available()
        except Exception:
            return False
    
    @classmethod
    def get_provider_status(cls) -> Dict[str, dict]:
        """Get status of all providers."""
        cls._initialize_providers()
        
        status = {}
        for provider_name, provider in cls._providers.items():
            try:
                is_available = provider.is_available()
                models_count = len(provider.get_available_models()) if is_available else 0
                
                status[provider_name] = {
                    "available": is_available,
                    "models_count": models_count,
                    "error": None
                }
            except Exception as e:
                status[provider_name] = {
                    "available": False,
                    "models_count": 0,
                    "error": str(e)
                }
        
        return status 