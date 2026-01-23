import { motion, AnimatePresence } from "framer-motion";
import { Palette, ChevronDown, Maximize2, Edit3, Check } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { photoSizes, type PhotoSize } from "@/data/photoSizes";
import { NeoButton } from "@/components/ui/neo-button";

export interface PhotoFormat {
  id: string;
  name: string;
  dimensions: string;
  bgColor: "white" | "grey";
  isCustom?: boolean;
}

interface ControlsPanelProps {
  selectedFormat: PhotoFormat;
  setSelectedFormat: (format: PhotoFormat) => void;
  bgColor: "white" | "grey";
  setBgColor: (color: "white" | "grey") => void;
}

// Convert PhotoSize to PhotoFormat
const photoFormats: PhotoFormat[] = photoSizes.map((size) => ({
  id: size.id,
  name: size.name,
  dimensions: size.dimensions,
  bgColor: "white" as const,
}));

const bgColors = [
  { id: "white" as const, label: "White", color: "#FFFFFF", border: true },
  { id: "grey" as const, label: "Light Grey", color: "#E0E0E0", border: false },
];

// Validation constants
const MIN_SIZE = 10; // Minimum 10mm or 0.4 inches
const MAX_SIZE_MM = 200; // Maximum 200mm
const MAX_SIZE_INCHES = 8; // Maximum 8 inches

export const ControlsPanel = ({
  selectedFormat,
  setSelectedFormat,
  bgColor,
  setBgColor,
}: ControlsPanelProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customWidth, setCustomWidth] = useState("35");
  const [customHeight, setCustomHeight] = useState("45");
  const [unit, setUnit] = useState<"mm" | "inches">("mm");
  const [customError, setCustomError] = useState<string | null>(null);

  // Find the matching photo size for description
  const selectedPhotoSize = photoSizes.find((s) => s.id === selectedFormat.id);

  // Validate and sanitize numeric input
  const sanitizeNumericInput = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    return value.replace(/[^0-9.]/g, "").slice(0, 6);
  };

  // Validate custom dimensions
  const validateDimensions = useCallback((): string | null => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);

    if (isNaN(width) || isNaN(height)) {
      return "Please enter valid numbers";
    }

    if (width <= 0 || height <= 0) {
      return "Dimensions must be greater than 0";
    }

    const minSize = unit === "mm" ? MIN_SIZE : MIN_SIZE / 25.4;
    const maxSize = unit === "mm" ? MAX_SIZE_MM : MAX_SIZE_INCHES;

    if (width < minSize || height < minSize) {
      return `Minimum size is ${unit === "mm" ? "10mm" : "0.4 inches"}`;
    }

    if (width > maxSize || height > maxSize) {
      return `Maximum size is ${unit === "mm" ? "200mm" : "8 inches"}`;
    }

    return null;
  }, [customWidth, customHeight, unit]);

  // Apply custom dimensions
  const applyCustomDimensions = useCallback(() => {
    const error = validateDimensions();
    if (error) {
      setCustomError(error);
      return;
    }

    setCustomError(null);
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);

    const dimensionString = unit === "mm" 
      ? `${width}×${height} mm` 
      : `${width}×${height} inches`;

    const customFormat: PhotoFormat = {
      id: "custom",
      name: "Custom Size",
      dimensions: dimensionString,
      bgColor: "white",
      isCustom: true,
    };

    setSelectedFormat(customFormat);
    setShowCustomInput(false);
  }, [customWidth, customHeight, unit, validateDimensions, setSelectedFormat]);

  // Clear error when inputs change
  useEffect(() => {
    if (customError) {
      setCustomError(null);
    }
  }, [customWidth, customHeight, unit]);

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-lg flex items-center gap-2">
        <Maximize2 className="w-5 h-5 text-brand" />
        Photo Settings
      </h2>

      {/* Photo Size Selector */}
      <div>
        <label htmlFor="photo-size-selector" className="block text-sm font-bold mb-2">
          Photo Size
        </label>
        <div className="relative">
          <button
            id="photo-size-selector"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full border-3 border-primary bg-background p-3 flex items-center justify-between shadow-brutal hover:shadow-brutal-hover transition-shadow"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedFormat.isCustom ? "✏️" : "📐"}</span>
              <div className="text-left">
                <div className="font-bold">{selectedFormat.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedFormat.dimensions}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-50 mt-1 border-3 border-primary bg-background shadow-brutal-lg max-h-64 overflow-y-auto"
                role="listbox"
              >
                {/* Custom Size Option */}
                <button
                  onClick={() => {
                    setShowCustomInput(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full p-3 flex items-center gap-2 hover:bg-secondary transition-colors text-left border-b-2 border-primary"
                  role="option"
                >
                  <span className="text-xl">✏️</span>
                  <div className="flex-1">
                    <div className="font-bold text-brand">Custom Size</div>
                    <div className="text-xs text-muted-foreground">
                      Enter your own dimensions
                    </div>
                  </div>
                  <Edit3 className="w-4 h-4 text-brand" />
                </button>

                {/* Preset Sizes */}
                {photoFormats.map((format) => {
                  const sizeInfo = photoSizes.find((s) => s.id === format.id);
                  return (
                    <button
                      key={format.id}
                      onClick={() => {
                        setSelectedFormat(format);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full p-3 flex items-center gap-2 hover:bg-secondary transition-colors text-left ${
                        selectedFormat.id === format.id && !selectedFormat.isCustom
                          ? "bg-highlight/20"
                          : ""
                      }`}
                      role="option"
                      aria-selected={selectedFormat.id === format.id}
                    >
                      <span className="text-xl">📐</span>
                      <div className="flex-1">
                        <div className="font-bold">{format.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format.dimensions}
                          {sizeInfo?.description && (
                            <span className="ml-2 text-brand">
                              • {sizeInfo.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Custom Size Input Modal */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-3 border-brand bg-brand/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-brand" />
                  Custom Dimensions
                </h3>
                <button
                  onClick={() => setShowCustomInput(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              {/* Unit Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setUnit("mm")}
                  className={`flex-1 py-2 text-sm font-bold border-2 transition-all ${
                    unit === "mm"
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-primary hover:bg-secondary"
                  }`}
                >
                  Millimeters (mm)
                </button>
                <button
                  onClick={() => setUnit("inches")}
                  className={`flex-1 py-2 text-sm font-bold border-2 transition-all ${
                    unit === "inches"
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-primary hover:bg-secondary"
                  }`}
                >
                  Inches (in)
                </button>
              </div>

              {/* Dimension Inputs */}
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label htmlFor="custom-width" className="block text-xs font-bold mb-1">
                    Width
                  </label>
                  <input
                    id="custom-width"
                    type="text"
                    inputMode="decimal"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(sanitizeNumericInput(e.target.value))}
                    placeholder={unit === "mm" ? "35" : "2"}
                    className="w-full p-2 border-2 border-primary bg-background text-center font-mono focus:outline-none focus:ring-2 ring-brand"
                    maxLength={6}
                    aria-describedby="dimension-hint"
                  />
                </div>
                <span className="text-lg font-bold mt-5">×</span>
                <div className="flex-1">
                  <label htmlFor="custom-height" className="block text-xs font-bold mb-1">
                    Height
                  </label>
                  <input
                    id="custom-height"
                    type="text"
                    inputMode="decimal"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(sanitizeNumericInput(e.target.value))}
                    placeholder={unit === "mm" ? "45" : "2"}
                    className="w-full p-2 border-2 border-primary bg-background text-center font-mono focus:outline-none focus:ring-2 ring-brand"
                    maxLength={6}
                    aria-describedby="dimension-hint"
                  />
                </div>
                <span className="text-sm font-bold mt-5 text-muted-foreground">
                  {unit}
                </span>
              </div>

              {/* Hint */}
              <p id="dimension-hint" className="text-xs text-muted-foreground">
                {unit === "mm" 
                  ? "Common sizes: 35×45mm (passport), 25×30mm (stamp)" 
                  : "Common sizes: 2×2in (US passport), 2.5×3.5in (wallet)"}
              </p>

              {/* Error */}
              {customError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-destructive font-bold"
                >
                  ⚠️ {customError}
                </motion.p>
              )}

              {/* Apply Button */}
              <NeoButton
                size="sm"
                className="w-full"
                onClick={applyCustomDimensions}
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Custom Size
              </NeoButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Color Picker */}
      <div>
        <label className="block text-sm font-bold mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Background Color
        </label>
        <div className="grid grid-cols-2 gap-2">
          {bgColors.map((color) => (
            <button
              key={color.id}
              onClick={() => setBgColor(color.id)}
              className={`p-3 border-3 transition-all ${
                bgColor === color.id
                  ? "border-brand shadow-brutal"
                  : "border-primary hover:shadow-brutal-hover"
              }`}
              aria-pressed={bgColor === color.id}
            >
              <div
                className={`w-full h-8 mb-1 ${color.border ? "border border-secondary" : ""}`}
                style={{ backgroundColor: color.color }}
              />
              <span className="text-xs font-bold">{color.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Info */}
      <div className="p-4 border-2 border-dashed border-primary bg-secondary/30">
        <h3 className="font-bold text-sm mb-2">Size Info</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Size: {selectedFormat.dimensions}</li>
          {selectedPhotoSize?.description && (
            <li>• {selectedPhotoSize.description}</li>
          )}
          {selectedFormat.isCustom && (
            <li className="text-brand">• Custom user-defined size</li>
          )}
          <li>• Head must be 50-69% of frame height</li>
          <li>• Eyes level and centered</li>
        </ul>
      </div>
    </div>
  );
};