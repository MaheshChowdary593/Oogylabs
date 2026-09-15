import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("lenny_assistant.database")

Base = declarative_base()

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite") and "aiosqlite" not in db_url:
    db_url = db_url.replace("sqlite://", "sqlite+aiosqlite://")

# Primary Engine
engine = create_async_engine(db_url, echo=False, future=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    global engine, AsyncSessionLocal
    try:
        logger.info(f"Connecting to primary database engine: {engine.url.drivername}...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(
            f"Primary database connection failed ({str(e)}). "
            "Falling back to local SQLite database ('sqlite+aiosqlite:///./lenny_assistant.db') for resilient execution."
        )
        # Fallback to local SQLite file database
        fallback_url = "sqlite+aiosqlite:///./lenny_assistant.db"
        engine = create_async_engine(fallback_url, echo=False, future=True)
        AsyncSessionLocal.configure(bind=engine)
        
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Fallback SQLite database initialized successfully.")
