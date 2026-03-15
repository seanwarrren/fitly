from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.image_service import validate_file, process_upload

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    """Accept a single garment image, remove its background, upload to Cloudinary."""

    file_bytes = await file.read()

    error = validate_file(
        filename=file.filename or "",
        content_type=file.content_type,
        size=len(file_bytes),
    )
    if error:
        raise HTTPException(status_code=400, detail=error)

    try:
        result = await process_upload(file_bytes, file.filename or "upload.png")
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image processing failed: {exc}",
        )

    return {"success": True, **result}
