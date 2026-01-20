import { motion } from "framer-motion";
import { User, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState } from "react";

interface PhotoCanvasProps {
  bgColor: "white" | "grey" | "blue";
}

const bgColorMap = {
  white: "#FFFFFF",
  grey: "#E0E0E0",
  blue: "#D6EAF8",
};

export const PhotoCanvas = ({ bgColor }: PhotoCanvasProps) => {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas Container */}
      <motion.div
        className="relative border-3 border-primary shadow-brutal-lg"
        style={{ backgroundColor: bgColorMap[bgColor] }}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        {/* Mock Photo Canvas - 300x300 for demo (2x2 ratio) */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center relative overflow-hidden"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Placeholder silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-40 md:w-40 md:h-52 bg-secondary/50 rounded-t-full flex items-end justify-center">
              <User className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/50" />
            </div>
          </div>

          {/* Face guide overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-brand/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand/30" />
            
            {/* Face zone indicator */}
            <div className="absolute top-[15%] left-[25%] right-[25%] bottom-[30%] border-2 border-dashed border-brand/40 rounded-t-full" />
          </div>
        </div>

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-brand" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-brand" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-brand" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-brand" />
      </motion.div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2 border-2 border-primary bg-background p-1">
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="p-2 hover:bg-secondary transition-colors"
          disabled={zoom <= 50}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <span className="font-mono text-sm w-12 text-center">{zoom}%</span>
        
        <button
          onClick={() => setZoom(Math.min(150, zoom + 10))}
          className="p-2 hover:bg-secondary transition-colors"
          disabled={zoom >= 150}
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-primary" />

        <button
          onClick={() => setZoom(100)}
          className="p-2 hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Info */}
      <p className="text-xs text-muted-foreground text-center">
        Drag to reposition • Scroll to zoom • Use toolbar to touch up edges
      </p>
    </div>
  );
};
