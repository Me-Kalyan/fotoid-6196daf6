import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { generatePreview, type SheetSize, type GeneratedSheet } from "@/utils/printSheetGenerator";
import type { FaceLandmarks } from "@/hooks/useImageProcessing";

interface PrintSheetPreviewProps {
  photoUrl: string;
  sheetSize: SheetSize;
  bgColor: string;
  faceLandmarks?: FaceLandmarks | null;
  formatId?: string;
  photoWidthInches?: number;
  photoHeightInches?: number;
}

export const PrintSheetPreview = ({ photoUrl, sheetSize, bgColor, faceLandmarks, formatId, photoWidthInches, photoHeightInches }: PrintSheetPreviewProps) => {
  const [preview, setPreview] = useState<GeneratedSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUrl) return;

    const generate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await generatePreview(
          photoUrl, 
          sheetSize, 
          bgColor, 
          300, 
          faceLandmarks, 
          formatId,
          photoWidthInches,
          photoHeightInches
        );
        setPreview(result);
      } catch (err) {
        console.error("Failed to generate preview:", err);
        setError("Failed to generate preview");
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [photoUrl, sheetSize, bgColor, faceLandmarks, formatId, photoWidthInches, photoHeightInches]);

  if (error) {
    return (
      <div className="w-full aspect-[3/2] border-3 border-primary bg-secondary/50 flex items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading || !preview) {
    return (
      <motion.div
        className="w-full aspect-[3/2] border-3 border-primary bg-secondary/30 flex items-center justify-center"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full"
    >
      <div className="border-3 border-primary shadow-brutal overflow-hidden bg-card">
        <img
          src={preview.dataUrl}
          alt={`${sheetSize} print sheet preview with ${preview.photoCount} photos`}
          className="w-full h-auto"
        />
      </div>

      {/* Info badge */}
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute -top-3 -right-3 bg-brand text-brand-foreground px-3 py-1.5 text-sm font-bold border-3 border-primary shadow-brutal"
      >
        {preview.photoCount} photos
      </motion.div>

      {/* Grid info */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-primary bg-secondary" />
          <span className="text-muted-foreground">
            {preview.columns} × {preview.rows} grid
          </span>
        </div>
        <span className="font-mono text-muted-foreground uppercase">
          {sheetSize}
        </span>
      </div>
    </motion.div>
  );
};
