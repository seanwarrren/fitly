"""Outfit persistence service — save, list, and delete outfits in MongoDB."""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.db.mongodb import get_db

COLLECTION = "outfits"


def _outfit_doc_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-safe dict."""
    doc["id"] = str(doc.pop("_id"))
    return doc


async def save_outfit(data: dict, user_id: str) -> dict:
    """Insert a new outfit document and return it with a string id."""
    db = get_db()

    doc = {
        "userId": user_id,
        **data,
        "createdAt": datetime.now(timezone.utc),
    }

    result = await db[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _outfit_doc_to_dict(doc)


async def get_outfits_for_user(user_id: str) -> list[dict]:
    """Return all outfits for a user, newest first."""
    db = get_db()
    cursor = db[COLLECTION].find({"userId": user_id}).sort("createdAt", -1)
    return [_outfit_doc_to_dict(doc) async for doc in cursor]


async def delete_outfit(outfit_id: str, user_id: str) -> dict | None:
    """Delete an outfit by its ObjectId string, only if it belongs to the user."""
    try:
        oid = ObjectId(outfit_id)
    except (InvalidId, TypeError):
        return None

    db = get_db()
    doc = await db[COLLECTION].find_one_and_delete({"_id": oid, "userId": user_id})
    if doc is None:
        return None

    return _outfit_doc_to_dict(doc)


async def rename_outfit(outfit_id: str, user_id: str, name: str | None) -> dict | None:
    """Rename an outfit, scoped to the authenticated user.

    Blank names are normalized to null (no name).
    """
    try:
        oid = ObjectId(outfit_id)
    except (InvalidId, TypeError):
        return None

    normalized_name = None
    if name is not None:
        cleaned = name.strip()
        normalized_name = cleaned if cleaned else None

    db = get_db()
    doc = await db[COLLECTION].find_one_and_update(
        {"_id": oid, "userId": user_id},
        {"$set": {"name": normalized_name}},
        return_document=ReturnDocument.AFTER,
    )

    if doc is None:
        return None

    return _outfit_doc_to_dict(doc)
