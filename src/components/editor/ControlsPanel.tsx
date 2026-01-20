import { motion } from "framer-motion";
import { Globe, Palette, ChevronDown, Maximize2 } from "lucide-react";
import { useState } from "react";
import type { CountryFormat } from "@/pages/Editor";

interface ControlsPanelProps {
  selectedCountry: CountryFormat;
  setSelectedCountry: (country: CountryFormat) => void;
  bgColor: "white" | "grey" | "blue";
  setBgColor: (color: "white" | "grey" | "blue") => void;
}

type FormatMode = "countries" | "custom";

const countries: CountryFormat[] = [
  { code: "US", name: "United States", dimensions: "2×2 inches", bgColor: "white" },
  { code: "IN", name: "India", dimensions: "2×2 inches", bgColor: "white" },
  { code: "UK", name: "United Kingdom", dimensions: "35×45 mm", bgColor: "grey" },
  { code: "CA", name: "Canada", dimensions: "50×70 mm", bgColor: "white" },
  { code: "AU", name: "Australia", dimensions: "35×45 mm", bgColor: "white" },
  { code: "DE", name: "Germany", dimensions: "35×45 mm", bgColor: "grey" },
  { code: "FR", name: "France", dimensions: "35×45 mm", bgColor: "grey" },
  { code: "JP", name: "Japan", dimensions: "35×45 mm", bgColor: "white" },
  { code: "CN", name: "China", dimensions: "33×48 mm", bgColor: "white" },
  { code: "BR", name: "Brazil", dimensions: "50×70 mm", bgColor: "white" },
];

// Custom photo sizes for print shops
const customSizes: CountryFormat[] = [
  { code: "MAXI", name: "Maxi Size", dimensions: "4×6 inches", bgColor: "white" },
  { code: "WALLET", name: "Wallet Size", dimensions: "2.5×3.5 inches", bgColor: "white" },
  { code: "STAMP", name: "Stamp Size", dimensions: "1×1 inch", bgColor: "white" },
  { code: "MINI", name: "Mini Square", dimensions: "1.5×1.5 inches", bgColor: "white" },
  { code: "STANDARD", name: "Standard", dimensions: "2×2 inches", bgColor: "white" },
  { code: "VISA", name: "Visa Size", dimensions: "2×2.5 inches", bgColor: "white" },
];

const bgColors = [
  { id: "white" as const, label: "White", color: "#FFFFFF", border: true },
  { id: "grey" as const, label: "Light Grey", color: "#E0E0E0", border: false },
  { id: "blue" as const, label: "Light Blue", color: "#D6EAF8", border: false },
];

export const ControlsPanel = ({
  selectedCountry,
  setSelectedCountry,
  bgColor,
  setBgColor,
}: ControlsPanelProps) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [formatMode, setFormatMode] = useState<FormatMode>("countries");

  const currentList = formatMode === "countries" ? countries : customSizes;

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-lg flex items-center gap-2">
        <Globe className="w-5 h-5 text-brand" />
        Photo Settings
      </h2>

      {/* Format Mode Toggle */}
      <div>
        <label className="block text-sm font-bold mb-2">Format Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFormatMode("countries")}
            className={`p-3 border-3 transition-all text-center ${
              formatMode === "countries"
                ? "border-brand bg-brand/10 shadow-brutal"
                : "border-primary hover:shadow-brutal-hover"
            }`}
          >
            <Globe className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-bold">Countries</span>
          </button>
          <button
            onClick={() => setFormatMode("custom")}
            className={`p-3 border-3 transition-all text-center ${
              formatMode === "custom"
                ? "border-brand bg-brand/10 shadow-brutal"
                : "border-primary hover:shadow-brutal-hover"
            }`}
          >
            <Maximize2 className="w-5 h-5 mx-auto mb-1" />
            <span className="text-xs font-bold">Custom Sizes</span>
          </button>
        </div>
      </div>

      {/* Country/Size Selector */}
      <div>
        <label className="block text-sm font-bold mb-2">
          {formatMode === "countries" ? "Country Format" : "Photo Size"}
        </label>
        <div className="relative">
          <button
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className="w-full border-3 border-primary bg-background p-3 flex items-center justify-between shadow-brutal hover:shadow-brutal-hover transition-shadow"
          >
            <div className="flex items-center gap-2">
              {formatMode === "countries" ? (
                <span className="text-xl">{getFlag(selectedCountry.code)}</span>
              ) : (
                <span className="text-xl">📐</span>
              )}
              <div className="text-left">
                <div className="font-bold">{selectedCountry.name}</div>
                <div className="text-xs text-muted-foreground">
                  {selectedCountry.dimensions}
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isCountryOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isCountryOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 border-3 border-primary bg-background shadow-brutal-lg max-h-64 overflow-y-auto"
            >
              {currentList.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setSelectedCountry(item);
                    setBgColor(item.bgColor);
                    setIsCountryOpen(false);
                  }}
                  className={`w-full p-3 flex items-center gap-2 hover:bg-secondary transition-colors text-left ${
                    selectedCountry.code === item.code ? "bg-highlight/20" : ""
                  }`}
                >
                  {formatMode === "countries" ? (
                    <span className="text-xl">{getFlag(item.code)}</span>
                  ) : (
                    <span className="text-xl">📐</span>
                  )}
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.dimensions}
                    </div>
                  </div>
                </button>
              ))}
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
        <div className="grid grid-cols-3 gap-2">
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
        <h3 className="font-bold text-sm mb-2">
          {formatMode === "countries" ? "Requirements" : "Size Info"}
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Size: {selectedCountry.dimensions}</li>
          <li>• Head must be 50-69% of frame height</li>
          <li>• Eyes level and centered</li>
          <li>• Neutral expression, mouth closed</li>
        </ul>
      </div>
    </div>
  );
};

// Helper function to get country flag emoji
function getFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    IN: "🇮🇳",
    UK: "🇬🇧",
    CA: "🇨🇦",
    AU: "🇦🇺",
    DE: "🇩🇪",
    FR: "🇫🇷",
    JP: "🇯🇵",
    CN: "🇨🇳",
    BR: "🇧🇷",
  };
  return flags[countryCode] || "🏳️";
}
