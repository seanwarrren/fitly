"""Pydantic schemas for outfit generation and persistence."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class OutfitGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)

    model_config = {"populate_by_name": True}


class OutfitSaveRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=120)
    prompt: str
    garment_ids: list[str] = Field(..., alias="garmentIds")
    reasoning: str

    model_config = {"populate_by_name": True}


class OutfitResponse(BaseModel):
    id: str
    user_id: str = Field(..., alias="userId")
    name: Optional[str] = None
    prompt: str
    garment_ids: list[str] = Field(..., alias="garmentIds")
    reasoning: str
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}
