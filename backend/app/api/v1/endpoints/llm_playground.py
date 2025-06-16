from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
import json
import uuid
from datetime import datetime

from app.db.session import get_db
from app.schemas.llm import (
    ChatRequest,
    ChatResponse,
    StreamChunk,
    ModelInfo,
    ModelListResponse,
    ConversationListResponse,
    ConversationDetail,
    ChatMessage,
    MessageRole
)
from app.services.llm_factory import LLMFactory
from app.services.conversation_service import ConversationService

router = APIRouter()

@router.get("/models", response_model=ModelListResponse)
async def get_available_models():
    """Get list of available LLM models."""
    try:
        models = LLMFactory.get_available_models()
        return ModelListResponse(
            models=models,
            total=len(models)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get models: {str(e)}")

@router.post("/chat", response_model=ChatResponse)
async def chat_with_llm(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Send a chat message to an LLM model."""
    try:
        # Get LLM service
        llm_service = LLMFactory.get_service(request.model_provider)
        
        # Generate response
        start_time = datetime.now()
        response = await llm_service.chat(
            model_name=request.model_name,
            messages=request.messages,
            system_prompt=request.system_prompt,
            parameters=request.parameters
        )
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds()
        
        # Create response message
        assistant_message = ChatMessage(
            role=MessageRole.ASSISTANT,
            content=response.content,
            timestamp=datetime.now()
        )
        
        # Save conversation if session_id provided
        if request.session_id:
            conversation_service = ConversationService(db)
            await conversation_service.save_conversation(
                session_id=request.session_id,
                model_name=request.model_name,
                model_provider=request.model_provider,
                system_prompt=request.system_prompt,
                messages=request.messages + [assistant_message],
                parameters=request.parameters
            )
        
        return ChatResponse(
            message=assistant_message,
            model_name=request.model_name,
            model_provider=request.model_provider.value,
            parameters=request.parameters,
            usage=response.usage,
            response_time=response_time,
            session_id=request.session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat request failed: {str(e)}")

@router.post("/stream")
async def stream_chat_with_llm(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Stream chat responses from an LLM model."""
    try:
        # Get LLM service
        llm_service = LLMFactory.get_service(request.model_provider)
        
        async def generate_stream():
            try:
                full_content = ""
                async for chunk in llm_service.stream_chat(
                    model_name=request.model_name,
                    messages=request.messages,
                    system_prompt=request.system_prompt,
                    parameters=request.parameters
                ):
                    full_content += chunk.content
                    
                    stream_chunk = StreamChunk(
                        content=chunk.content,
                        finished=False,
                        session_id=request.session_id
                    )
                    yield f"data: {stream_chunk.json()}\n\n"
                
                # Send final chunk
                final_chunk = StreamChunk(
                    content="",
                    finished=True,
                    session_id=request.session_id
                )
                yield f"data: {final_chunk.json()}\n\n"
                
                # Save conversation if session_id provided
                if request.session_id and full_content:
                    assistant_message = ChatMessage(
                        role=MessageRole.ASSISTANT,
                        content=full_content,
                        timestamp=datetime.now()
                    )
                    
                    conversation_service = ConversationService(db)
                    await conversation_service.save_conversation(
                        session_id=request.session_id,
                        model_name=request.model_name,
                        model_provider=request.model_provider,
                        system_prompt=request.system_prompt,
                        messages=request.messages + [assistant_message],
                        parameters=request.parameters
                    )
                    
            except Exception as e:
                error_chunk = StreamChunk(
                    content=f"Error: {str(e)}",
                    finished=True,
                    session_id=request.session_id
                )
                yield f"data: {error_chunk.json()}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream request failed: {str(e)}")

@router.get("/conversations", response_model=ConversationListResponse)
async def get_conversations(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    model_provider: Optional[str] = Query(None, description="Filter by model provider"),
    db: Session = Depends(get_db)
):
    """Get list of conversation summaries."""
    try:
        conversation_service = ConversationService(db)
        result = await conversation_service.get_conversations(
            page=page,
            page_size=page_size,
            model_provider=model_provider
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversations: {str(e)}")

@router.get("/conversations/{session_id}", response_model=ConversationDetail)
async def get_conversation_detail(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed conversation by session ID."""
    try:
        conversation_service = ConversationService(db)
        conversation = await conversation_service.get_conversation_detail(session_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation: {str(e)}")

@router.delete("/conversations/{session_id}", status_code=204)
async def delete_conversation(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Delete a conversation."""
    try:
        conversation_service = ConversationService(db)
        success = await conversation_service.delete_conversation(session_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete conversation: {str(e)}")

@router.post("/test-connection/{provider}")
async def test_llm_connection(
    provider: str,
    model_name: Optional[str] = Query(None, description="Model name to test")
):
    """Test connection to an LLM provider."""
    try:
        # Validate provider
        if provider not in ["openai", "anthropic", "google", "groq", "huggingface"]:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        llm_service = LLMFactory.get_service(provider)
        result = await llm_service.test_connection(model_name)
        
        return {
            "provider": provider,
            "model_name": model_name or "default",
            "status": "connected" if result else "failed",
            "message": "Connection successful" if result else "Connection failed"
        }
        
    except Exception as e:
        return {
            "provider": provider,
            "model_name": model_name or "default",
            "status": "error",
            "message": str(e)
        } 