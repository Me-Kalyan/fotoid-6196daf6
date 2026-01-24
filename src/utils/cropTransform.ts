/**
 * Apply crop transformation using pixel-based cropping from react-easy-crop
 * Returns a new data URL with the cropped image
 */

export interface PixelCrop {
  x: number;      // top-left x in source image
  y: number;      // top-left y in source image
  width: number;  // crop width in source pixels
  height: number; // crop height in source pixels
}

export interface CropTransformOptions {
  imageUrl: string;
  pixelCrop: PixelCrop;
  rotation?: number;
  outputWidth: number;
  outputHeight: number;
  backgroundColor?: string;
}

/**
 * Create an image element from a URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = url;
  });
}

/**
 * Get the rotated bounding box size
 */
function getRotatedSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Apply crop transformation using pixel coordinates from react-easy-crop
 */
export async function applyCropTransform({
  imageUrl,
  pixelCrop,
  rotation = 0,
  outputWidth,
  outputHeight,
  backgroundColor = "#FFFFFF",
}: CropTransformOptions): Promise<string> {
  const image = await createImage(imageUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  // If there's rotation, we need to handle it differently
  if (rotation !== 0) {
    const rotRad = (rotation * Math.PI) / 180;

    // Calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
      image.width,
      image.height,
      rotation
    );

    // Create a temp canvas to draw rotated image
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = bBoxWidth;
    tempCanvas.height = bBoxHeight;
    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      throw new Error("Could not get temp canvas context");
    }

    // Fill with background color
    tempCtx.fillStyle = backgroundColor;
    tempCtx.fillRect(0, 0, bBoxWidth, bBoxHeight);

    // Draw rotated image
    tempCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
    tempCtx.rotate(rotRad);
    tempCtx.translate(-image.width / 2, -image.height / 2);
    tempCtx.drawImage(image, 0, 0);

    // Now crop from the rotated image
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.drawImage(
      tempCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );
  } else {
    // No rotation - simple crop
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      outputWidth,
      outputHeight
    );
  }

  return canvas.toDataURL("image/png");
}

/**
 * Calculate the output dimensions in pixels based on format dimensions and DPI
 */
export function calculateOutputDimensions(
  dimensionsString: string,
  dpi: number = 300
): { width: number; height: number } {
  // Parse dimension string like "35×45 mm" or "2×2 inches"
  const normalized = dimensionsString.replace(/\s+/g, " ").replace(/x/gi, "×");
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*(inch(?:es)?|in|mm)/i);

  if (!match) {
    // Default to 2x2 inches at 300 DPI = 600x600 pixels
    return { width: 600, height: 600 };
  }

  let width = parseFloat(match[1]);
  let height = parseFloat(match[2]);
  const unit = match[3].toLowerCase();

  // Convert mm to inches (1 inch = 25.4 mm)
  if (unit === "mm") {
    width = width / 25.4;
    height = height / 25.4;
  }

  return {
    width: Math.round(width * dpi),
    height: Math.round(height * dpi),
  };
}
