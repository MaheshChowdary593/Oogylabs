import os
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.rag_engine import RAGEngine

router = APIRouter()

@router.post("/transcripts/ingest")
async def ingest_transcripts(db: AsyncSession = Depends(get_db)):
    # Path to default dataset file
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(base_dir, "..", "data", "lenny_transcripts", "sample_transcripts.json")
    
    count = await RAGEngine.seed_transcripts_from_file(db, data_path)
    return {
        "status": "success",
        "message": f"Ingested {count} transcript chunks into knowledge base.",
        "data_path": data_path
    }
