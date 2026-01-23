import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { generatePreview, type SheetSize, type GeneratedSheet } from "@/utils/printSheetGenerator";

interface PrintSheetPreviewProps {
  photoUrl: string;
  sheetSize: SheetSize;
  bgColor: string;
  photoWidthInches?: number;
  photoHeightInches?: number;
}

export const PrintSheetPreview = ({ photoUrl, sheetSize, bgColor, photoWidthInches, photoHeightInches }: PrintSheetPreviewProps) => {
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
  }, [photoUrl, sheetSize, bgColor, photoWidthInches, photoHeightInches]);

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

  // Calculate grid overlay positions based on preview dimensions
  const gridOverlay = preview ? (() => {
    const containerAspect = preview.columns > preview.rows ? 3 / 2 : 2 / 3;
    const photoAspectRatio = (photoWidthInches || 2) / (photoHeightInches || 2);
    
    // Calculate individual photo cell percentages
    const cellWidthPercent = 100 / preview.columns;
    const cellHeightPercent = 100 / preview.rows;
    
    return { cellWidthPercent, cellHeightPercent };
  })() : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full"
    >
      <div className="relative border-3 border-primary shadow-brutal overflow-hidden bg-card">
        <img
          src={preview.dataUrl}
          alt={`${sheetSize} print sheet preview with ${preview.photoCount} photos`}
          className="w-full h-auto"
        />
        
        {/* Cut guide grid overlay */}
        {gridOverlay && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Vertical cut lines */}
            {Array.from({ length: preview.columns - 1 }).map((_, i) => (
              <motion.div
                key={`v-${i}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                className="absolute top-0 bottom-0 w-px origin-top"
                style={{
                  left: `${(i + 1) * gridOverlay.cellWidthPercent}%`,
                  background: 'repeating-linear-gradient(to bottom, hsl(var(--brand)) 0, hsl(var(--brand)) 4px, transparent 4px, transparent 8px)',
                }}
              />
            ))}
            
            {/* Horizontal cut lines */}
            {Array.from({ length: preview.rows - 1 }).map((_, i) => (
              <motion.div
                key={`h-${i}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }}
                className="absolute left-0 right-0 h-px origin-left"
                style={{
                  top: `${(i + 1) * gridOverlay.cellHeightPercent}%`,
                  background: 'repeating-linear-gradient(to right, hsl(var(--brand)) 0, hsl(var(--brand)) 4px, transparent 4px, transparent 8px)',
                }}
              />
            ))}
            
            {/* Corner scissors icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-1 left-1 text-brand text-xs font-bold bg-background/80 px-1 py-0.5 border border-brand"
            >
              ✂️ Cut here
            </motion.div>
          </div>
        )}
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
          <div className="w-3 h-3 border border-brand bg-brand/20" style={{ borderStyle: 'dashed' }} />
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
