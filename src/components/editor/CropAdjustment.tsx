import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Move, Check, X, RotateCcw, ZoomIn, ZoomOut, Crop, Loader2 } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";

interface CropAdjustmentProps {
  imageUrl: string;
  aspectRatio?: number; // width/height, e.g., 2/2.5 for passport
  onConfirm: (cropData: CropData) => void;
  onCancel: () => void;
  isApplying?: boolean;
}

export interface CropData {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const CropAdjustment = ({
  imageUrl,
  aspectRatio = 1,
  onConfirm,
  onCancel,
  isApplying = false,
}: CropAdjustmentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Calculate container dimensions based on aspect ratio
  const containerWidth = 280;
  const containerHeight = containerWidth / aspectRatio;

  // Handle image load
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Center and fit the image initially
      if (imageRef.current && containerRef.current) {
        const imgAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;
        
        // Scale to cover the container
        if (imgAspect > containerAspect) {
          setScale(containerHeight / img.height);
        } else {
          setScale(containerWidth / img.width);
        }
      }
    };
    img.src = imageUrl;
  }, [imageUrl, containerHeight]);

  // Mouse/touch handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  }, [position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;
    setPosition({
      x: dragStartRef.current.posX + deltaX,
      y: dragStartRef.current.posY + deltaY,
    });
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.5));
  
  // Rotation handlers
  const handleRotateLeft = () => setRotation(prev => prev - 90);
  const handleRotateRight = () => setRotation(prev => prev + 90);

  // Reset
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
    setRotation(0);
  };

  // Confirm crop
  const handleConfirm = () => {
    onConfirm({
      x: position.x,
      y: position.y,
      scale,
      rotation,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md"
      >
        <NeoCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crop className="w-5 h-5 text-brand" />
              <h2 className="font-heading text-xl font-bold">Adjust Position</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground mb-4">
            Drag to reposition your photo within the crop area. Use zoom to adjust the size.
          </p>

          {/* Crop Preview */}
          <div
            ref={containerRef}
            className="relative mx-auto border-3 border-brand overflow-hidden bg-muted cursor-move touch-none"
            style={{ width: containerWidth, height: containerHeight }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image */}
            {imageLoaded && (
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="absolute pointer-events-none select-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  left: "50%",
                  top: "50%",
                  marginLeft: "-50%",
                  marginTop: "-50%",
                }}
                draggable={false}
              />
            )}

            {/* Crop guides overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Rule of thirds lines */}
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
              <div className="absolute right-1/3 top-0 bottom-0 w-px bg-white/30" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
              <div className="absolute bottom-1/3 left-0 right-0 h-px bg-white/30" />
              
              {/* Center crosshair */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-px bg-brand/70" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-px bg-brand/70" />
            </div>

            {/* Drag indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 bg-background/90 border border-primary text-xs">
              <Move className="w-3 h-3" />
              <span>Drag to move</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <NeoButton variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </NeoButton>
            <div className="px-3 py-1 bg-secondary border border-primary text-sm font-mono">
              {Math.round(scale * 100)}%
            </div>
            <NeoButton variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </NeoButton>
            <div className="w-px h-6 bg-primary mx-2" />
            <NeoButton variant="outline" size="sm" onClick={handleRotateLeft}>
              <RotateCcw className="w-4 h-4" />
            </NeoButton>
            <NeoButton variant="outline" size="sm" onClick={handleReset}>
              Reset
            </NeoButton>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <NeoButton variant="outline" onClick={onCancel} className="flex-1" disabled={isApplying}>
              Cancel
            </NeoButton>
            <NeoButton onClick={handleConfirm} className="flex-1" disabled={isApplying}>
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply
                </>
              )}
            </NeoButton>
          </div>
        </NeoCard>
      </motion.div>
    </motion.div>
  );
};
