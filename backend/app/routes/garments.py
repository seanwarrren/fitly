from fastapi import APIRouter, HTTPException, Depends

from app.models.garment import GarmentCreate, GarmentResponse
from app.services.garment_service import (
    create_garment,
    get_garments_for_user,
    delete_garment,
)
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/garments", tags=["garments"])


@router.post("/", response_model=GarmentResponse)
async def create_garment_route(body: GarmentCreate, user_id: str = Depends(get_current_user)):
    """Save garment metadata to MongoDB for the authenticated user."""
    data = body.model_dump(by_alias=True)
    doc = await create_garment(data, user_id)
    return doc


@router.get("/", response_model=list[GarmentResponse])
async def list_garments(user_id: str = Depends(get_current_user)):
    """Return all garments for the authenticated user, newest first."""
    docs = await get_garments_for_user(user_id)
    return docs


@router.delete("/{garment_id}")
async def delete_garment_route(garment_id: str, user_id: str = Depends(get_current_user)):
    """Delete a garment by its id, only if it belongs to the authenticated user."""
    deleted = await delete_garment(garment_id, user_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Garment not found")
    return {"success": True, "deleted": deleted}
