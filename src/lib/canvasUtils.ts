// src/lib/canvasUtils.ts
// Robust canvas utilities for WYSIWYG cropping with rotation support

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

// Helper: Convert mm to Pixels at 300 DPI
export const mmToPx = (mm: number) => Math.round((mm / 25.4) * 300);

// Helper: Convert inches to Pixels at 300 DPI
export const inchToPx = (inch: number) => Math.round(inch * 300);

/**
 * THE CORE CROP FUNCTION
 * This handles Rotation + Cropping + Resizing to Target Dimensions
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  targetW_mm: number,
  targetH_mm: number,
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  const rotRad = getRadianAngle(rotation);

  // 1. Calculate the bounding box of the ROTATED image
  // (We need a canvas big enough to hold the rotated image safely)
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // 2. Draw the image into the center, rotated
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // 3. Draw the raw image
  ctx.drawImage(image, 0, 0);

  // 4. Get the Data from the Crop Zone
  // pixelCrop is relative to the "Rotated Bounding Box" which react-easy-crop sees
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // 5. Create the Final Output Canvas (Target Size: e.g. 35x45mm at 300DPI)
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = mmToPx(targetW_mm);
  outputCanvas.height = mmToPx(targetH_mm);

  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) return "";

  // 6. Draw the cropped data onto the final canvas
  // We use an intermediate canvas to resize properly
  const intermediateCanvas = document.createElement("canvas");
  intermediateCanvas.width = pixelCrop.width;
  intermediateCanvas.height = pixelCrop.height;
  const intermediateCtx = intermediateCanvas.getContext("2d");

  if (intermediateCtx) {
    intermediateCtx.putImageData(data, 0, 0);

    // Draw with high quality scaling
    outputCtx.imageSmoothingEnabled = true;
    outputCtx.imageSmoothingQuality = "high";
    outputCtx.drawImage(
      intermediateCanvas,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height, // Source
      0,
      0,
      outputCanvas.width,
      outputCanvas.height // Dest
    );
  }

  return outputCanvas.toDataURL("image/png", 1.0);
}

/**
 * Simplified crop without target dimensions (uses crop size as output)
 */
export async function getCroppedImgSimple(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  const rotRad = getRadianAngle(rotation);

  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // Output at crop size
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = pixelCrop.width;
  outputCanvas.height = pixelCrop.height;

  const outputCtx = outputCanvas.getContext("2d");
  if (!outputCtx) return "";

  outputCtx.putImageData(data, 0, 0);

  return outputCanvas.toDataURL("image/png", 1.0);
}

/**
 * GENERATE SHEET - Tiles a single image onto paper
 */
export const generateSheet = async (
  singleImageSrc: string,
  photoW_mm: number,
  photoH_mm: number,
  paperW_mm: number,
  paperH_mm: number,
  gap_mm: number = 2
): Promise<string> => {
  const photo = await createImage(singleImageSrc);
  const canvas = document.createElement("canvas");

  const canvasW = mmToPx(paperW_mm);
  const canvasH = mmToPx(paperH_mm);
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const photoW_px = mmToPx(photoW_mm);
  const photoH_px = mmToPx(photoH_mm);
  const gap_px = mmToPx(gap_mm);
  const cols = Math.floor(canvasW / (photoW_px + gap_px));
  const rows = Math.floor(canvasH / (photoH_px + gap_px));

  const totalGridW = cols * photoW_px + (cols - 1) * gap_px;
  const totalGridH = rows * photoH_px + (rows - 1) * gap_px;
  const startX = (canvasW - totalGridW) / 2;
  const startY = (canvasH - totalGridH) / 2;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = startX + i * (photoW_px + gap_px);
      const y = startY + j * (photoH_px + gap_px);
      ctx.drawImage(photo, x, y, photoW_px, photoH_px);
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoW_px, photoH_px);
    }
  }

  return canvas.toDataURL("image/jpeg", 0.95);
};

/**
 * Calculate sheet layout info
 */
export const calculateSheetLayout = (
  photoW_mm: number,
  photoH_mm: number,
  paperW_mm: number,
  paperH_mm: number,
  gap_mm: number = 2
): { cols: number; rows: number; total: number } => {
  const photoW_px = mmToPx(photoW_mm);
  const photoH_px = mmToPx(photoH_mm);
  const paperW_px = mmToPx(paperW_mm);
  const paperH_px = mmToPx(paperH_mm);
  const gap_px = mmToPx(gap_mm);

  const cols = Math.floor(paperW_px / (photoW_px + gap_px));
  const rows = Math.floor(paperH_px / (photoH_px + gap_px));

  return { cols, rows, total: cols * rows };
};
