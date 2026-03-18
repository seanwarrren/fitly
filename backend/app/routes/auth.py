from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends

from app.db.mongodb import get_db
from app.models.user import UserSignup, UserLogin, TokenResponse
from app.services.auth_service import hash_password, verify_password, create_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

USERS_COLLECTION = "users"


@router.post("/signup", response_model=TokenResponse)
async def signup(body: UserSignup):
    db = get_db()

    existing = await db[USERS_COLLECTION].find_one({"username": body.username})
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")

    doc = {
        "username": body.username,
        "passwordHash": hash_password(body.password),
        "createdAt": datetime.now(timezone.utc),
    }

    result = await db[USERS_COLLECTION].insert_one(doc)
    user_id = str(result.inserted_id)

    return {
        "token": create_token(user_id),
        "user": {"id": user_id, "username": doc["username"], "createdAt": doc["createdAt"]},
    }


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    db = get_db()

    doc = await db[USERS_COLLECTION].find_one({"username": body.username})
    if not doc or not verify_password(body.password, doc["passwordHash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    user_id = str(doc["_id"])

    return {
        "token": create_token(user_id),
        "user": {"id": user_id, "username": doc["username"], "createdAt": doc["createdAt"]},
    }


@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)):
    db = get_db()
    from bson import ObjectId

    doc = await db[USERS_COLLECTION].find_one({"_id": ObjectId(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": str(doc["_id"]), "username": doc["username"], "createdAt": doc["createdAt"]}
