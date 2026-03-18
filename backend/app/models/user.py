"""Pydantic schemas for user authentication."""

from datetime import datetime
from pydantic import BaseModel, Field


class UserSignup(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    password: str = Field(..., min_length=4, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


class TokenResponse(BaseModel):
    token: str
    user: UserResponse
