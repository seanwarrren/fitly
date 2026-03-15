"""Cloudinary configuration and upload helpers."""

import os
import cloudinary
import cloudinary.uploader


def init_cloudinary() -> None:
    """Configure the Cloudinary SDK from environment variables."""
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def upload_image(file_bytes: bytes, *, folder: str, public_id: str) -> dict:
    """Upload raw image bytes to Cloudinary.

    Returns the Cloudinary upload response dict which includes
    'secure_url' and 'public_id'.
    """
    result = cloudinary.uploader.upload(
        file_bytes,
        folder=folder,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result


def delete_image(public_id: str) -> None:
    """Delete a single image from Cloudinary by its public ID."""
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception:
        pass
