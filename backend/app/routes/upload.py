from fastapi import APIRouter, UploadFile, File, HTTPException, Depends

from app.services.image_service import validate_file, process_upload
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/")
async def upload_images(
    originalFile: UploadFile = File(...),
    processedFile: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Accept original and processed garment images, upload both to Cloudinary."""

    original_bytes = await originalFile.read()
    processed_bytes = await processedFile.read()

    error = validate_file(
        filename=originalFile.filename or "",
        content_type=originalFile.content_type,
        size=len(original_bytes),
    )
    if error:
        raise HTTPException(status_code=400, detail=error)

    try:
        result = await process_upload(original_bytes, processed_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image upload failed: {exc}",
        )

    return {"success": True, **result}
