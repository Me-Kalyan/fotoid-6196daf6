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
import { useState } from "react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import type { CountryFormat } from "@/pages/Editor";

interface EditorDownloadProps {
  selectedCountry: CountryFormat;
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
    description: "Multiple photos for printing",
    icon: Grid3X3,
    photos: 4,
  },
  {
    id: "sheet-a4",
    title: "A4 Print Sheet",
    description: "Full page with 6-8 photos",
    icon: Printer,
    photos: 8,
  },
];

export const EditorDownload = ({ selectedCountry, onBack }: EditorDownloadProps) => {
  const [selectedOutput, setSelectedOutput] = useState<OutputFormat>("single");
  const [fileFormat, setFileFormat] = useState<FileFormat>("jpg");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    // Mock download - will trigger payment gate in Phase 6
    setTimeout(() => {
      setIsDownloading(false);
      console.log("Download:", { selectedOutput, fileFormat, selectedCountry });
    }, 1500);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
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
            Choose your output format and download your {selectedCountry.name} passport photo.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <div className={`w-14 h-14 mb-3 border-2 border-primary flex items-center justify-center ${
                    selectedOutput === option.id ? "bg-brand text-brand-foreground" : "bg-secondary"
                  }`}>
                    <option.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-bold">{option.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.description}
                  </p>
                  <span className="mt-2 text-xs font-bold text-brand">
                    {option.photos} photo{option.photos > 1 ? "s" : ""}
                  </span>

                  {selectedOutput === option.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-brand border-2 border-primary flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-brand-foreground" />
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
          <div className="flex gap-4">
            <button
              onClick={() => setFileFormat("jpg")}
              className={`flex-1 p-4 border-3 transition-all ${
                fileFormat === "jpg"
                  ? "border-brand bg-brand/10 shadow-brutal"
                  : "border-primary hover:shadow-brutal-hover"
              }`}
            >
              <div className="font-heading font-bold text-lg">JPG</div>
              <p className="text-xs text-muted-foreground">
                Smaller file size, great for printing
              </p>
            </button>

            <button
              onClick={() => setFileFormat("png")}
              className={`flex-1 p-4 border-3 transition-all ${
                fileFormat === "png"
                  ? "border-brand bg-brand/10 shadow-brutal"
                  : "border-primary hover:shadow-brutal-hover"
              }`}
            >
              <div className="font-heading font-bold text-lg">PNG</div>
              <p className="text-xs text-muted-foreground">
                Lossless quality, transparent bg
              </p>
            </button>
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <NeoButton
            variant="default"
            size="xl"
            onClick={handleDownload}
            disabled={isDownloading}
            className="min-w-64"
          >
            {isDownloading ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download {fileFormat.toUpperCase()}
              </>
            )}
          </NeoButton>

          <p className="text-xs text-muted-foreground mt-4">
            🔒 Your photo is processed entirely on your device. We never store your images.
          </p>
        </motion.div>

        {/* Free Downloads Counter (will connect to Supabase in Phase 5) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 border-2 border-dashed border-primary bg-highlight/10 text-center"
        >
          <p className="font-bold">
            <span className="text-brand">2</span> free downloads remaining
          </p>
          <p className="text-xs text-muted-foreground">
            Upgrade to Pro for unlimited downloads
          </p>
        </motion.div>
      </div>
    </div>
  );
};
