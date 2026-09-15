from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.chat_schemas import ChatRequest
from app.services.agent_service import AgentService

router = APIRouter()

@router.post("/chat/stream")
async def stream_chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Streams assistant tokens via Server-Sent Events (SSE).
    Emits JSON metadata, tokens, generated artifacts, and completion marker [DONE].
    """
    generator = AgentService.process_chat_stream(db, request)
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
