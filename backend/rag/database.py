import os
import uuid
from datetime import datetime
from typing import AsyncIterator

from dotenv import load_dotenv
from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, Float, Index, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres_password@localhost:5455/closewire_db",
)


class Base(DeclarativeBase):
    pass


class KnowledgeNugget(Base):
    __tablename__ = "knowledge_nuggets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_id_hash: Mapped[str] = mapped_column(String(128), index=True)

    semantic_trigger: Mapped[str] = mapped_column(Text)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))

    counsellor_response: Mapped[str] = mapped_column(Text)
    technique_label: Mapped[str] = mapped_column(String(120))

    source_agent: Mapped[str] = mapped_column(String(40))
    persona_archetype: Mapped[str] = mapped_column(String(80), index=True)
    outcome_metrics: Mapped[dict] = mapped_column(JSON)
    similarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


Index("ix_knowledge_nuggets_program_archetype", KnowledgeNugget.program_id_hash, KnowledgeNugget.persona_archetype)


engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db_session() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
