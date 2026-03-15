"""Garment service — business logic for garment CRUD operations."""

from datetime import datetime, timezone
from pathlib import Path

from bson import ObjectId
from bson.errors import InvalidId

from app.db.mongodb import get_db

DEMO_USER_ID = "demo-user"
COLLECTION = "garments"

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


def _garment_doc_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-safe dict."""
    doc["id"] = str(doc.pop("_id"))
    return doc


async def create_garment(data: dict) -> dict:
    """Insert a new garment document and return it with a string id."""
    db = get_db()

    doc = {
        "userId": DEMO_USER_ID,
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


async def delete_garment(garment_id: str) -> dict:
    """Delete a garment by its ObjectId string.

    Also removes the original and processed image files from disk if they exist.
    Returns the deleted document (as a dict) or None if not found.
    """
    try:
        oid = ObjectId(garment_id)
    except (InvalidId, TypeError):
        return None

    db = get_db()
    doc = await db[COLLECTION].find_one_and_delete({"_id": oid})
    if doc is None:
        return None

    # Best-effort file cleanup
    for key in ("originalImagePath", "processedImagePath"):
        rel_path = doc.get(key, "")
        if rel_path:
            # Paths are stored like "/uploads/originals/abc.png"
            full = UPLOAD_DIR / rel_path.lstrip("/").removeprefix("uploads/")
            full.unlink(missing_ok=True)

    return _garment_doc_to_dict(doc)
