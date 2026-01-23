import { motion } from "framer-motion";
import {
  Download,
  FileImage,
  Grid3X3,
  Printer,
  ArrowLeft,
  Check,
  Sparkles,
  Lock,
  AlertTriangle,
  Monitor,
  PrinterCheck
} from "lucide-react";
import { useState, useCallback } from "react";
import { NeoButton } from "@/components/ui/neo-button";
import { Slider } from "@/components/ui/slider";
import { PrintSheetPreview } from "./PrintSheetPreview";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import { generatePrintSheet, downloadSheet, type SheetSize } from "@/utils/printSheetGenerator";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";
import { useToast } from "@/hooks/use-toast";
import type { PhotoFormat } from "@/components/editor/ControlsPanel";
import { drawImageWithFaceCrop, getPassportSpec } from "@/hooks/useFaceCrop";
import { logger } from "@/lib/logger";

interface EditorDownloadProps {
  selectedFormat: PhotoFormat;
  bgColor: "white" | "grey";
  onBack: () => void;
}

type OutputFormat = "single" | "sheet-3.5x5" | "sheet-4x6" | "sheet-5x7" | "sheet-6x8" | "sheet-8x10" | "sheet-8x12" | "sheet-postcard" | "sheet-a4" | "sheet-letter";
type FileFormat = "jpg" | "png";
type JpgQuality = 70 | 80 | 90 | 100;

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
    id: "sheet-3.5x5",
    title: "3.5×5 Sheet",
    description: "Compact print, 2 photos",
    icon: Grid3X3,
    photos: 2,
    sheetSize: "3.5x5",
  },
  {
    id: "sheet-4x6",
    title: "4×6 Sheet",
    description: "Standard photo print, 4 photos",
    icon: Grid3X3,
    photos: 4,
    sheetSize: "4x6",
  },
  {
    id: "sheet-postcard",
    title: "Postcard (4×6)",
    description: "Postcard size, 4 photos",
    icon: Grid3X3,
    photos: 4,
    sheetSize: "postcard",
  },
  {
    id: "sheet-5x7",
    title: "5×7 Sheet",
    description: "Medium print, 6 photos",
    icon: Grid3X3,
    photos: 6,
    sheetSize: "5x7",
  },
  {
    id: "sheet-6x8",
    title: "6×8 Sheet",
    description: "Large print, 6 photos",
    icon: Grid3X3,
    photos: 6,
    sheetSize: "6x8",
  },
  {
    id: "sheet-8x10",
    title: "8×10 Sheet",
    description: "Photo studio size, 12 photos",
    icon: Printer,
    photos: 12,
    sheetSize: "8x10",
  },
  {
    id: "sheet-8x12",
    title: "8×12 Sheet",
    description: "Large format, 15 photos",
    icon: Printer,
    photos: 15,
    sheetSize: "8x12",
  },
  {
    id: "sheet-a4",
    title: "A4 Sheet",
    description: "International paper, 8+ photos",
    icon: Printer,
    photos: 8,
    sheetSize: "a4",
  },
  {
    id: "sheet-letter",
    title: "Letter Sheet",
    description: "US Letter (8.5×11), 10 photos",
    icon: Printer,
    photos: 10,
    sheetSize: "letter",
  },
];

const bgColorHex = {
  white: "#FFFFFF",
  grey: "#E0E0E0",
};

// Helper to parse dimension strings like "2×2 inches" or "35×45 mm" into inches
function parseDimensions(dimensions: string): { width: number; height: number } {
  // Remove extra spaces and normalize the × symbol
  const normalized = dimensions.replace(/\s+/g, ' ').replace(/x/gi, '×');

  // Match patterns like "2×2 inches", "35×45 mm", "4×6 inches"
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*(inch(?:es)?|in|mm)/i);

  if (!match) {
    // Default to 2×2 inches if parsing fails
    return { width: 2, height: 2 };
  }

  let width = parseFloat(match[1]);
  let height = parseFloat(match[2]);
  const unit = match[3].toLowerCase();

  // Convert mm to inches (1 inch = 25.4 mm)
  if (unit === 'mm') {
    width = width / 25.4;
    height = height / 25.4;
  }

  return { width, height };
}

export const EditorDownload = ({ selectedFormat, bgColor, onBack }: EditorDownloadProps) => {
  const [selectedOutput, setSelectedOutput] = useState<OutputFormat>("single");
  const [fileFormat, setFileFormat] = useState<FileFormat>("jpg");
  const [dpi, setDpi] = useState<number>(300);
  const [jpgQuality, setJpgQuality] = useState<JpgQuality>(90);
  const [isDownloading, setIsDownloading] = useState(false);

  const { processedImage } = useImageProcessingContext();
  const {
    freeDownloadsRemaining,
    canDownloadFree,
    recordDownload,
    isLoading: historyLoading,
    isProActive,
  } = useDownloadHistory();
  const { toast } = useToast();

  const selectedOption = outputOptions.find(o => o.id === selectedOutput);

  // Parse the selected format's dimensions
  const photoDimensions = parseDimensions(selectedFormat.dimensions);

  const handleDownload = useCallback(async () => {
    if (!processedImage?.processedImage) return;

    // Check if user can download for free
    if (!canDownloadFree) {
      toast({
        title: "Free downloads exhausted",
        description: "Upgrade to Pro for unlimited downloads or purchase a single download.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const timestamp = Date.now();
      const formatId = selectedFormat.id.toLowerCase();

      if (selectedOutput === "single") {
        // Download single photo with correct dimensions
        // Create a canvas to resize the photo to the correct physical size
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = processedImage.processedImage;
        });

        // Calculate pixel dimensions based on DPI and photo size
        const targetWidthPx = Math.round(photoDimensions.width * dpi);
        const targetHeightPx = Math.round(photoDimensions.height * dpi);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidthPx;
        canvas.height = targetHeightPx;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Fill with background color first
          ctx.fillStyle = bgColorHex[bgColor];
          ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);

          // Use smart crop for final download
          const spec = getPassportSpec(selectedFormat.id);
          drawImageWithFaceCrop(ctx, img, processedImage.faceLandmarks, targetWidthPx, targetHeightPx, spec);

          // Generate download
          const mimeType = fileFormat === 'png' ? 'image/png' : 'image/jpeg';
          const quality = fileFormat === 'jpg' ? jpgQuality / 100 : undefined;
          const dataUrl = canvas.toDataURL(mimeType, quality);

          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `passport-photo-${formatId}-${timestamp}.${fileFormat}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Generate and download print sheet with correct photo dimensions
        const sheetSize = selectedOption?.sheetSize;
        if (!sheetSize) return;

        const sheet = await generatePrintSheet(
          processedImage.processedImage,
          sheetSize,
          bgColorHex[bgColor],
          dpi,
          photoDimensions.width,
          photoDimensions.height,
          processedImage.faceLandmarks,
          selectedFormat.id
        );

        const filename = `passport-sheet-${sheetSize}-${formatId}-${timestamp}.${fileFormat}`;
        downloadSheet(sheet.dataUrl, filename);
      }

      // Record the download
      recordDownload({
        photoType: selectedOption?.id || 'single',
        countryCode: selectedFormat.id,
        isPaid: false,
      });

      toast({
        title: "Download complete!",
        description: `Your ${selectedOption?.title || 'photo'} (${selectedFormat.dimensions}) has been downloaded.`,
      });

      logger.log("Download complete:", { selectedOutput, fileFormat, selectedFormat, photoDimensions });
    } catch (error) {
      logger.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [processedImage, selectedOutput, selectedOption, fileFormat, selectedFormat, bgColor, dpi, jpgQuality, canDownloadFree, recordDownload, toast, photoDimensions]);

  const getDpiLabel = (value: number) => {
    if (value <= 72) return "Web (72 DPI)";
    if (value <= 150) return "Medium (150 DPI)";
    if (value <= 200) return "Good (200 DPI)";
    return "Print (300 DPI)";
  };

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
              Choose your output format for your {selectedFormat.name} photo.
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {outputOptions.map((option) => (
                <motion.div
                  key={option.id}
                  className={`relative p-3 border-3 cursor-pointer transition-all ${selectedOutput === option.id
                    ? "border-brand bg-brand/10 shadow-brutal"
                    : "border-primary hover:shadow-brutal-hover bg-card"
                    }`}
                  onClick={() => setSelectedOutput(option.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-10 h-10 mb-2 border-2 border-primary flex items-center justify-center ${selectedOutput === option.id ? "bg-brand text-brand-foreground" : "bg-secondary"
                      }`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-xs">{option.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
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

            {/* Selected Sheet Info */}
            {selectedOutput !== "single" && selectedOption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-brand/10 border-2 border-brand"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-brand" />
                    <span className="font-bold text-sm">{selectedOption.title}</span>
                  </div>
                  <div className="text-sm font-mono bg-background px-2 py-0.5 border border-primary">
                    ~{selectedOption.photos} photos
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Photo size: {selectedFormat.dimensions} • Sheet will be tiled automatically
                </p>
              </motion.div>
            )}
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
                className={`flex-1 p-3 border-3 transition-all ${fileFormat === "jpg"
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
                className={`flex-1 p-3 border-3 transition-all ${fileFormat === "png"
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

          {/* JPG Quality Slider */}
          {fileFormat === "jpg" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg">Compression Quality</h2>
                <span className="text-sm font-bold text-brand">{jpgQuality}%</span>
              </div>

              <div className="p-4 border-3 border-primary bg-card">
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {([70, 80, 90, 100] as JpgQuality[]).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setJpgQuality(quality)}
                      className={`py-2 px-3 border-2 text-sm font-bold transition-all ${jpgQuality === quality
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-primary hover:bg-secondary"
                        }`}
                    >
                      {quality}%
                    </button>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground border-t border-dashed border-primary/30 pt-3">
                  {jpgQuality === 100
                    ? "✓ Maximum quality, larger file size (~2-3 MB)"
                    : jpgQuality === 90
                      ? "✓ Recommended - great quality, smaller file (~500KB-1MB)"
                      : jpgQuality === 80
                        ? "○ Good balance of quality and size (~300-500KB)"
                        : "○ Smallest file size, may show compression artifacts (~150-300KB)"}
                </div>
              </div>
            </motion.div>
          )}

          {/* DPI Quality Slider */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Output Quality</h2>
              <span className="text-sm font-bold text-brand">{getDpiLabel(dpi)}</span>
            </div>

            <div className="p-4 border-3 border-primary bg-card">
              <div className="flex items-center gap-4 mb-3">
                <Monitor className="w-5 h-5 text-muted-foreground" />
                <Slider
                  value={[dpi]}
                  onValueChange={(value) => setDpi(value[0])}
                  min={72}
                  max={300}
                  step={1}
                  className="flex-1"
                />
                <PrinterCheck className="w-5 h-5 text-brand" />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>72 DPI</span>
                <span>150 DPI</span>
                <span>300 DPI</span>
              </div>

              <p className="text-xs text-muted-foreground mt-3 border-t border-dashed border-primary/30 pt-3">
                {dpi >= 200
                  ? "✓ Great for professional printing"
                  : dpi >= 150
                    ? "○ Suitable for home printing"
                    : "○ Best for web/digital use only"}
              </p>
            </div>
          </motion.div>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeoButton
              variant={canDownloadFree ? "default" : "secondary"}
              size="xl"
              onClick={handleDownload}
              disabled={isDownloading || !processedImage || historyLoading || !canDownloadFree}
              className="w-full"
            >
              {historyLoading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : isDownloading ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : !canDownloadFree ? (
                <>
                  <Lock className="w-5 h-5" />
                  Upgrade to Download
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
            className={`mt-6 p-3 border-2 border-dashed text-center ${isProActive
              ? "border-success bg-success/10"
              : canDownloadFree
                ? "border-primary bg-highlight/10"
                : "border-destructive bg-destructive/10"
              }`}
          >
            {isProActive ? (
              <>
                <p className="font-bold text-sm text-success">
                  ✅ Pro Subscriber
                </p>
                <p className="text-xs text-muted-foreground">
                  Unlimited downloads included
                </p>
              </>
            ) : canDownloadFree ? (
              <>
                <p className="font-bold text-sm">
                  <span className="text-brand">{freeDownloadsRemaining}</span> free download{freeDownloadsRemaining !== 1 ? 's' : ''} remaining
                </p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro for unlimited downloads
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  <p className="font-bold text-sm text-destructive">
                    Free downloads exhausted
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro for unlimited downloads
                </p>
              </>
            )}
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
                key={`single-${selectedFormat.dimensions}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-3 border-primary shadow-brutal overflow-hidden flex flex-col items-center"
                style={{ backgroundColor: bgColorHex[bgColor] }}
              >
                <img
                  src={processedImage.processedImage}
                  alt="Processed passport photo"
                  className="object-cover"
                  style={{
                    width: photoDimensions.width >= photoDimensions.height ? '200px' : `${200 * (photoDimensions.width / photoDimensions.height)}px`,
                    height: photoDimensions.height >= photoDimensions.width ? '200px' : `${200 * (photoDimensions.height / photoDimensions.width)}px`,
                  }}
                />
                <div className="text-xs font-mono py-1 text-muted-foreground bg-background/50 w-full text-center border-t border-primary/20">
                  {selectedFormat.dimensions}
                </div>
              </motion.div>
            ) : selectedOption?.sheetSize ? (
              <PrintSheetPreview
                key={`${selectedOption.sheetSize}-${selectedFormat.id}`}
                photoUrl={processedImage.processedImage}
                sheetSize={selectedOption.sheetSize}
                bgColor={bgColorHex[bgColor]}
                faceLandmarks={processedImage.faceLandmarks}
                formatId={selectedFormat.id}
                photoWidthInches={photoDimensions.width}
                photoHeightInches={photoDimensions.height}
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
