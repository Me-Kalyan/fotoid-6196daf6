import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { generatePreview, type SheetSize, type GeneratedSheet } from "@/utils/printSheetGenerator";

interface PrintSheetPreviewProps {
  photoUrl: string;
  sheetSize: SheetSize;
  bgColor: string;
}

export const PrintSheetPreview = ({ photoUrl, sheetSize, bgColor }: PrintSheetPreviewProps) => {
  const [preview, setPreview] = useState<GeneratedSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUrl) return;

    const generate = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await generatePreview(photoUrl, sheetSize, bgColor, 300);
        setPreview(result);
      } catch (err) {
        console.error("Failed to generate preview:", err);
        setError("Failed to generate preview");
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [photoUrl, sheetSize, bgColor]);

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
      className="relative"
    >
      <div className="border-3 border-primary shadow-brutal overflow-hidden bg-card">
        <img
          src={preview.dataUrl}
          alt={`${sheetSize} print sheet preview with ${preview.photoCount} photos`}
          className="w-full h-auto"
        />
      </div>
      
      {/* Info badge */}
      <div className="absolute -top-2 -right-2 bg-brand text-brand-foreground px-2 py-1 text-xs font-bold border-2 border-primary">
        {preview.columns}×{preview.rows} = {preview.photoCount} photos
      </div>
    </motion.div>
  );
};
