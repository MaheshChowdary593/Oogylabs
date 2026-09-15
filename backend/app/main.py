import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.services.rag_engine import RAGEngine
from app.api.v1 import health, models, sessions, chat, ingest

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("lenny_assistant.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing The Lenny Growth Assistant Application...")
    # Initialize DB schema
    await init_db()
    
    # Auto-seed transcript dataset on startup if needed
    async with AsyncSessionLocal() as session:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(base_dir, "..", "..", "data", "lenny_transcripts", "sample_transcripts.json")
        data_path = os.path.abspath(data_path)
        if os.path.exists(data_path):
            await RAGEngine.seed_transcripts_from_file(session, data_path)
            
    yield
    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(models.router, prefix=settings.API_V1_STR, tags=["Models"])
app.include_router(sessions.router, prefix=settings.API_V1_STR, tags=["Sessions"])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=["Chat"])
app.include_router(ingest.router, prefix=settings.API_V1_STR, tags=["Ingest"])

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
