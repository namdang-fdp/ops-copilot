from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class GlobalSourceCreateReq(BaseModel):
    tech_name: str
    source_url: str


class GlobalSourceRes(BaseModel):
    id: UUID
    tech_name: str
    source_url: str
    source_type: str
    status: str
    document_count: int
    last_synced_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
