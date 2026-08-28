from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from datetime import datetime
import uuid

from app.schemas.response import (
    ChatRequest, ChatResponse, ChatHistoryResponse, ChatMessageSchema
)
from app.schemas.query import SearchFilters
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.services.vector_store import VectorStore
from app.models.database import get_db, ChatSession, ChatMessage
from sqlalchemy.orm import Session

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Main chat endpoint for troubleshooting queries"""
    start_time = datetime.now()
    
    try:
        # Initialize services
        vector_store = VectorStore()
        await vector_store.initialize()
        
        rag_service = RAGService(vector_store)
        ai_service = AIService()
        
        # Retrieve context
        rag_context = rag_service.retrieve_context(
            query=request.query,
            k=request.filters.get('k', 5) if request.filters else 5,
            search_mode=request.search_mode,
            filters=request.filters
        )
        
        # Generate prompts
        prompts = rag_service.generate_prompts(request.query, rag_context)
        
        # Generate answer
        answer = ai_service.generate_answer(
            query=request.query,
            context=prompts.user_prompt,
            model_params={'temperature': 0.7}
        )
        
        # Format citations
        from app.schemas.response import Citation
        citations = [
            Citation(
                source_doc=c.source_doc,
                page=c.page,
                excerpt=c.content[:200],
                confidence=c.score
            )
            for c in rag_context.retrieved_chunks
        ]
        
        # Calculate response time
        response_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Save to database if session_id provided
        session_id = request.session_id
        if session_id:
            # Get or create session
            session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
            if not session:
                session = ChatSession(id=session_id)
                db.add(session)
                db.commit()
            
            # Save user message
            user_message = ChatMessage(
                session_id=session_id,
                role='user',
                content=request.query,
                timestamp=datetime.now()
            )
            db.add(user_message)
            
            # Save assistant message
            assistant_message = ChatMessage(
                session_id=session_id,
                role='assistant',
                content=answer.text,
                source_documents=str(rag_context.sources),
                citations=str([c.dict() for c in citations]),
                timestamp=datetime.now(),
                response_time_ms=int(response_time)
            )
            db.add(assistant_message)
            db.commit()
        
        return ChatResponse(
            answer=answer.text,
            citations=citations,
            reasoning=answer.reasoning,
            sources_used=rag_context.sources,
            response_time_ms=response_time,
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")


@router.get("/history/{session_id}", response_model=ChatHistoryResponse)
async def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Retrieve past conversation for a session"""
    try:
        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.timestamp).all()
        
        chat_messages = []
        for msg in messages:
            chat_messages.append(ChatMessageSchema(
                role=msg.role,
                content=msg.content,
                timestamp=msg.timestamp,
                source_documents=eval(msg.source_documents) if msg.source_documents else [],
                citations=eval(msg.citations) if msg.citations else []
            ))
        
        return ChatHistoryResponse(
            session_id=session_id,
            messages=chat_messages,
            created_at=session.created_at,
            updated_at=session.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")


@router.post("/stream")
async def stream_chat(request: ChatRequest):
    """WebSocket or SSE endpoint for real-time streaming"""
    from fastapi.responses import StreamingResponse
    
    async def generate():
        try:
            vector_store = VectorStore()
            await vector_store.initialize()
            
            rag_service = RAGService(vector_store)
            ai_service = AIService()
            
            # Retrieve context
            rag_context = rag_service.retrieve_context(
                query=request.query,
                k=5,
                search_mode=request.search_mode
            )
            
            # Generate prompts
            prompts = rag_service.generate_prompts(request.query, rag_context)
            
            # Stream response
            for chunk in ai_service.stream_response(
                query=request.query,
                context=prompts.user_prompt
            ):
                yield f"data: {chunk}\n\n"
            
        except Exception as e:
            yield f"data: {{'error': '{str(e)}'}}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
