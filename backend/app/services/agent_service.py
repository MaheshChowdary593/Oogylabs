import logging
import json
import asyncio
from typing import AsyncGenerator, Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.db_models import SessionDB, MessageDB, ArtifactDB
from app.schemas.chat_schemas import ChatRequest, CitationItem
from app.services.rag_engine import RAGEngine
from app.services.llm_factory import LLMProviderFactory
from app.services.skills.ship30_skill import Ship30Skill
from app.services.skills.artifact_skill import ArtifactSkill

logger = logging.getLogger("lenny_assistant.agent_service")

class AgentService:

    @staticmethod
    async def process_chat_stream(
        db: AsyncSession,
        request: ChatRequest
    ) -> AsyncGenerator[str, None]:
        
        # 1. Retrieve or Create Session
        session_id = request.session_id
        session_obj = None
        if session_id:
            res = await db.execute(select(SessionDB).where(SessionDB.id == session_id))
            session_obj = res.scalar_one_or_none()

        if not session_obj:
            session_obj = SessionDB(
                title=request.message[:40] + ("..." if len(request.message) > 40 else "")
            )
            db.add(session_obj)
            await db.commit()
            await db.refresh(session_obj)
            session_id = session_obj.id

        # 2. Save User Message
        user_msg = MessageDB(
            session_id=session_id,
            role="user",
            content=request.message
        )
        db.add(user_msg)
        await db.commit()

        # 3. Retrieve Session History for Context
        res_history = await db.execute(
            select(MessageDB)
            .where(MessageDB.session_id == session_id)
            .order_by(MessageDB.created_at)
        )
        history_msgs = res_history.scalars().all()
        formatted_history = []
        for m in history_msgs[:-1]:  # Exclude current user msg from history list
            formatted_history.append({"role": m.role, "content": m.content})

        # 4. Perform RAG Retrieval
        retrieved_context, citations = await RAGEngine.search_relevant_transcripts(
            db, request.message, top_k=4
        )

        context_str = ""
        for idx, item in enumerate(retrieved_context, 1):
            context_str += f"\n--- TRANSCRIPT SOURCE [{idx}]: {item['guest']} on '{item['episode_title']}' ({item['topic']}) ---\n"
            context_str += f"{item['content']}\n"

        # 5. Determine Skill & System Prompt
        user_text_lower = request.message.lower()
        is_ship30 = request.skill == "ship30" or any(w in user_text_lower for w in ["ship 30", "1250 words", "long essay", "growth essay"])
        is_artifact_req = request.skill == "artifact" or is_ship30 or any(w in user_text_lower for w in ["html", "artifact", "dashboard", "spec", "template", "framework card"])

        system_prompt = """You are "The Lenny Growth Assistant", an elite product management and growth advisor trained exclusively on transcripts from Lenny's Podcast and Newsletter.

CORE GROUNDING INSTRUCTIONS:
1. Your answers MUST be strictly grounded in the provided podcast transcripts.
2. ALWAYS cite your sources using exact inline badges: `[Guest Name - Episode Title]` (e.g. `[Elena Verna - B2B Product-Led Growth]`).
3. If the provided transcript context does not contain enough evidence to answer the user's question, state clearly and politely:
   "Based on Lenny's Podcast transcripts currently in my knowledge base, I don't have sufficient details to answer this specific query."
4. Maintain a helpful, analytical, executive PM tone.
"""

        if is_ship30:
            system_prompt += "\n" + Ship30Skill.SYSTEM_INSTRUCTIONS
            system_prompt += "\n" + ArtifactSkill.SYSTEM_INSTRUCTIONS
            full_prompt = Ship30Skill.build_prompt(request.message, context_str)
        else:
            if is_artifact_req:
                system_prompt += "\n" + ArtifactSkill.SYSTEM_INSTRUCTIONS
            
            full_prompt = f"""USER QUESTION: {request.message}

GROUNDED TRANSCRIPT CONTEXT:
{context_str}

Please provide a detailed, structured response citing the relevant guests and episodes.
"""

        # 6. Emit Initial Metadata Event to Frontend
        metadata_event = {
            "type": "meta",
            "session_id": session_id,
            "citations": [c.model_dump() for c in citations]
        }
        yield f"data: {json.dumps(metadata_event)}\n\n"

        # 7. Stream LLM Response & Accumulate
        accumulated_text = ""
        async for chunk in LLMProviderFactory.stream_generate(
            prompt=full_prompt,
            system_prompt=system_prompt,
            provider=request.provider,
            history=formatted_history
        ):
            accumulated_text += chunk
            text_event = {"type": "text", "content": chunk}
            yield f"data: {json.dumps(text_event)}\n\n"

        # 8. Check for Generated Artifacts
        parsed_artifact = ArtifactSkill.parse_artifact_from_text(accumulated_text)
        created_artifact_obj = None

        if parsed_artifact:
            # Create Artifact DB Record
            art_db = ArtifactDB(
                session_id=session_id,
                title=parsed_artifact["title"],
                artifact_type=parsed_artifact["artifact_type"],
                content=parsed_artifact["content"]
            )
            db.add(art_db)
            await db.commit()
            await db.refresh(art_db)
            created_artifact_obj = art_db

            # Emit Artifact Created Event to Frontend
            artifact_event = {
                "type": "artifact",
                "artifact": {
                    "id": art_db.id,
                    "session_id": art_db.session_id,
                    "title": art_db.title,
                    "artifact_type": art_db.artifact_type,
                    "content": art_db.content,
                    "created_at": art_db.created_at.isoformat()
                }
            }
            yield f"data: {json.dumps(artifact_event)}\n\n"

        # If Ship 30 essay without explicit tag, convert entire output to a Markdown Artifact automatically!
        elif is_ship30:
            art_db = ArtifactDB(
                session_id=session_id,
                title=f"Ship 30 Essay: {request.message[:30]}...",
                artifact_type="markdown",
                content=accumulated_text
            )
            db.add(art_db)
            await db.commit()
            await db.refresh(art_db)
            created_artifact_obj = art_db

            artifact_event = {
                "type": "artifact",
                "artifact": {
                    "id": art_db.id,
                    "session_id": art_db.session_id,
                    "title": art_db.title,
                    "artifact_type": art_db.artifact_type,
                    "content": art_db.content,
                    "created_at": art_db.created_at.isoformat()
                }
            }
            yield f"data: {json.dumps(artifact_event)}\n\n"

        # 9. Save Assistant Message in DB
        citations_data = [c.model_dump() for c in citations]
        asst_msg = MessageDB(
            session_id=session_id,
            role="assistant",
            content=parsed_artifact["clean_text"] if parsed_artifact else accumulated_text,
            citations_json=citations_data
        )
        db.add(asst_msg)
        await db.commit()

        # Emit Done Event
        yield "data: [DONE]\n\n"
