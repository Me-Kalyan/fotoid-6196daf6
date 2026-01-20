import { motion } from "framer-motion";
import { Globe, Palette, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CountryFormat } from "@/pages/Editor";

interface ControlsPanelProps {
  selectedCountry: CountryFormat;
  setSelectedCountry: (country: CountryFormat) => void;
  bgColor: "white" | "grey" | "blue";
  setBgColor: (color: "white" | "grey" | "blue") => void;
}

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

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-lg flex items-center gap-2">
        <Globe className="w-5 h-5 text-brand" />
        Photo Settings
      </h2>

      {/* Country Selector */}
      <div>
        <label className="block text-sm font-bold mb-2">Country Format</label>
        <div className="relative">
          <button
            onClick={() => setIsCountryOpen(!isCountryOpen)}
            className="w-full border-3 border-primary bg-background p-3 flex items-center justify-between shadow-brutal hover:shadow-brutal-hover transition-shadow"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{getFlag(selectedCountry.code)}</span>
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
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setBgColor(country.bgColor);
                    setIsCountryOpen(false);
                  }}
                  className={`w-full p-3 flex items-center gap-2 hover:bg-secondary transition-colors text-left ${
                    selectedCountry.code === country.code ? "bg-highlight/20" : ""
                  }`}
                >
                  <span className="text-xl">{getFlag(country.code)}</span>
                  <div>
                    <div className="font-bold">{country.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {country.dimensions}
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
        <h3 className="font-bold text-sm mb-2">Requirements</h3>
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
