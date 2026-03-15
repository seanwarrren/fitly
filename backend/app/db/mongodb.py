"""MongoDB connection module.

Uses motor (async MongoDB driver) with the MONGO_URI environment variable.
The app calls connect() on startup and close() on shutdown.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None

DB_NAME = "fitly"


def connect() -> None:
    """Initialize the MongoDB client from MONGO_URI."""
    global _client, _db
    uri = os.getenv("MONGO_URI")
    if not uri:
        raise RuntimeError("MONGO_URI environment variable is not set")
    _client = AsyncIOMotorClient(uri)
    _db = _client[DB_NAME]


def close() -> None:
    """Close the MongoDB client connection."""
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None


def get_db() -> AsyncIOMotorDatabase:
    """Return the database instance. Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not connected — call connect() first")
    return _db
