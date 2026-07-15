const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;
const COMPRESS_THRESHOLD_BYTES = 1024 * 1024;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось прочитать изображение"));
    img.src = url;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
}

/**
 * Downscales/re-encodes a photo to JPEG on the client so uploads stay small
 * (phone photos are 5-15 МБ and can exceed nginx/server body limits).
 * If the browser can't decode the file (e.g. HEIC outside Safari), the
 * original file is returned untouched and the server handles it as-is.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD_BYTES) return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    if (!img.naturalWidth || !img.naturalHeight) return file;

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToJpegBlob(canvas);
    if (!blob || blob.size >= file.size) return file;

    // toBlob may ignore the requested format and return PNG — trust blob.type,
    // otherwise the server's magic-byte check rejects the mismatched file
    const type = blob.type || "image/jpeg";
    const ext = type === "image/png" ? ".png" : type === "image/webp" ? ".webp" : ".jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${baseName}${ext}`, { type });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
