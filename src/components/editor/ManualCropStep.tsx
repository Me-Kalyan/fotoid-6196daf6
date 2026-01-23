import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Move, Check, ZoomIn, ZoomOut, RotateCcw, Loader2, Crop, User } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import type { PhotoFormat } from "./ControlsPanel";

interface ManualCropStepProps {
  imageUrl: string;
  selectedFormat: PhotoFormat;
  bgColor: "white" | "grey";
  onConfirm: (croppedImageUrl: string) => void;
  isProcessing?: boolean;
}

const bgColorHex = {
  white: "#FFFFFF",
  grey: "#E0E0E0",
};

export const ManualCropStep = ({
  imageUrl,
  selectedFormat,
  bgColor,
  onConfirm,
  isProcessing = false,
}: ManualCropStepProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isApplying, setIsApplying] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Parse dimensions from format
  const getAspectRatio = () => {
    const dims = selectedFormat.dimensions.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)/);
    if (dims) return parseFloat(dims[1]) / parseFloat(dims[2]);
    return 35 / 45; // default passport ratio
  };

  const aspectRatio = getAspectRatio();
  
  // Fixed container dimensions
  const containerWidth = 280;
  const containerHeight = Math.round(containerWidth / aspectRatio);

  // Calculate initial scale to cover container
  const calculateInitialScale = useCallback((imgWidth: number, imgHeight: number) => {
    const imgAspect = imgWidth / imgHeight;
    const containerAspect = containerWidth / containerHeight;
    
    // Scale to cover (fill) the container
    if (imgAspect > containerAspect) {
      // Image is wider - scale based on height
      return (containerHeight / imgHeight) * 1.05;
    } else {
      // Image is taller - scale based on width
      return (containerWidth / imgWidth) * 1.05;
    }
  }, [containerHeight]);

  // Handle image load
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
      setPosition({ x: 0, y: 0 });
      setScale(calculateInitialScale(img.width, img.height));
    };
    img.src = imageUrl;
  }, [imageUrl, calculateInitialScale]);

  // Mouse handlers
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

  // Controls
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.15, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.15, 0.2));
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    if (imageDimensions.width > 0) {
      setScale(calculateInitialScale(imageDimensions.width, imageDimensions.height));
    }
  };

  // Apply crop and generate final image
  const handleConfirm = useCallback(async () => {
    if (!imageLoaded) return;
    
    setIsApplying(true);
    
    try {
      // Parse dimensions to get output size at 300 DPI
      const dims = selectedFormat.dimensions.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)\s*(inch(?:es)?|in|mm)/i);
      let widthInches = 2;
      let heightInches = 2.5;
      
      if (dims) {
        widthInches = parseFloat(dims[1]);
        heightInches = parseFloat(dims[2]);
        const unit = dims[3].toLowerCase();
        if (unit === 'mm') {
          widthInches = widthInches / 25.4;
          heightInches = heightInches / 25.4;
        }
      }

      const outputDpi = 300;
      const outputWidth = Math.round(widthInches * outputDpi);
      const outputHeight = Math.round(heightInches * outputDpi);

      // Load the image
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Create output canvas
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Failed to get canvas context");

      // Fill background
      ctx.fillStyle = bgColorHex[bgColor];
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Calculate the scale ratio from preview to output
      const scaleRatio = outputWidth / containerWidth;
      
      // Calculate scaled image dimensions
      const scaledImgWidth = img.width * scale * scaleRatio;
      const scaledImgHeight = img.height * scale * scaleRatio;
      
      // Position: center of canvas + user offset
      const drawX = (outputWidth - scaledImgWidth) / 2 + (position.x * scaleRatio);
      const drawY = (outputHeight - scaledImgHeight) / 2 + (position.y * scaleRatio);
      
      ctx.drawImage(img, drawX, drawY, scaledImgWidth, scaledImgHeight);

      // Convert to data URL
      const croppedImageUrl = canvas.toDataURL("image/png");
      onConfirm(croppedImageUrl);
    } catch (error) {
      console.error("Failed to apply crop:", error);
    } finally {
      setIsApplying(false);
    }
  }, [imageLoaded, imageUrl, position, scale, selectedFormat, bgColor, onConfirm, containerWidth]);

  // Calculate image display dimensions
  const displayWidth = imageDimensions.width * scale;
  const displayHeight = imageDimensions.height * scale;

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <NeoCard className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border-2 border-brand text-brand mb-4">
              <Crop className="w-4 h-4" />
              <span className="font-bold text-sm">Crop Face</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
              Position Your Photo
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Drag to position your face within the frame. Use zoom to adjust size.
            </p>
          </div>

          {/* Crop Preview Area */}
          <div className="relative mx-auto mb-6" style={{ width: containerWidth + 40, height: containerHeight + 40 }}>
            {/* Outer checkered background (transparency indicator) */}
            <div 
              className="absolute inset-0 rounded-sm"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%),
                  linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%),
                  linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)
                `,
                backgroundSize: "12px 12px",
                backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
              }}
            />
            
            {/* Image display area (behind crop frame, larger than frame) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ opacity: 0.4 }}
            >
              {imageLoaded && (
                <img
                  src={imageUrl}
                  alt="Background preview"
                  className="absolute pointer-events-none select-none"
                  style={{
                    width: displayWidth,
                    height: displayHeight,
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  draggable={false}
                />
              )}
            </div>

            {/* Crop frame container */}
            <div
              ref={containerRef}
              className="absolute border-3 border-brand overflow-hidden cursor-move touch-none shadow-lg"
              style={{ 
                width: containerWidth, 
                height: containerHeight,
                left: 20,
                top: 20,
                backgroundColor: bgColorHex[bgColor],
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image inside crop frame */}
              {imageLoaded && (
                <img
                  src={imageUrl}
                  alt="Crop preview"
                  className="absolute pointer-events-none select-none"
                  style={{
                    width: displayWidth,
                    height: displayHeight,
                    left: `calc(50% + ${position.x}px)`,
                    top: `calc(50% + ${position.y}px)`,
                    transform: "translate(-50%, -50%)",
                  }}
                  draggable={false}
                />
              )}

              {/* Face guideline overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Face oval guideline */}
                <div 
                  className="absolute left-1/2 -translate-x-1/2 border-2 border-dashed border-brand/40 rounded-full"
                  style={{
                    width: containerWidth * 0.55,
                    height: containerHeight * 0.65,
                    top: containerHeight * 0.08,
                  }}
                />
                
                {/* Eye line guide */}
                <div 
                  className="absolute left-1/4 right-1/4 h-px bg-brand/30"
                  style={{ top: containerHeight * 0.35 }}
                />
                
                {/* Center vertical guide */}
                <div 
                  className="absolute top-1/4 bottom-1/3 w-px bg-brand/20 left-1/2 -translate-x-1/2"
                />
              </div>
            </div>

            {/* Corner brackets on crop frame */}
            <div className="absolute pointer-events-none" style={{ left: 20, top: 20, width: containerWidth, height: containerHeight }}>
              <div className="absolute -top-1 -left-1 w-5 h-5 border-l-3 border-t-3 border-brand" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-r-3 border-t-3 border-brand" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-l-3 border-b-3 border-brand" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-r-3 border-b-3 border-brand" />
            </div>

            {/* Drag indicator */}
            <motion.div 
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-background/95 border-2 border-primary text-xs font-bold shadow-brutal z-10"
              style={{ bottom: -8 }}
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Drag to move</span>
            </motion.div>
          </div>

          {/* Face position tip */}
          <div className="flex items-center gap-2 p-3 bg-brand/5 border border-brand/20 mb-4 text-xs">
            <User className="w-4 h-4 text-brand flex-shrink-0" />
            <span className="text-muted-foreground">
              Position your face within the oval guideline for best results
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <NeoButton variant="outline" size="sm" onClick={handleZoomOut} disabled={isApplying || isProcessing}>
              <ZoomOut className="w-4 h-4" />
            </NeoButton>
            <div className="px-4 py-1.5 bg-secondary border-2 border-primary text-sm font-mono min-w-[70px] text-center">
              {Math.round(scale * 100)}%
            </div>
            <NeoButton variant="outline" size="sm" onClick={handleZoomIn} disabled={isApplying || isProcessing}>
              <ZoomIn className="w-4 h-4" />
            </NeoButton>
            <div className="w-px h-8 bg-primary/30 mx-2" />
            <NeoButton variant="outline" size="sm" onClick={handleReset} disabled={isApplying || isProcessing}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </NeoButton>
          </div>

          {/* Format info */}
          <div className="bg-secondary/50 border-2 border-primary p-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Photo size:</span>
              <span className="font-bold">{selectedFormat.name} ({selectedFormat.dimensions})</span>
            </div>
          </div>

          {/* Confirm button */}
          <NeoButton
            onClick={handleConfirm}
            className="w-full"
            size="lg"
            disabled={isApplying || isProcessing || !imageLoaded}
          >
            {isApplying || isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                Crop & Continue
              </>
            )}
          </NeoButton>
        </NeoCard>
      </motion.div>
    </div>
  );
};
