import { motion } from "framer-motion";
import { User, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { FaceLandmarks } from "@/hooks/useImageProcessing";

interface PhotoCanvasProps {
  bgColor: "white" | "grey" | "blue";
  processedImageUrl?: string;
  faceLandmarks?: FaceLandmarks | null;
}

const bgColorMap = {
  white: "#FFFFFF",
  grey: "#E0E0E0",
  blue: "#D6EAF8",
};

export const PhotoCanvas = ({ bgColor, processedImageUrl, faceLandmarks }: PhotoCanvasProps) => {
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Handle mouse/touch drag for repositioning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom((prev) => Math.min(150, Math.max(50, prev + delta)));
  };

  const resetView = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas Container */}
      <motion.div
        ref={containerRef}
        className="relative border-3 border-primary shadow-brutal-lg cursor-move overflow-hidden"
        style={{ backgroundColor: bgColorMap[bgColor] }}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Photo Canvas - 300x300 for demo (2x2 ratio) */}
        <div
          className="w-64 h-64 md:w-80 md:h-80 flex items-center justify-center relative overflow-hidden"
          style={{
            transform: `scale(${zoom / 100}) translate(${position.x / (zoom / 100)}px, ${position.y / (zoom / 100)}px)`,
            transformOrigin: "center center",
          }}
        >
          {processedImageUrl ? (
            // Actual processed image
            <img
              src={processedImageUrl}
              alt="Processed passport photo"
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          ) : (
            // Placeholder silhouette
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-40 md:w-40 md:h-52 bg-secondary/50 rounded-t-full flex items-end justify-center">
                <User className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/50" />
              </div>
            </div>
          )}
        </div>

        {/* Face guide overlay */}
        {showGuides && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center crosshair */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-brand/30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand/30" />
            
            {/* Face zone indicator */}
            <div className="absolute top-[15%] left-[25%] right-[25%] bottom-[30%] border-2 border-dashed border-brand/40 rounded-t-full" />
            
            {/* Face landmarks visualization */}
            {faceLandmarks && (
              <>
                {/* Eyes markers */}
                <div 
                  className="absolute w-2 h-2 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${(faceLandmarks.leftEye.x / 300) * 100}%`,
                    top: `${(faceLandmarks.leftEye.y / 300) * 100}%`,
                  }}
                />
                <div 
                  className="absolute w-2 h-2 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${(faceLandmarks.rightEye.x / 300) * 100}%`,
                    top: `${(faceLandmarks.rightEye.y / 300) * 100}%`,
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-brand pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-brand pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-brand pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-brand pointer-events-none" />
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
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
            onClick={resetView}
            className="p-2 hover:bg-secondary transition-colors"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle guides */}
        <button
          onClick={() => setShowGuides(!showGuides)}
          className={`px-3 py-2 border-2 border-primary text-sm font-bold transition-all ${
            showGuides ? "bg-brand text-brand-foreground" : "bg-background hover:bg-secondary"
          }`}
        >
          Guides
        </button>
      </div>

      {/* Canvas Info */}
      <p className="text-xs text-muted-foreground text-center">
        Drag to reposition • Scroll to zoom • Use toolbar to touch up edges
      </p>
    </div>
  );
};
