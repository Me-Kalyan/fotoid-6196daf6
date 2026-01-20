import React, { createContext, useContext, useState, useCallback } from "react";
import { useImageProcessing, type ProcessedImage, type ProcessingProgress } from "@/hooks/useImageProcessing";
import { useFaceCompliance, type ComplianceResult } from "@/hooks/useFaceCompliance";
import { useCanvasBrush, type BrushTool } from "@/hooks/useCanvasBrush";

interface ImageProcessingContextType {
  // Original file
  originalFile: File | null;
  setOriginalFile: (file: File | null) => void;
  
  // Processing state
  isProcessing: boolean;
  progress: ProcessingProgress;
  error: string | null;
  
  // Processed result
  processedImage: ProcessedImage | null;
  
  // Compliance
  compliance: ComplianceResult;
  
  // Brush tools
  activeTool: BrushTool;
  setActiveTool: (tool: BrushTool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  pushHistory: (imageData: ImageData) => void;
  undo: () => ImageData | null;
  redo: () => ImageData | null;
  
  // Actions
  processImage: (file: File) => Promise<ProcessedImage | null>;
  reset: () => void;
}

const ImageProcessingContext = createContext<ImageProcessingContextType | null>(null);

export const useImageProcessingContext = () => {
  const context = useContext(ImageProcessingContext);
  if (!context) {
    throw new Error("useImageProcessingContext must be used within ImageProcessingProvider");
  }
  return context;
};

interface ImageProcessingProviderProps {
  children: React.ReactNode;
}

export const ImageProcessingProvider: React.FC<ImageProcessingProviderProps> = ({ children }) => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  
  const {
    processImage: processImageHook,
    isProcessing,
    progress,
    processedImage,
    error,
    reset: resetProcessing,
  } = useImageProcessing();

  const compliance = useFaceCompliance({
    faceLandmarks: processedImage?.faceLandmarks ?? null,
    hasProcessedImage: !!processedImage,
    isProcessing,
  });

  const {
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    pushHistory,
    undo,
    redo,
    resetHistory,
  } = useCanvasBrush();

  const processImage = useCallback(async (file: File) => {
    setOriginalFile(file);
    resetHistory();
    return processImageHook(file);
  }, [processImageHook, resetHistory]);

  const reset = useCallback(() => {
    setOriginalFile(null);
    resetProcessing();
    resetHistory();
  }, [resetProcessing, resetHistory]);

  return (
    <ImageProcessingContext.Provider
      value={{
        originalFile,
        setOriginalFile,
        isProcessing,
        progress,
        error,
        processedImage,
        compliance,
        activeTool,
        setActiveTool,
        brushSize,
        setBrushSize,
        zoom,
        setZoom,
        canUndo,
        canRedo,
        pushHistory,
        undo,
        redo,
        processImage,
        reset,
      }}
    >
      {children}
    </ImageProcessingContext.Provider>
  );
};
