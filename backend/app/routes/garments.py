from fastapi import APIRouter, HTTPException

from app.models.garment import GarmentCreate, GarmentResponse
from app.services.garment_service import (
    DEMO_USER_ID,
    create_garment,
    get_garments_for_user,
    delete_garment,
)

router = APIRouter(prefix="/api/garments", tags=["garments"])


@router.post("/", response_model=GarmentResponse)
async def create_garment_route(body: GarmentCreate):
    """Save garment metadata to MongoDB after the user classifies an uploaded item."""
    data = body.model_dump(by_alias=True)
    doc = await create_garment(data)
    return doc


@router.get("/{user_id}", response_model=list[GarmentResponse])
async def list_garments(user_id: str):
    """Return all garments for a user, newest first."""
    docs = await get_garments_for_user(user_id)
    return docs


@router.delete("/{garment_id}")
async def delete_garment_route(garment_id: str):
    """Delete a garment by its id and clean up image files."""
    deleted = await delete_garment(garment_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Garment not found")
    return {"success": True, "deleted": deleted}
