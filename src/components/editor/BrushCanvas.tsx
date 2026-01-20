import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { User, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { BrushTool } from "@/hooks/useCanvasBrush";
import type { FaceLandmarks } from "@/hooks/useImageProcessing";
import { FaceGuideOverlay } from "./FaceGuideOverlay";

interface BrushCanvasProps {
  bgColor: "white" | "grey" | "blue";
  processedImageUrl?: string;
  originalImageUrl?: string;
  faceLandmarks?: FaceLandmarks | null;
  activeTool: BrushTool;
  brushSize: number;
  zoom: number;
  setZoom: (zoom: number) => void;
  onPushHistory: (imageData: ImageData) => void;
  undoImageData: ImageData | null;
  redoImageData: ImageData | null;
}

const bgColorMap = {
  white: "#FFFFFF",
  grey: "#E0E0E0",
  blue: "#D6EAF8",
};

export const BrushCanvas = ({
  bgColor,
  processedImageUrl,
  originalImageUrl,
  faceLandmarks,
  activeTool,
  brushSize,
  zoom,
  setZoom,
  onPushHistory,
  undoImageData,
  redoImageData,
}: BrushCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const processedImgRef = useRef<HTMLImageElement | null>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGuides, setShowGuides] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 320, height: 320 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  
  // Touch gesture tracking for pinch-to-zoom
  const touchStartRef = useRef<{
    touches: { x: number; y: number }[];
    initialDistance: number;
    initialZoom: number;
    initialPosition: { x: number; y: number };
    center: { x: number; y: number };
  } | null>(null);

  // Load images
  useEffect(() => {
    if (!processedImageUrl) return;
    
    const loadImages = async () => {
      const processed = new Image();
      processed.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve) => {
        processed.onload = () => resolve();
        processed.src = processedImageUrl;
      });
      
      processedImgRef.current = processed;
      
      // Calculate canvas size maintaining aspect ratio
      const maxSize = 320;
      const ratio = Math.min(maxSize / processed.width, maxSize / processed.height);
      const width = Math.floor(processed.width * ratio);
      const height = Math.floor(processed.height * ratio);
      setCanvasSize({ width, height });
      
      if (originalImageUrl) {
        const original = new Image();
        original.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          original.onload = () => resolve();
          original.src = originalImageUrl;
        });
        originalImgRef.current = original;
      }
      
      setImagesLoaded(true);
    };
    
    loadImages();
  }, [processedImageUrl, originalImageUrl]);

  // Initialize canvas when images are loaded
  useEffect(() => {
    if (!imagesLoaded || !processedImgRef.current) return;
    
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    
    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!ctx || !maskCtx) return;
    
    // Set canvas dimensions
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    maskCanvas.width = canvasSize.width;
    maskCanvas.height = canvasSize.height;
    
    // Draw processed image
    ctx.drawImage(processedImgRef.current, 0, 0, canvasSize.width, canvasSize.height);
    
    // Initialize mask as fully white (all processed/transparent bg shown)
    maskCtx.fillStyle = "#FFFFFF";
    maskCtx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Push initial state to history
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    onPushHistory(imageData);
  }, [imagesLoaded, canvasSize, onPushHistory]);

  // Handle undo/redo
  useEffect(() => {
    if (!undoImageData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(undoImageData, 0, 0);
  }, [undoImageData]);

  useEffect(() => {
    if (!redoImageData) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(redoImageData, 0, 0);
  }, [redoImageData]);

  // Get canvas coordinates from mouse event
  const getCanvasCoords = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  // Draw brush stroke
  const drawStroke = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas || !originalImgRef.current || !processedImgRef.current) return;
    
    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!ctx || !maskCtx) return;
    
    // Draw on mask
    maskCtx.lineCap = "round";
    maskCtx.lineJoin = "round";
    maskCtx.lineWidth = brushSize;
    
    if (activeTool === "eraser") {
      // Eraser: paint black on mask (show original with background)
      maskCtx.strokeStyle = "#000000";
    } else if (activeTool === "restore") {
      // Restore: paint white on mask (show processed/transparent)
      maskCtx.strokeStyle = "#FFFFFF";
    }
    
    maskCtx.beginPath();
    maskCtx.moveTo(from.x, from.y);
    maskCtx.lineTo(to.x, to.y);
    maskCtx.stroke();
    
    // Composite: redraw canvas based on mask
    compositeImages();
  }, [activeTool, brushSize]);

  // Composite original and processed based on mask
  const compositeImages = useCallback(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas || !originalImgRef.current || !processedImgRef.current) return;
    
    const ctx = canvas.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (!ctx || !maskCtx) return;
    
    const { width, height } = canvasSize;
    
    // Get mask data
    const maskData = maskCtx.getImageData(0, 0, width, height);
    
    // Create temp canvases for original and processed
    const tempOriginal = document.createElement("canvas");
    const tempProcessed = document.createElement("canvas");
    tempOriginal.width = width;
    tempOriginal.height = height;
    tempProcessed.width = width;
    tempProcessed.height = height;
    
    const origCtx = tempOriginal.getContext("2d");
    const procCtx = tempProcessed.getContext("2d");
    if (!origCtx || !procCtx) return;
    
    origCtx.drawImage(originalImgRef.current, 0, 0, width, height);
    procCtx.drawImage(processedImgRef.current, 0, 0, width, height);
    
    const origData = origCtx.getImageData(0, 0, width, height);
    const procData = procCtx.getImageData(0, 0, width, height);
    const resultData = ctx.createImageData(width, height);
    
    // Blend based on mask (white = processed, black = original)
    for (let i = 0; i < maskData.data.length; i += 4) {
      const maskValue = maskData.data[i] / 255; // 0 = original, 1 = processed
      
      resultData.data[i] = Math.round(origData.data[i] * (1 - maskValue) + procData.data[i] * maskValue);
      resultData.data[i + 1] = Math.round(origData.data[i + 1] * (1 - maskValue) + procData.data[i + 1] * maskValue);
      resultData.data[i + 2] = Math.round(origData.data[i + 2] * (1 - maskValue) + procData.data[i + 2] * maskValue);
      resultData.data[i + 3] = Math.round(origData.data[i + 3] * (1 - maskValue) + procData.data[i + 3] * maskValue);
    }
    
    ctx.putImageData(resultData, 0, 0);
  }, [canvasSize]);

  // Calculate distance between two touch points
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  // Mouse/touch handlers
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Handle touch events
    if ("touches" in e) {
      if (e.touches.length === 2) {
        // Pinch gesture start
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        const center = getTouchCenter(e.touches);
        
        touchStartRef.current = {
          touches: Array.from(e.touches).map(t => ({ x: t.clientX, y: t.clientY })),
          initialDistance: distance,
          initialZoom: zoom,
          initialPosition: { ...position },
          center,
        };
        return;
      }
    }
    
    if (activeTool === "eraser" || activeTool === "restore") {
      setIsDrawing(true);
      const coords = getCanvasCoords(e);
      if (coords) {
        lastPointRef.current = coords;
      }
    } else if (activeTool === "pan" || activeTool === "select") {
      setIsDragging(true);
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        posX: position.x,
        posY: position.y,
      };
    }
  }, [activeTool, getCanvasCoords, position, zoom]);

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Handle pinch-to-zoom
    if ("touches" in e && e.touches.length === 2 && touchStartRef.current) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const scale = currentDistance / touchStartRef.current.initialDistance;
      const newZoom = Math.min(200, Math.max(50, touchStartRef.current.initialZoom * scale));
      
      setZoom(newZoom);
      
      // Also handle pan during pinch
      const currentCenter = getTouchCenter(e.touches);
      const deltaX = currentCenter.x - touchStartRef.current.center.x;
      const deltaY = currentCenter.y - touchStartRef.current.center.y;
      
      setPosition({
        x: touchStartRef.current.initialPosition.x + deltaX,
        y: touchStartRef.current.initialPosition.y + deltaY,
      });
      return;
    }
    
    if (isDrawing && (activeTool === "eraser" || activeTool === "restore")) {
      const coords = getCanvasCoords(e);
      if (coords && lastPointRef.current) {
        drawStroke(lastPointRef.current, coords);
        lastPointRef.current = coords;
      }
    } else if (isDragging) {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - dragStartRef.current.x;
      const deltaY = clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });
    }
  }, [isDrawing, isDragging, activeTool, getCanvasCoords, drawStroke, setZoom]);

  const handlePointerUp = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    // Check if ending pinch gesture
    if (e && "touches" in e && e.touches.length < 2) {
      touchStartRef.current = null;
    }
    
    if (isDrawing) {
      // Push to history after stroke ends
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          onPushHistory(imageData);
        }
      }
    }
    setIsDrawing(false);
    setIsDragging(false);
    lastPointRef.current = null;
  }, [isDrawing, onPushHistory]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setZoom(Math.min(200, Math.max(50, zoom + delta)));
  }, [zoom, setZoom]);

  const resetView = () => {
    setZoom(100);
    setPosition({ x: 0, y: 0 });
  };

  // Cursor based on tool
  const getCursor = () => {
    switch (activeTool) {
      case "eraser":
      case "restore":
        return "crosshair";
      case "pan":
        return isDragging ? "grabbing" : "grab";
      default:
        return "move";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas Container */}
      <motion.div
        className="relative border-3 border-primary shadow-brutal-lg overflow-hidden touch-none"
        style={{ 
          backgroundColor: bgColorMap[bgColor],
          cursor: getCursor(),
        }}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={() => handlePointerUp()}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onWheel={handleWheel}
      >
        <div
          className="flex items-center justify-center relative"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            transform: `scale(${zoom / 100}) translate(${position.x / (zoom / 100)}px, ${position.y / (zoom / 100)}px)`,
            transformOrigin: "center center",
          }}
        >
          {processedImageUrl && imagesLoaded ? (
            <>
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{ imageRendering: "auto" }}
              />
              {/* Hidden mask canvas */}
              <canvas
                ref={maskCanvasRef}
                className="hidden"
              />
            </>
          ) : processedImageUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-40 md:w-40 md:h-52 bg-secondary/50 rounded-t-full flex items-end justify-center">
                <User className="w-24 h-24 md:w-32 md:h-32 text-muted-foreground/50" />
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Face Guide Overlay */}
        <FaceGuideOverlay
          faceLandmarks={faceLandmarks}
          showGuides={showGuides}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
        />

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-brand pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-brand pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-brand pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-brand pointer-events-none" />

        {/* Brush cursor preview */}
        {(activeTool === "eraser" || activeTool === "restore") && (
          <div 
            className="absolute pointer-events-none border-2 rounded-full"
            style={{
              width: brushSize * (zoom / 100),
              height: brushSize * (zoom / 100),
              borderColor: activeTool === "eraser" ? "rgba(239, 68, 68, 0.7)" : "rgba(34, 197, 94, 0.7)",
              backgroundColor: activeTool === "eraser" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "none", // Hide when not hovering
            }}
          />
        )}
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4">
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
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 hover:bg-secondary transition-colors"
            disabled={zoom >= 200}
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
        {activeTool === "eraser" || activeTool === "restore" 
          ? `${activeTool === "eraser" ? "Eraser" : "Restore"}: Click and drag to ${activeTool === "eraser" ? "reveal original background" : "restore transparent background"}`
          : "Drag to pan • Pinch to zoom • Use toolbar to touch up edges"
        }
      </p>
    </div>
  );
};
