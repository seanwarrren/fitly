from fastapi import APIRouter, HTTPException, Depends

from app.models.outfit import OutfitGenerateRequest, OutfitSaveRequest, OutfitResponse, OutfitRenameRequest
from app.services.outfit_service import generate_outfit
from app.services.outfit_persistence_service import (
    save_outfit,
    get_outfits_for_user,
    delete_outfit,
    rename_outfit,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


@router.post("/generate")
async def generate_outfit_route(body: OutfitGenerateRequest, user_id: str = Depends(get_current_user)):
    """Generate a rule-based outfit from the authenticated user's wardrobe."""
    try:
        result = await generate_outfit(user_id, body.prompt)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Outfit generation failed: {exc}")
    return result


@router.post("/", response_model=OutfitResponse)
async def save_outfit_route(body: OutfitSaveRequest, user_id: str = Depends(get_current_user)):
    """Save a generated outfit to MongoDB for the authenticated user."""
    data = body.model_dump(by_alias=True)
    doc = await save_outfit(data, user_id)
    return doc


@router.get("/", response_model=list[OutfitResponse])
async def list_outfits(user_id: str = Depends(get_current_user)):
    """Return all saved outfits for the authenticated user, newest first."""
    docs = await get_outfits_for_user(user_id)
    return docs


@router.delete("/{outfit_id}")
async def delete_outfit_route(outfit_id: str, user_id: str = Depends(get_current_user)):
    """Delete a saved outfit by id, only if it belongs to the authenticated user."""
    deleted = await delete_outfit(outfit_id, user_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return {"success": True, "deleted": deleted}


@router.put("/{outfit_id}/rename", response_model=OutfitResponse)
async def rename_outfit_route(
    outfit_id: str,
    body: OutfitRenameRequest,
    user_id: str = Depends(get_current_user),
):
    """Rename a saved outfit for the authenticated user."""
    updated = await rename_outfit(outfit_id, user_id, body.name)
    if updated is None:
        raise HTTPException(status_code=404, detail="Outfit not found")
    return updated
