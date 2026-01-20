import { motion } from "framer-motion";
import { 
  Download, 
  FileImage, 
  Grid3X3, 
  Printer,
  ArrowLeft,
  Check,
  Sparkles
} from "lucide-react";
import { useState, useCallback } from "react";
import { NeoButton } from "@/components/ui/neo-button";
import { PrintSheetPreview } from "./PrintSheetPreview";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import { generatePrintSheet, downloadSheet, type SheetSize } from "@/utils/printSheetGenerator";
import type { CountryFormat } from "@/pages/Editor";

interface EditorDownloadProps {
  selectedCountry: CountryFormat;
  bgColor: "white" | "grey" | "blue";
  onBack: () => void;
}

type OutputFormat = "single" | "sheet-4x6" | "sheet-a4";
type FileFormat = "jpg" | "png";

interface OutputOption {
  id: OutputFormat;
  title: string;
  description: string;
  icon: React.ElementType;
  photos: number;
  sheetSize?: SheetSize;
}

const outputOptions: OutputOption[] = [
  {
    id: "single",
    title: "Single Photo",
    description: "One cropped passport photo",
    icon: FileImage,
    photos: 1,
  },
  {
    id: "sheet-4x6",
    title: "4×6 Print Sheet",
    description: "Perfect for drugstore printing",
    icon: Grid3X3,
    photos: 4,
    sheetSize: "4x6",
  },
  {
    id: "sheet-a4",
    title: "A4 Print Sheet",
    description: "Full page with 8+ photos",
    icon: Printer,
    photos: 8,
    sheetSize: "a4",
  },
];

const bgColorHex = {
  white: "#FFFFFF",
  grey: "#E0E0E0",
  blue: "#D6EAF8",
};

export const EditorDownload = ({ selectedCountry, bgColor, onBack }: EditorDownloadProps) => {
  const [selectedOutput, setSelectedOutput] = useState<OutputFormat>("single");
  const [fileFormat, setFileFormat] = useState<FileFormat>("jpg");
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { processedImage } = useImageProcessingContext();
  
  const selectedOption = outputOptions.find(o => o.id === selectedOutput);

  const handleDownload = useCallback(async () => {
    if (!processedImage?.processedImage) return;
    
    setIsDownloading(true);
    
    try {
      const timestamp = Date.now();
      const countryCode = selectedCountry.code.toLowerCase();
      
      if (selectedOutput === "single") {
        // Download single photo
        const link = document.createElement("a");
        link.href = processedImage.processedImage;
        link.download = `passport-photo-${countryCode}-${timestamp}.${fileFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate and download print sheet
        const sheetSize = selectedOption?.sheetSize;
        if (!sheetSize) return;
        
        const sheet = await generatePrintSheet(
          processedImage.processedImage,
          sheetSize,
          bgColorHex[bgColor]
        );
        
        const filename = `passport-sheet-${sheetSize}-${countryCode}-${timestamp}.${fileFormat}`;
        downloadSheet(sheet.dataUrl, filename);
      }
      
      console.log("Download complete:", { selectedOutput, fileFormat, selectedCountry });
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [processedImage, selectedOutput, selectedOption, fileFormat, selectedCountry, bgColor]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      {/* Left: Options */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-bold">Back to Editor</span>
            </button>

            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
              Download Your Photo
            </h1>
            <p className="text-muted-foreground">
              Choose your output format for your {selectedCountry.name} passport photo.
            </p>
          </motion.div>

          {/* Output Format Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="font-heading font-bold text-lg mb-4">Output Format</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {outputOptions.map((option) => (
                <motion.div
                  key={option.id}
                  className={`relative p-4 border-3 cursor-pointer transition-all ${
                    selectedOutput === option.id 
                      ? "border-brand bg-brand/10 shadow-brutal" 
                      : "border-primary hover:shadow-brutal-hover bg-card"
                  }`}
                  onClick={() => setSelectedOutput(option.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 mb-2 border-2 border-primary flex items-center justify-center ${
                      selectedOutput === option.id ? "bg-brand text-brand-foreground" : "bg-secondary"
                    }`}>
                      <option.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-sm">{option.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>

                    {selectedOutput === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-brand border-2 border-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-brand-foreground" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* File Format Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="font-heading font-bold text-lg mb-4">File Format</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setFileFormat("jpg")}
                className={`flex-1 p-3 border-3 transition-all ${
                  fileFormat === "jpg"
                    ? "border-brand bg-brand/10 shadow-brutal"
                    : "border-primary hover:shadow-brutal-hover"
                }`}
              >
                <div className="font-heading font-bold">JPG</div>
                <p className="text-xs text-muted-foreground">
                  Best for printing
                </p>
              </button>

              <button
                onClick={() => setFileFormat("png")}
                className={`flex-1 p-3 border-3 transition-all ${
                  fileFormat === "png"
                    ? "border-brand bg-brand/10 shadow-brutal"
                    : "border-primary hover:shadow-brutal-hover"
                }`}
              >
                <div className="font-heading font-bold">PNG</div>
                <p className="text-xs text-muted-foreground">
                  Lossless quality
                </p>
              </button>
            </div>
          </motion.div>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeoButton
              variant="default"
              size="xl"
              onClick={handleDownload}
              disabled={isDownloading || !processedImage}
              className="w-full"
            >
              {isDownloading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download {selectedOption?.title} ({fileFormat.toUpperCase()})
                </>
              )}
            </NeoButton>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              🔒 Your photo is processed entirely on your device. We never store your images.
            </p>
          </motion.div>

          {/* Free Downloads Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-3 border-2 border-dashed border-primary bg-highlight/10 text-center"
          >
            <p className="font-bold text-sm">
              <span className="text-brand">2</span> free downloads remaining
            </p>
            <p className="text-xs text-muted-foreground">
              Upgrade to Pro for unlimited downloads
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:w-[400px] xl:w-[480px] border-t-3 lg:border-t-0 lg:border-l-3 border-primary bg-secondary/30 p-6 flex flex-col"
      >
        <h2 className="font-heading font-bold text-lg mb-4">Preview</h2>
        
        {processedImage?.processedImage ? (
          <div className="flex-1 flex items-center justify-center">
            {selectedOutput === "single" ? (
              <motion.div
                key="single"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-3 border-primary shadow-brutal overflow-hidden"
                style={{ backgroundColor: bgColorHex[bgColor] }}
              >
                <img
                  src={processedImage.processedImage}
                  alt="Processed passport photo"
                  className="w-48 h-48 object-cover"
                />
              </motion.div>
            ) : selectedOption?.sheetSize ? (
              <PrintSheetPreview
                key={selectedOption.sheetSize}
                photoUrl={processedImage.processedImage}
                sheetSize={selectedOption.sheetSize}
                bgColor={bgColorHex[bgColor]}
              />
            ) : null}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No image to preview</p>
          </div>
        )}

        {/* Print tips */}
        {selectedOutput !== "single" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-card border-2 border-primary text-xs"
          >
            <p className="font-bold mb-1">💡 Printing Tips</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Print at 100% scale (no fit-to-page)</li>
              <li>• Use matte or glossy photo paper</li>
              <li>• Cut along the subtle guide lines</li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
