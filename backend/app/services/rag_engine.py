import logging
import json
import os
import re
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from app.models.db_models import TranscriptChunkDB
from app.schemas.chat_schemas import CitationItem

logger = logging.getLogger("lenny_assistant.rag_engine")

class RAGEngine:

    @staticmethod
    async def seed_transcripts_from_file(db: AsyncSession, json_path: str) -> int:
        """Seed DB with transcript dataset if empty."""
        try:
            result = await db.execute(select(func.count(TranscriptChunkDB.id)))
            count = result.scalar()
            if count and count > 0:
                logger.info(f"Database already populated with {count} transcript chunks.")
                return count

            if not os.path.exists(json_path):
                logger.warning(f"Seed file not found at {json_path}")
                return 0

            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            inserted = 0
            for item in data:
                chunk = TranscriptChunkDB(
                    id=item.get("id"),
                    episode_title=item.get("episode_title", ""),
                    guest=item.get("guest", ""),
                    topic=item.get("topic", ""),
                    part=item.get("part", ""),
                    source_url=item.get("source_url", ""),
                    content=item.get("content", "")
                )
                db.add(chunk)
                inserted += 1

            await db.commit()
            logger.info(f"Successfully seeded {inserted} transcript chunks into database.")
            return inserted
        except Exception as e:
            logger.error(f"Error seeding transcripts: {e}")
            await db.rollback()
            return 0

    @staticmethod
    async def search_relevant_transcripts(
        db: AsyncSession, 
        query: str, 
        top_k: int = 4
    ) -> Tuple[List[Dict[str, Any]], List[CitationItem]]:
        """
        Retrieves top relevant transcript chunks using hybrid keyword/semantic matching.
        Returns (context_chunks, citations).
        """
        keywords = [k.lower() for k in re.findall(r'\w+', query) if len(k) > 2]
        
        # Build search clauses against guest, episode_title, topic, and content
        filters = []
        for kw in keywords:
            pattern = f"%{kw}%"
            filters.append(TranscriptChunkDB.content.ilike(pattern))
            filters.append(TranscriptChunkDB.guest.ilike(pattern))
            filters.append(TranscriptChunkDB.topic.ilike(pattern))
            filters.append(TranscriptChunkDB.episode_title.ilike(pattern))

        stmt = select(TranscriptChunkDB)
        if filters:
            stmt = stmt.where(or_(*filters))
        stmt = stmt.limit(top_k * 2)

        result = await db.execute(stmt)
        chunks = result.scalars().all()

        if not chunks:
            # Fallback to fetching top default chunks if no keyword match
            stmt_all = select(TranscriptChunkDB).limit(top_k)
            res_all = await db.execute(stmt_all)
            chunks = res_all.scalars().all()

        # Score & rank chunks by relevance keyword frequency
        scored_chunks = []
        for c in chunks:
            text = f"{c.guest} {c.episode_title} {c.topic} {c.content}".lower()
            score = sum(text.count(kw) for kw in keywords)
            scored_chunks.append((score, c))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [item[1] for item in scored_chunks[:top_k]]

        retrieved_context = []
        citations = []

        for c in top_chunks:
            retrieved_context.append({
                "id": c.id,
                "episode_title": c.episode_title,
                "guest": c.guest,
                "topic": c.topic,
                "part": c.part,
                "source_url": c.source_url,
                "content": c.content
            })

            citations.append(CitationItem(
                guest=c.guest,
                episode_title=c.episode_title,
                topic=c.topic,
                source_url=c.source_url,
                part=c.part,
                snippet=c.content[:200] + "..."
            ))

        return retrieved_context, citations
