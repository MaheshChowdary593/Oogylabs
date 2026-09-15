from fastapi import APIRouter
from app.services.llm_factory import LLMProviderFactory
from app.schemas.chat_schemas import ModelStatusResponse
from app.config import settings

router = APIRouter()

@router.get("/models", response_model=ModelStatusResponse)
async def get_models():
    providers = await LLMProviderFactory.get_available_providers()
    return ModelStatusResponse(
        active_provider=settings.DEFAULT_LLM_PROVIDER,
        providers=providers
    )
