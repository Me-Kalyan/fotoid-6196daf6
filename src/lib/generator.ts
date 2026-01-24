// src/lib/generator.ts
// Utility functions for generating cropped passport photos and tiled print sheets

// 1. Helper: Convert Millimeters to Pixels at 300 DPI (Print Standard)
export const mmToPx = (mm: number) => Math.round((mm / 25.4) * 300);

// 2. Helper: Load Image safely with CORS support
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Needed to avoid Tainted Canvas errors
    image.src = url;
  });

// 3. Generate the Single Cropped Image
// Takes a crop box from react-easy-crop and stretches it to fill target dimensions
export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  targetW_mm: number,
  targetH_mm: number
): Promise<string> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");

  // A. Set canvas size to the Target Output Size (e.g., 51mm -> 600px at 300 DPI)
  canvas.width = mmToPx(targetW_mm);
  canvas.height = mmToPx(targetH_mm);

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // B. High-Quality Scaling Settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // C. The Magic Draw Command
  // Params: (Source Image, Source X, Source Y, Source W, Source H, Dest X, Dest Y, Dest W, Dest H)
  // This takes the "Crop Box" from the original and stretches it to fill the "Target Canvas"
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Return high-quality PNG
  return canvas.toDataURL("image/png", 1.0);
};

// 4. Generate the Tiled Sheet
// Takes a single cropped image and tiles it onto a paper size
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

  // White Background for Paper
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Grid Calculations
  const photoW_px = mmToPx(photoW_mm);
  const photoH_px = mmToPx(photoH_mm);
  const gap_px = mmToPx(gap_mm);
  const cols = Math.floor(canvasW / (photoW_px + gap_px));
  const rows = Math.floor(canvasH / (photoH_px + gap_px));

  const totalGridW = cols * photoW_px + (cols - 1) * gap_px;
  const totalGridH = rows * photoH_px + (rows - 1) * gap_px;
  const startX = (canvasW - totalGridW) / 2;
  const startY = (canvasH - totalGridH) / 2;

  // Enable high-quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Draw Loop
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = startX + i * (photoW_px + gap_px);
      const y = startY + j * (photoH_px + gap_px);

      ctx.drawImage(photo, x, y, photoW_px, photoH_px);

      // Light grey cut lines (Optional but helpful)
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, photoW_px, photoH_px);
    }
  }

  return canvas.toDataURL("image/jpeg", 0.95);
};

// 5. Calculate how many photos fit on a sheet
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
