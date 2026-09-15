import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SessionDB(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False, default="New Growth Conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("MessageDB", back_populates="session", cascade="all, delete-orphan", order_by="MessageDB.created_at")
    artifacts = relationship("ArtifactDB", back_populates="session", cascade="all, delete-orphan")


class MessageDB(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    role = Column(String, nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    citations_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionDB", back_populates="messages")


class ArtifactDB(Base):
    __tablename__ = "artifacts"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False)
    message_id = Column(String, nullable=True)
    title = Column(String, nullable=False)
    artifact_type = Column(String, nullable=False)  # markdown | html
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("SessionDB", back_populates="artifacts")


class TranscriptChunkDB(Base):
    __tablename__ = "transcript_chunks"

    id = Column(String, primary_key=True)
    episode_title = Column(String, nullable=False)
    guest = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    part = Column(String, nullable=True)
    source_url = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
