from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
import uuid
from datetime import datetime

from app.db.models import Conversation
from app.schemas.llm import (
    ChatMessage,
    LLMParameters,
    ConversationSummary,
    ConversationListResponse,
    ConversationDetail,
    LLMProvider
)

class ConversationService:
    """Service class for conversation management operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def save_conversation(
        self,
        session_id: str,
        model_name: str,
        model_provider: LLMProvider,
        system_prompt: Optional[str],
        messages: List[ChatMessage],
        parameters: LLMParameters
    ) -> str:
        """Save or update a conversation."""
        # Convert messages to dict format for JSON storage
        messages_dict = [
            {
                "role": msg.role.value if hasattr(msg.role, 'value') else msg.role,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None
            }
            for msg in messages
        ]
        
        # Convert parameters to dict
        parameters_dict = parameters.dict()
        
        # Check if conversation already exists
        existing_conversation = self.db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).first()
        
        if existing_conversation:
            # Update existing conversation
            existing_conversation.messages = messages_dict
            existing_conversation.parameters = parameters_dict
            existing_conversation.system_prompt = system_prompt
            existing_conversation.updated_at = datetime.utcnow()
        else:
            # Create new conversation
            new_conversation = Conversation(
                session_id=session_id,
                model_name=model_name,
                model_provider=model_provider.value if hasattr(model_provider, 'value') else model_provider,
                system_prompt=system_prompt,
                messages=messages_dict,
                parameters=parameters_dict
            )
            self.db.add(new_conversation)
        
        self.db.commit()
        return session_id
    
    async def get_conversations(
        self,
        page: int = 1,
        page_size: int = 50,
        model_provider: Optional[str] = None
    ) -> ConversationListResponse:
        """Get paginated list of conversation summaries."""
        query = self.db.query(Conversation)
        
        # Apply filters
        if model_provider:
            query = query.filter(Conversation.model_provider == model_provider)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        offset = (page - 1) * page_size
        conversations = query.order_by(desc(Conversation.updated_at)).offset(offset).limit(page_size).all()
        
        # Convert to summary format
        summaries = []
        for conv in conversations:
            message_count = len(conv.messages) if conv.messages else 0
            
            summaries.append(ConversationSummary(
                session_id=conv.session_id,
                model_name=conv.model_name,
                model_provider=conv.model_provider,
                message_count=message_count,
                first_message_at=conv.created_at,
                last_message_at=conv.updated_at,
                total_tokens=self._calculate_total_tokens(conv.messages) if conv.messages else None
            ))
        
        return ConversationListResponse(
            conversations=summaries,
            total=total,
            page=page,
            page_size=page_size
        )
    
    async def get_conversation_detail(self, session_id: str) -> Optional[ConversationDetail]:
        """Get detailed conversation by session ID."""
        conversation = self.db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).first()
        
        if not conversation:
            return None
        
        # Convert messages back to ChatMessage objects
        messages = []
        if conversation.messages:
            for msg_dict in conversation.messages:
                messages.append(ChatMessage(
                    role=msg_dict.get("role"),
                    content=msg_dict.get("content"),
                    timestamp=datetime.fromisoformat(msg_dict["timestamp"]) if msg_dict.get("timestamp") else None
                ))
        
        # Convert parameters back to LLMParameters object
        parameters = LLMParameters(**conversation.parameters) if conversation.parameters else LLMParameters()
        
        return ConversationDetail(
            session_id=conversation.session_id,
            model_name=conversation.model_name,
            model_provider=conversation.model_provider,
            system_prompt=conversation.system_prompt,
            messages=messages,
            parameters=parameters,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at
        )
    
    async def delete_conversation(self, session_id: str) -> bool:
        """Delete a conversation."""
        conversation = self.db.query(Conversation).filter(
            Conversation.session_id == session_id
        ).first()
        
        if not conversation:
            return False
        
        self.db.delete(conversation)
        self.db.commit()
        return True
    
    async def get_conversation_count_by_provider(self) -> dict:
        """Get conversation count grouped by provider."""
        result = self.db.query(
            Conversation.model_provider,
            func.count(Conversation.id).label('count')
        ).group_by(Conversation.model_provider).all()
        
        return {provider: count for provider, count in result}
    
    async def get_recent_conversations(self, limit: int = 10) -> List[ConversationSummary]:
        """Get most recent conversations."""
        conversations = self.db.query(Conversation).order_by(
            desc(Conversation.updated_at)
        ).limit(limit).all()
        
        summaries = []
        for conv in conversations:
            message_count = len(conv.messages) if conv.messages else 0
            
            summaries.append(ConversationSummary(
                session_id=conv.session_id,
                model_name=conv.model_name,
                model_provider=conv.model_provider,
                message_count=message_count,
                first_message_at=conv.created_at,
                last_message_at=conv.updated_at,
                total_tokens=self._calculate_total_tokens(conv.messages) if conv.messages else None
            ))
        
        return summaries
    
    def _calculate_total_tokens(self, messages: List[dict]) -> Optional[int]:
        """
        Calculate estimated total tokens for messages.
        This is a rough estimation - in production you might want to use
        actual tokenization libraries like tiktoken for OpenAI models.
        """
        if not messages:
            return None
        
        total_chars = 0
        for msg in messages:
            if isinstance(msg, dict) and "content" in msg:
                total_chars += len(msg["content"])
        
        # Rough estimation: ~4 characters per token
        return total_chars // 4 