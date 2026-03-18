"""Garment service — business logic for garment CRUD operations."""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId

from app.db.mongodb import get_db
from app.services.cloudinary_service import delete_image

COLLECTION = "garments"


def _garment_doc_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-safe dict."""
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_garment(data: dict, user_id: str) -> dict:
    """Insert a new garment document and return it with a string id."""
    db = get_db()

    doc = {
        "userId": user_id,
        **data,
        "createdAt": datetime.now(timezone.utc),
    }

    result = await db[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _garment_doc_to_dict(doc)


async def get_garments_for_user(user_id: str) -> list[dict]:
    """Return all garments for a user, newest first."""
    db = get_db()
    cursor = db[COLLECTION].find({"userId": user_id}).sort("createdAt", -1)
    return [_garment_doc_to_dict(doc) async for doc in cursor]


async def delete_garment(garment_id: str, user_id: str) -> dict:
    """Delete a garment by its ObjectId string, only if it belongs to the user.

    Also removes the corresponding Cloudinary images if public IDs are stored.
    Returns the deleted document (as a dict) or None if not found.
    """
    try:
        oid = ObjectId(garment_id)
    except (InvalidId, TypeError):
        return None

    db = get_db()
    doc = await db[COLLECTION].find_one_and_delete({"_id": oid, "userId": user_id})
    if doc is None:
        return None

    for key in ("originalImagePublicId", "processedImagePublicId"):
        public_id = doc.get(key)
        if public_id:
            delete_image(public_id)

    return _garment_doc_to_dict(doc)
