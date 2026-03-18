"""Shared FastAPI dependencies."""

from fastapi import Request, HTTPException

from app.services.auth_service import decode_token


async def get_current_user(request: Request) -> str:
    """Extract and validate the JWT from the Authorization header.

    Returns the user ID string. Raises 401 if missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = auth_header.removeprefix("Bearer ").strip()
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return user_id
