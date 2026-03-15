from fastapi import APIRouter, HTTPException

from app.models.outfit import OutfitGenerateRequest, OutfitSaveRequest, OutfitResponse
from app.services.outfit_service import generate_outfit
from app.services.outfit_persistence_service import (
    save_outfit,
    get_outfits_for_user,
    delete_outfit,
)

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


@router.post("/generate")
async def generate_outfit_route(body: OutfitGenerateRequest):
    """Generate a rule-based outfit from the user's wardrobe."""
    try:
        result = await generate_outfit(body.user_id, body.prompt)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Outfit generation failed: {exc}")
    return result


@router.post("/", response_model=OutfitResponse)
async def save_outfit_route(body: OutfitSaveRequest):
    """Save a generated outfit to MongoDB."""
    data = body.model_dump(by_alias=True)
    doc = await save_outfit(data)
    return doc


@router.get("/{user_id}", response_model=list[OutfitResponse])
async def list_outfits(user_id: str):
    """Return all saved outfits for a user, newest first."""
    docs = await get_outfits_for_user(user_id)
    return docs


@router.delete("/{outfit_id}")
async def delete_outfit_route(outfit_id: str):
    """Delete a saved outfit by id."""
    deleted = await delete_outfit(outfit_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return {"success": True, "deleted": deleted}
