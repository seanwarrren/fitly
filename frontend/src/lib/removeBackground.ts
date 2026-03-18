/**
 * Client-side background removal using @imgly/background-removal.
 *
 * The ONNX model + WASM files are fetched from a CDN on first use
 * and cached by the browser for subsequent calls.
 */

import { removeBackground as imglyRemoveBackground } from "@imgly/background-removal";

export async function removeBackground(imageFile: File): Promise<Blob> {
  const blob = await imglyRemoveBackground(imageFile, {
    progress: (key, current, total) => {
      console.log(`[bg-removal] ${key}: ${current}/${total}`);
    },
  });
  return blob;
}
