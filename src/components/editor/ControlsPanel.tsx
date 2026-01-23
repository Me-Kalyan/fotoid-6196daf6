import { motion } from "framer-motion";
import { Palette, ChevronDown, Maximize2 } from "lucide-react";
import { useState } from "react";
import { photoSizes, type PhotoSize } from "@/data/photoSizes";

export interface PhotoFormat {
  id: string;
  name: string;
  dimensions: string;
  bgColor: "white" | "grey";
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

export const ControlsPanel = ({
  selectedFormat,
  setSelectedFormat,
  bgColor,
  setBgColor,
}: ControlsPanelProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Find the matching photo size for description
  const selectedPhotoSize = photoSizes.find((s) => s.id === selectedFormat.id);

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-lg flex items-center gap-2">
        <Maximize2 className="w-5 h-5 text-brand" />
        Photo Settings
      </h2>

      {/* Photo Size Selector */}
      <div>
        <label className="block text-sm font-bold mb-2">Photo Size</label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full border-3 border-primary bg-background p-3 flex items-center justify-between shadow-brutal hover:shadow-brutal-hover transition-shadow"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">📐</span>
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

          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 border-3 border-primary bg-background shadow-brutal-lg max-h-64 overflow-y-auto"
            >
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
                      selectedFormat.id === format.id ? "bg-highlight/20" : ""
                    }`}
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
        </div>
      </div>

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
          <li>• Head must be 50-69% of frame height</li>
          <li>• Eyes level and centered</li>
        </ul>
      </div>
    </div>
  );
};
