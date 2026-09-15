from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.db_models import SessionDB, MessageDB, ArtifactDB
from app.schemas.chat_schemas import SessionSchema, MessageSchema, ArtifactSchema

router = APIRouter()

@router.get("/sessions", response_model=List[SessionSchema])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SessionDB)
        .options(selectinload(SessionDB.messages), selectinload(SessionDB.artifacts))
        .order_by(SessionDB.updated_at.desc())
    )
    sessions = result.scalars().all()
    
    # Convert citations JSON into CitationItem schema objects if present
    res_data = []
    for s in sessions:
        msgs = []
        for m in s.messages:
            msgs.append(MessageSchema(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                citations=m.citations_json,
                created_at=m.created_at
            ))
        arts = [ArtifactSchema.model_validate(a) for a in s.artifacts]
        res_data.append(SessionSchema(
            id=s.id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            messages=msgs,
            artifacts=arts
        ))
    return res_data

@router.post("/sessions", response_model=SessionSchema, status_code=status.HTTP_201_CREATED)
async def create_session(db: AsyncSession = Depends(get_db)):
    new_session = SessionDB(title="New Growth Conversation")
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return SessionSchema(
        id=new_session.id,
        title=new_session.title,
        created_at=new_session.created_at,
        updated_at=new_session.updated_at,
        messages=[],
        artifacts=[]
    )

@router.get("/sessions/{session_id}", response_model=SessionSchema)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SessionDB)
        .where(SessionDB.id == session_id)
        .options(selectinload(SessionDB.messages), selectinload(SessionDB.artifacts))
    )
    session_obj = result.scalar_one_or_none()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")

    msgs = []
    for m in session_obj.messages:
        msgs.append(MessageSchema(
            id=m.id,
            session_id=m.session_id,
            role=m.role,
            content=m.content,
            citations=m.citations_json,
            created_at=m.created_at
        ))
    arts = [ArtifactSchema.model_validate(a) for a in session_obj.artifacts]

    return SessionSchema(
        id=session_obj.id,
        title=session_obj.title,
        created_at=session_obj.created_at,
        updated_at=session_obj.updated_at,
        messages=msgs,
        artifacts=arts
    )

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SessionDB).where(SessionDB.id == session_id))
    session_obj = result.scalar_one_or_none()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found")
    
    await db.delete(session_obj)
    await db.commit()
    return None
