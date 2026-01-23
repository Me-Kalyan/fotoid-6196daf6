/**
 * Apply crop transformation (position, scale, rotation) to an image
 * Returns a new data URL with the transformed image
 */

export interface CropTransformData {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface CropTransformOptions {
  imageUrl: string;
  cropData: CropTransformData;
  outputWidth: number;
  outputHeight: number;
  backgroundColor?: string;
}

/**
 * Apply crop transformation to an image and return the cropped result
 */
export async function applyCropTransform({
  imageUrl,
  cropData,
  outputWidth,
  outputHeight,
  backgroundColor = "#FFFFFF",
}: CropTransformOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        // Create canvas with output dimensions
        const canvas = document.createElement("canvas");
        canvas.width = outputWidth;
        canvas.height = outputHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, outputWidth, outputHeight);

        // Save context state
        ctx.save();

        // Move to center of canvas
        ctx.translate(outputWidth / 2, outputHeight / 2);

        // Apply rotation (in degrees, convert to radians)
        ctx.rotate((cropData.rotation * Math.PI) / 180);

        // Apply scale
        ctx.scale(cropData.scale, cropData.scale);

        // Apply position offset (the cropData.x/y are pixel offsets from the preview container)
        // We need to scale these relative to the output size
        const scaleRatio = outputWidth / 280; // 280 is the preview container width
        ctx.translate(cropData.x * scaleRatio / cropData.scale, cropData.y * scaleRatio / cropData.scale);

        // Draw image centered
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Restore context
        ctx.restore();

        // Return as data URL
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
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