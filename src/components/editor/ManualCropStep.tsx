import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Move, Check, ZoomIn, ZoomOut, RotateCcw, Loader2, Crop } from "lucide-react";
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
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isApplying, setIsApplying] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Parse dimensions from format
  const getAspectRatio = () => {
    const dims = selectedFormat.dimensions.match(/(\d+(?:\.\d+)?)\s*×\s*(\d+(?:\.\d+)?)/);
    if (dims) return parseFloat(dims[1]) / parseFloat(dims[2]);
    return 0.78; // default passport ratio (35/45)
  };

  const aspectRatio = getAspectRatio();
  
  // Fixed container width, height calculated from aspect ratio
  const containerWidth = 320;
  const containerHeight = containerWidth / aspectRatio;

  // Handle image load
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
      
      // Scale to cover the container
      const imgAspect = img.width / img.height;
      const containerAspect = containerWidth / containerHeight;
      
      if (imgAspect > containerAspect) {
        // Image is wider - scale to match height
        setScale(containerHeight / img.height * 1.1);
      } else {
        // Image is taller - scale to match width
        setScale(containerWidth / img.width * 1.1);
      }
    };
    img.src = imageUrl;
  }, [imageUrl, containerHeight]);

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
  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.15, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.15, 0.3));
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    // Reset scale to cover
    if (imageDimensions.width > 0) {
      const imgAspect = imageDimensions.width / imageDimensions.height;
      const containerAspect = containerWidth / containerHeight;
      if (imgAspect > containerAspect) {
        setScale(containerHeight / imageDimensions.height * 1.1);
      } else {
        setScale(containerWidth / imageDimensions.width * 1.1);
      }
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

      // Calculate the transform from preview to output
      const scaleRatio = outputWidth / containerWidth;
      
      // Apply transformations
      ctx.save();
      ctx.translate(outputWidth / 2, outputHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(position.x * scaleRatio, position.y * scaleRatio);
      
      // Draw the image centered and scaled
      const imgScaledWidth = img.width * scale * scaleRatio;
      const imgScaledHeight = img.height * scale * scaleRatio;
      
      ctx.drawImage(
        img,
        -imgScaledWidth / 2,
        -imgScaledHeight / 2,
        imgScaledWidth,
        imgScaledHeight
      );
      ctx.restore();

      // Convert to data URL
      const croppedImageUrl = canvas.toDataURL("image/png");
      onConfirm(croppedImageUrl);
    } catch (error) {
      console.error("Failed to apply crop:", error);
    } finally {
      setIsApplying(false);
    }
  }, [imageLoaded, imageUrl, position, scale, rotation, selectedFormat, bgColor, onConfirm, containerWidth]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
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
              Drag to position your face within the frame. Use zoom to adjust the size.
            </p>
          </div>

          {/* Crop Preview */}
          <div className="relative mx-auto mb-6">
            {/* Checkered background to show transparency */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #ccc 25%, transparent 25%),
                  linear-gradient(-45deg, #ccc 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #ccc 75%),
                  linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            />
            
            {/* Image container */}
            <div
              ref={containerRef}
              className="relative mx-auto border-3 border-brand overflow-hidden cursor-move touch-none"
              style={{ 
                width: containerWidth, 
                height: containerHeight,
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

              {/* Crop guide overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner brackets */}
                <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-brand" />
                <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-brand" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-brand" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-brand" />
                
                {/* Center crosshair */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-px bg-brand/50" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-px bg-brand/50" />
              </div>

              {/* Drag indicator */}
              <motion.div 
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-background/95 border-2 border-primary text-xs font-bold"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Move className="w-3.5 h-3.5" />
                <span>Drag to move</span>
              </motion.div>
            </div>
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
