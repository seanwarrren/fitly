"""Image processing service — handles upload validation, saving, and background removal."""

import uuid
from io import BytesIO
from pathlib import Path

from PIL import Image
from rembg import remove

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
ORIGINALS_DIR = UPLOAD_DIR / "originals"
PROCESSED_DIR = UPLOAD_DIR / "processed"

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def ensure_upload_dirs() -> None:
    """Create upload directories if they don't exist."""
    ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


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
    """Full upload pipeline: save original, remove background, save processed.

    Returns a dict with fileId and the relative paths for both images.
    """
    ensure_upload_dirs()

    file_id = uuid.uuid4().hex
    ext = _get_extension(original_filename)

    # -- Save original --
    original_name = f"{file_id}.{ext}"
    original_path = ORIGINALS_DIR / original_name
    original_path.write_bytes(file_bytes)

    # -- Remove background with rembg --
    input_image = Image.open(BytesIO(file_bytes))
    result_image = remove(input_image)

    # TODO: add optional cropping / centering standardization here later

    processed_name = f"{file_id}.png"
    processed_path = PROCESSED_DIR / processed_name
    result_image.save(processed_path, format="PNG")

    return {
        "fileId": file_id,
        "originalImagePath": f"/uploads/originals/{original_name}",
        "processedImagePath": f"/uploads/processed/{processed_name}",
    }


def _get_extension(filename: str) -> str:
    """Extract the lowercase file extension without the dot."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
