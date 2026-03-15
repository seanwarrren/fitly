"""Pydantic schemas for garment data."""

from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field


class GarmentCreate(BaseModel):
    """Schema sent by the frontend when saving garment metadata after upload."""

    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1)
    garment_type: str = Field(..., alias="garmentType", min_length=1)
    primary_color: str = Field(..., alias="primaryColor", min_length=1)
    formality: str = Field(..., min_length=1)
    thickness: str = Field(..., min_length=1)
    pattern: str = Field(..., min_length=1)
    weather_suitability: list[str] = Field(..., alias="weatherSuitability", min_length=1)
    notes: Optional[str] = None
    original_image_path: str = Field(..., alias="originalImagePath")
    processed_image_path: str = Field(..., alias="processedImagePath")

    model_config = {"populate_by_name": True}


class GarmentResponse(BaseModel):
    """Schema returned when reading a garment from the database."""

    id: str
    user_id: str = Field(..., alias="userId")
    name: str
    category: str
    garment_type: str = Field(..., alias="garmentType")
    primary_color: str = Field(..., alias="primaryColor")
    formality: str
    thickness: str
    pattern: str
    weather_suitability: list[str] = Field(..., alias="weatherSuitability")
    notes: Optional[str] = None
    original_image_path: str = Field(..., alias="originalImagePath")
    processed_image_path: str = Field(..., alias="processedImagePath")
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}
