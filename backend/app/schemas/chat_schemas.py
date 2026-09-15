from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class CitationItem(BaseModel):
    guest: str
    episode_title: str
    topic: str
    source_url: Optional[str] = None
    part: Optional[str] = None
    snippet: str

class MessageSchema(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    citations: Optional[List[CitationItem]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ArtifactSchema(BaseModel):
    id: str
    session_id: str
    title: str
    artifact_type: str  # markdown | html
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SessionSchema(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageSchema] = []
    artifacts: List[ArtifactSchema] = []

    model_config = ConfigDict(from_attributes=True)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, description="User query or instruction")
    provider: Optional[str] = Field(None, description="LLM provider: ollama | gemini")
    skill: Optional[str] = Field(None, description="Skill trigger override: ship30 | artifact | auto")

class ProviderInfo(BaseModel):
    id: str
    name: str
    available: bool
    is_default: bool
    details: str

class ModelStatusResponse(BaseModel):
    active_provider: str
    providers: List[ProviderInfo]
