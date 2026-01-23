/**
 * Print Sheet Generator
 * Creates tiled grids of passport photos for printing at standard photo sizes
 */
import { drawImageWithFaceCrop, getPassportSpec } from "@/hooks/useFaceCrop";
import type { FaceLandmarks } from "@/hooks/useImageProcessing";

export type SheetSize = "4x6" | "5x7" | "3.5x5" | "6x8" | "8x10" | "8x12" | "a4" | "letter" | "postcard";
export type FileFormat = "jpg" | "png";

export interface SheetConfig {
  // Sheet dimensions in inches
  widthInches: number;
  heightInches: number;
  // DPI for print quality
  dpi: number;
  // Passport photo dimensions in inches (default US 2x2)
  photoWidthInches: number;
  photoHeightInches: number;
  // Padding between photos in inches
  paddingInches: number;
  // Margin around edge in inches
  marginInches: number;
}

const SHEET_CONFIGS: Record<SheetSize, SheetConfig> = {
  "3.5x5": {
    widthInches: 5,
    heightInches: 3.5,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.08,
    marginInches: 0.1,
  },
  "4x6": {
    widthInches: 6,
    heightInches: 4,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.1,
    marginInches: 0.1,
  },
  "5x7": {
    widthInches: 7,
    heightInches: 5,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.1,
    marginInches: 0.15,
  },
  "6x8": {
    widthInches: 8,
    heightInches: 6,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.12,
    marginInches: 0.15,
  },
  "8x10": {
    widthInches: 10,
    heightInches: 8,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.15,
    marginInches: 0.2,
  },
  "8x12": {
    widthInches: 12,
    heightInches: 8,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.15,
    marginInches: 0.2,
  },
  "postcard": {
    widthInches: 6,
    heightInches: 4,
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.1,
    marginInches: 0.1,
  },
  "a4": {
    widthInches: 8.27, // A4 width
    heightInches: 11.69, // A4 height
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.15,
    marginInches: 0.25,
  },
  "letter": {
    widthInches: 11, // Letter width (landscape for more photos)
    heightInches: 8.5, // Letter height
    dpi: 300,
    photoWidthInches: 2,
    photoHeightInches: 2,
    paddingInches: 0.15,
    marginInches: 0.25,
  },
};

export interface GeneratedSheet {
  dataUrl: string;
  photoCount: number;
  columns: number;
  rows: number;
}

/**
 * Calculate the grid layout for a sheet
 */
export function calculateGridLayout(config: SheetConfig): { columns: number; rows: number; photoCount: number } {
  const availableWidth = config.widthInches - (2 * config.marginInches);
  const availableHeight = config.heightInches - (2 * config.marginInches);

  const photoWithPadding = {
    width: config.photoWidthInches + config.paddingInches,
    height: config.photoHeightInches + config.paddingInches,
  };

  const columns = Math.floor((availableWidth + config.paddingInches) / photoWithPadding.width);
  const rows = Math.floor((availableHeight + config.paddingInches) / photoWithPadding.height);

  return {
    columns: Math.max(1, columns),
    rows: Math.max(1, rows),
    photoCount: Math.max(1, columns) * Math.max(1, rows),
  };
}

/**
 * Calculate the photo count for a given sheet and photo size
 */
export function calculatePhotoCount(
  sheetSize: SheetSize,
  photoWidthInches?: number,
  photoHeightInches?: number
): { photoCount: number; columns: number; rows: number } {
  const baseConfig = SHEET_CONFIGS[sheetSize];
  
  const config: SheetConfig = {
    ...baseConfig,
    photoWidthInches: photoWidthInches ?? baseConfig.photoWidthInches,
    photoHeightInches: photoHeightInches ?? baseConfig.photoHeightInches,
  };
  
  return calculateGridLayout(config);
}

/**
 * Generate a print sheet with tiled passport photos
 */
export async function generatePrintSheet(
  photoUrl: string,
  sheetSize: SheetSize,
  bgColor: string = "#FFFFFF",
  customDpi?: number,
  photoWidthInches?: number,
  photoHeightInches?: number,
  faceLandmarks?: FaceLandmarks | null,
  countryCode?: string
): Promise<GeneratedSheet> {
  const dpi = customDpi || SHEET_CONFIGS[sheetSize].dpi;
  const baseConfig = SHEET_CONFIGS[sheetSize];

  // Use custom photo dimensions if provided, otherwise use defaults
  const config: SheetConfig = {
    ...baseConfig,
    photoWidthInches: photoWidthInches ?? baseConfig.photoWidthInches,
    photoHeightInches: photoHeightInches ?? baseConfig.photoHeightInches,
  };

  const layout = calculateGridLayout(config);

  // Calculate pixel dimensions
  const sheetWidthPx = Math.round(config.widthInches * dpi);
  const sheetHeightPx = Math.round(config.heightInches * dpi);
  const photoWidthPx = Math.round(config.photoWidthInches * dpi);
  const photoHeightPx = Math.round(config.photoHeightInches * dpi);
  const paddingPx = Math.round(config.paddingInches * dpi);

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = sheetWidthPx;
  canvas.height = sheetHeightPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

  // Load the photo
  const img = await loadImage(photoUrl);

  // Calculate starting position to center the grid
  const gridWidth = (layout.columns * photoWidthPx) + ((layout.columns - 1) * paddingPx);
  const gridHeight = (layout.rows * photoHeightPx) + ((layout.rows - 1) * paddingPx);
  const startX = (sheetWidthPx - gridWidth) / 2;
  const startY = (sheetHeightPx - gridHeight) / 2;

  // Draw the photos in a grid
  const spec = countryCode ? getPassportSpec(countryCode) : undefined;

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.columns; col++) {
      const x = startX + (col * (photoWidthPx + paddingPx));
      const y = startY + (row * (photoHeightPx + paddingPx));

      // Draw photo with smart crop
      drawImageWithFaceCrop(ctx, img, faceLandmarks, photoWidthPx, photoHeightPx, spec, x, y);

      // Add a subtle border for cutting guides
      ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
    }
  }

  // Add corner crop marks
  drawCropMarks(ctx, startX, startY, gridWidth, gridHeight, sheetWidthPx, sheetHeightPx);

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.95),
    photoCount: layout.photoCount,
    columns: layout.columns,
    rows: layout.rows,
  };
}

/**
 * Generate a preview (smaller resolution for display)
 */
export async function generatePreview(
  photoUrl: string,
  sheetSize: SheetSize,
  bgColor: string = "#FFFFFF",
  previewWidth: number = 400,
  faceLandmarks?: FaceLandmarks | null,
  countryCode?: string,
  photoWidthInches?: number,
  photoHeightInches?: number
): Promise<GeneratedSheet> {
  const baseConfig = SHEET_CONFIGS[sheetSize];
  
  // Use custom photo dimensions if provided, otherwise use defaults
  const config: SheetConfig = {
    ...baseConfig,
    photoWidthInches: photoWidthInches ?? baseConfig.photoWidthInches,
    photoHeightInches: photoHeightInches ?? baseConfig.photoHeightInches,
  };
  
  const layout = calculateGridLayout(config);

  // Calculate preview dimensions maintaining aspect ratio
  const aspectRatio = config.heightInches / config.widthInches;
  const previewHeight = Math.round(previewWidth * aspectRatio);

  // Scale factor from full resolution to preview
  const scaleFactor = previewWidth / (config.widthInches * config.dpi);

  const photoWidthPx = Math.round(config.photoWidthInches * config.dpi * scaleFactor);
  const photoHeightPx = Math.round(config.photoHeightInches * config.dpi * scaleFactor);
  const paddingPx = Math.round(config.paddingInches * config.dpi * scaleFactor);

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = previewWidth;
  canvas.height = previewHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Fill background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, previewWidth, previewHeight);

  // Load the photo
  const img = await loadImage(photoUrl);

  // Calculate starting position to center the grid
  const gridWidth = (layout.columns * photoWidthPx) + ((layout.columns - 1) * paddingPx);
  const gridHeight = (layout.rows * photoHeightPx) + ((layout.rows - 1) * paddingPx);
  const startX = (previewWidth - gridWidth) / 2;
  const startY = (previewHeight - gridHeight) / 2;

  // Draw the photos in a grid
  const spec = countryCode ? getPassportSpec(countryCode) : undefined;

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.columns; col++) {
      const x = startX + (col * (photoWidthPx + paddingPx));
      const y = startY + (row * (photoHeightPx + paddingPx));

      // Draw photo with smart crop
      drawImageWithFaceCrop(ctx, img, faceLandmarks, photoWidthPx, photoHeightPx, spec, x, y);

      // Subtle border
      ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoWidthPx, photoHeightPx);
    }
  }

  return {
    dataUrl: canvas.toDataURL("image/png"),
    photoCount: layout.photoCount,
    columns: layout.columns,
    rows: layout.rows,
  };
}

/**
 * Download the generated sheet
 */
export function downloadSheet(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper functions

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const imgRatio = img.width / img.height;
  const targetRatio = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = img.width;
  let sourceHeight = img.height;

  if (imgRatio > targetRatio) {
    // Image is wider - crop sides
    sourceWidth = img.height * targetRatio;
    sourceX = (img.width - sourceWidth) / 2;
  } else {
    // Image is taller - crop top/bottom
    sourceHeight = img.width / targetRatio;
    sourceY = (img.height - sourceHeight) / 2;
  }

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    x, y, width, height
  );
}

function drawCropMarks(
  ctx: CanvasRenderingContext2D,
  gridX: number,
  gridY: number,
  gridWidth: number,
  gridHeight: number,
  sheetWidth: number,
  sheetHeight: number
): void {
  const markLength = 20;
  const markOffset = 10;

  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(gridX - markOffset - markLength, gridY);
  ctx.lineTo(gridX - markOffset, gridY);
  ctx.moveTo(gridX, gridY - markOffset - markLength);
  ctx.lineTo(gridX, gridY - markOffset);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(gridX + gridWidth + markOffset, gridY);
  ctx.lineTo(gridX + gridWidth + markOffset + markLength, gridY);
  ctx.moveTo(gridX + gridWidth, gridY - markOffset - markLength);
  ctx.lineTo(gridX + gridWidth, gridY - markOffset);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(gridX - markOffset - markLength, gridY + gridHeight);
  ctx.lineTo(gridX - markOffset, gridY + gridHeight);
  ctx.moveTo(gridX, gridY + gridHeight + markOffset);
  ctx.lineTo(gridX, gridY + gridHeight + markOffset + markLength);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(gridX + gridWidth + markOffset, gridY + gridHeight);
  ctx.lineTo(gridX + gridWidth + markOffset + markLength, gridY + gridHeight);
  ctx.moveTo(gridX + gridWidth, gridY + gridHeight + markOffset);
  ctx.lineTo(gridX + gridWidth, gridY + gridHeight + markOffset + markLength);
  ctx.stroke();
}
