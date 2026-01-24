// Standard Photo Size Presets (dimensions in mm)
export const photoPresets = [
  { label: "2 x 2 inch (US/India)", width: 51, height: 51 },
  { label: "35 x 45 mm (UK/EU)", width: 35, height: 45 },
  { label: "30 x 40 mm", width: 30, height: 40 },
  { label: "35 x 35 mm", width: 35, height: 35 },
  { label: "50 x 70 mm (Canada)", width: 50, height: 70 },
];

// Standard Paper Sizes for Printing (dimensions in mm)
export const paperSizes = [
  { label: "4 x 6 inch", width: 102, height: 152 },
  { label: "5 x 7 inch", width: 127, height: 178 },
  { label: "A4 Paper", width: 210, height: 297 },
  { label: "US Letter", width: 216, height: 279 },
];

export type PhotoPreset = typeof photoPresets[number];
export type PaperSize = typeof paperSizes[number];
