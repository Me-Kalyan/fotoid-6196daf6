/**
 * Photo Size Presets
 * Standard passport and ID photo sizes for printing
 */

export interface PhotoSize {
  id: string;
  name: string;
  dimensions: string;
  widthMm: number;
  heightMm: number;
  description?: string;
}

// Standard passport/ID photo sizes
export const photoSizes: PhotoSize[] = [
  // Most common sizes
  {
    id: "35x45",
    name: "Passport Standard",
    dimensions: "35×45 mm",
    widthMm: 35,
    heightMm: 45,
    description: "Most common worldwide",
  },
  {
    id: "35x35",
    name: "Square Passport",
    dimensions: "35×35 mm",
    widthMm: 35,
    heightMm: 35,
    description: "Square format",
  },
  {
    id: "2x2in",
    name: "US Passport",
    dimensions: "2×2 inches",
    widthMm: 51,
    heightMm: 51,
    description: "US visa & passport",
  },
  {
    id: "25x30",
    name: "Stamp Size",
    dimensions: "25×30 mm",
    widthMm: 25,
    heightMm: 30,
    description: "Small stamp photos",
  },
  {
    id: "33x48",
    name: "Aadhaar Card",
    dimensions: "33×48 mm",
    widthMm: 33,
    heightMm: 48,
    description: "Indian Aadhaar format",
  },
  {
    id: "40x50",
    name: "Visa Large",
    dimensions: "40×50 mm",
    widthMm: 40,
    heightMm: 50,
    description: "Larger visa photos",
  },
  {
    id: "45x45",
    name: "Square Large",
    dimensions: "45×45 mm",
    widthMm: 45,
    heightMm: 45,
    description: "Large square format",
  },
  {
    id: "50x50",
    name: "ID Card",
    dimensions: "50×50 mm",
    widthMm: 50,
    heightMm: 50,
    description: "Square ID photos",
  },
];

// Print sheet sizes for tiled printing
export interface PrintSheetSize {
  id: string;
  name: string;
  dimensions: string;
  widthInches: number;
  heightInches: number;
  description: string;
  photosApprox: number; // Approximate number of 35x45mm photos that fit
}

export const printSheetSizes: PrintSheetSize[] = [
  // Common photo print sizes (India & International)
  {
    id: "4x6",
    name: "4×6 inch",
    dimensions: "4×6 inches",
    widthInches: 6,
    heightInches: 4,
    description: "Standard photo print",
    photosApprox: 4,
  },
  {
    id: "3.5x5",
    name: "3.5×5 inch",
    dimensions: "3.5×5 inches",
    widthInches: 5,
    heightInches: 3.5,
    description: "Small photo print",
    photosApprox: 2,
  },
  {
    id: "5x7",
    name: "5×7 inch",
    dimensions: "5×7 inches",
    widthInches: 7,
    heightInches: 5,
    description: "Medium photo print",
    photosApprox: 6,
  },
  {
    id: "6x8",
    name: "6×8 inch",
    dimensions: "6×8 inches",
    widthInches: 8,
    heightInches: 6,
    description: "Popular in photo studios",
    photosApprox: 8,
  },
  {
    id: "8x10",
    name: "8×10 inch",
    dimensions: "8×10 inches",
    widthInches: 10,
    heightInches: 8,
    description: "Large photo print",
    photosApprox: 12,
  },
  {
    id: "8x12",
    name: "8×12 inch",
    dimensions: "8×12 inches",
    widthInches: 12,
    heightInches: 8,
    description: "Extra large print",
    photosApprox: 15,
  },
  // Paper sizes
  {
    id: "a4",
    name: "A4 Paper",
    dimensions: "210×297 mm",
    widthInches: 8.27,
    heightInches: 11.69,
    description: "Standard A4 sheet",
    photosApprox: 8,
  },
  {
    id: "letter",
    name: "US Letter",
    dimensions: "8.5×11 inches",
    widthInches: 11,
    heightInches: 8.5,
    description: "US Letter paper",
    photosApprox: 10,
  },
  // Postcard
  {
    id: "postcard",
    name: "Postcard",
    dimensions: "4×6 inches",
    widthInches: 6,
    heightInches: 4,
    description: "Postcard size",
    photosApprox: 4,
  },
];

// Helper to convert mm to inches
export function mmToInches(mm: number): number {
  return mm / 25.4;
}

// Get photo size by ID
export function getPhotoSizeById(id: string): PhotoSize | undefined {
  return photoSizes.find((size) => size.id === id);
}

// Get print sheet size by ID
export function getPrintSheetById(id: string): PrintSheetSize | undefined {
  return printSheetSizes.find((size) => size.id === id);
}
