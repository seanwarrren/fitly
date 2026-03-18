"""Image processing service — validation, background removal, and Cloudinary upload."""

import uuid
from io import BytesIO

from PIL import Image
from rembg import remove, new_session

from app.services.cloudinary_service import upload_image

_rembg_session = new_session("u2netp")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_file(filename: str, content_type: str | None, size: int) -> str | None:
    """Return an error message if the file is invalid, or None if it's fine."""
    ext = _get_extension(filename)
    if ext not in ALLOWED_EXTENSIONS:
        return f"File type '.{ext}' is not allowed. Accepted types: {', '.join(ALLOWED_EXTENSIONS)}"

    if content_type and not content_type.startswith("image/"):
        return f"Invalid content type '{content_type}'. Must be an image."

    if size > MAX_FILE_SIZE:
        mb = MAX_FILE_SIZE // (1024 * 1024)
        return f"File too large ({size:,} bytes). Maximum is {mb} MB."

    return None


async def process_upload(file_bytes: bytes, original_filename: str) -> dict:
    """Full upload pipeline: remove background, upload both images to Cloudinary.

    Returns a dict with fileId and Cloudinary URLs + public IDs.
    """
    file_id = uuid.uuid4().hex

    # Upload original to Cloudinary
    original_result = upload_image(
        file_bytes,
        folder="fitly/originals",
        public_id=file_id,
    )

    # Remove background with rembg
    input_image = Image.open(BytesIO(file_bytes))
    result_image = remove(input_image, session=_rembg_session)

    # Convert processed image to PNG bytes for Cloudinary upload
    buf = BytesIO()
    result_image.save(buf, format="PNG")
    processed_bytes = buf.getvalue()

    processed_result = upload_image(
        processed_bytes,
        folder="fitly/processed",
        public_id=file_id,
    )

    return {
        "fileId": file_id,
        "originalImageUrl": original_result["secure_url"],
        "processedImageUrl": processed_result["secure_url"],
        "originalImagePublicId": original_result["public_id"],
        "processedImagePublicId": processed_result["public_id"],
    }


def _get_extension(filename: str) -> str:
    """Extract the lowercase file extension without the dot."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
