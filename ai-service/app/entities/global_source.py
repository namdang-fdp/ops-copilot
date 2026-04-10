# app/entities/global_source.py
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from app.config.database import Base


class GlobalSource(Base):
    __tablename__ = "global_knowledge_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tech_name: Mapped[str] = mapped_column(
        String, unique=True, index=True, nullable=False
    )
    source_url: Mapped[str] = mapped_column(String, nullable=False)
    source_type: Mapped[str] = mapped_column(String, default="SITEMAP")
    status: Mapped[str] = mapped_column(String, default="PENDING")
    document_count: Mapped[int] = mapped_column(Integer, default=0)
    last_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_by: Mapped[str] = mapped_column(String, default="SYSTEM")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("global_knowledge_sources.id", ondelete="CASCADE"),
    )

    page_content: Mapped[str] = mapped_column(String, nullable=False)
    metadata_info = mapped_column(JSONB, default=dict)

    # 1536 là số chiều vector của mô hình text-embedding-3-small (OpenAI)
    embedding = mapped_column(Vector(1536))
