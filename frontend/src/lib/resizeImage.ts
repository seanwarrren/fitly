/**
 * Resize an image blob using an off-screen canvas so it stays
 * under Cloudinary's 10 MB free-tier upload limit.
 *
 * - Images already within MAX_DIMENSION are returned as-is.
 * - `format` controls the output MIME type:
 *     "image/jpeg"  — smaller, no transparency (good for originals)
 *     "image/png"   — larger, preserves transparency (needed for processed)
 */

const MAX_DIMENSION = 2048;

export function resizeImage(
  blob: Blob,
  format: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        URL.revokeObjectURL(img.src);
        resolve(blob);
        return;
      }

      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(img.src);

      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Canvas export failed"))),
        format,
        quality,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = URL.createObjectURL(blob);
  });
}
