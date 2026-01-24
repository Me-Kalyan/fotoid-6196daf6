import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useImageProcessing, type ProcessedImage, type ProcessingProgress } from "@/hooks/useImageProcessing";
import { useFaceCompliance, type ComplianceResult } from "@/hooks/useFaceCompliance";
import { useCanvasBrush, type BrushTool } from "@/hooks/useCanvasBrush";

const LOCALSTORAGE_KEY = "fotoid_canvas_recovery";

interface CanvasState {
  dataUrl: string;
  width: number;
  height: number;
  formatId: string;
}

interface RecoveryData {
  canvasState: CanvasState;
  timestamp: number;
  processedImageUrl?: string;
  originalImageUrl?: string;
}

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
  updateProcessedImageUrl: (newUrl: string) => void;

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
  undo: () => void;
  redo: () => void;

  // Undo/Redo image data for BrushCanvas
  undoImageData: ImageData | null;
  redoImageData: ImageData | null;
  clearUndoRedoData: () => void;

  // Canvas state persistence
  savedCanvasState: CanvasState | null;
  saveCanvasState: (dataUrl: string, width: number, height: number, formatId: string) => void;
  clearCanvasState: () => void;

  // Unsaved changes tracking
  hasUnsavedChanges: boolean;
  markAsModified: () => void;
  markAsSaved: () => void;

  // Recovery
  hasRecoveryData: boolean;
  applyRecovery: () => void;
  dismissRecovery: () => void;

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
  const [undoImageData, setUndoImageData] = useState<ImageData | null>(null);
  const [redoImageData, setRedoImageData] = useState<ImageData | null>(null);
  const [savedCanvasState, setSavedCanvasState] = useState<CanvasState | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    processImage: processImageHook,
    isProcessing,
    progress,
    processedImage,
    error,
    reset: resetProcessing,
    updateProcessedImageUrl,
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
    pushHistory: pushHistoryHook,
    undo: undoHook,
    redo: redoHook,
    resetHistory,
  } = useCanvasBrush();

  // Check for recovery data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (stored) {
        const data: RecoveryData = JSON.parse(stored);
        // Only consider recovery data less than 24 hours old
        const isRecent = Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && data.canvasState?.dataUrl) {
          setRecoveryData(data);
        } else {
          localStorage.removeItem(LOCALSTORAGE_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load recovery data:", e);
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
  }, []);

  // Auto-save to localStorage when canvas state changes (debounced)
  useEffect(() => {
    if (!savedCanvasState || !hasUnsavedChanges) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const data: RecoveryData = {
          canvasState: savedCanvasState,
          timestamp: Date.now(),
          processedImageUrl: processedImage?.processedImage,
          originalImageUrl: processedImage?.originalImage,
        };
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error("Failed to auto-save:", e);
      }
    }, 2000); // 2 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [savedCanvasState, hasUnsavedChanges, processedImage]);

  const pushHistory = useCallback((imageData: ImageData) => {
    pushHistoryHook(imageData);
    setUndoImageData(null);
    setRedoImageData(null);
  }, [pushHistoryHook]);

  const undo = useCallback(() => {
    const data = undoHook();
    if (data) {
      setUndoImageData(data);
      setRedoImageData(null);
      setHasUnsavedChanges(true);
    }
  }, [undoHook]);

  const redo = useCallback(() => {
    const data = redoHook();
    if (data) {
      setRedoImageData(data);
      setUndoImageData(null);
      setHasUnsavedChanges(true);
    }
  }, [redoHook]);

  const clearUndoRedoData = useCallback(() => {
    setUndoImageData(null);
    setRedoImageData(null);
  }, []);

  const saveCanvasState = useCallback((dataUrl: string, width: number, height: number, formatId: string) => {
    setSavedCanvasState({ dataUrl, width, height, formatId });
  }, []);

  const clearCanvasState = useCallback(() => {
    setSavedCanvasState(null);
    setHasUnsavedChanges(false);
    localStorage.removeItem(LOCALSTORAGE_KEY);
  }, []);

  const markAsModified = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const applyRecovery = useCallback(() => {
    if (recoveryData?.canvasState) {
      setSavedCanvasState(recoveryData.canvasState);
      setRecoveryData(null);
      localStorage.removeItem(LOCALSTORAGE_KEY);
    }
  }, [recoveryData]);

  const dismissRecovery = useCallback(() => {
    setRecoveryData(null);
    localStorage.removeItem(LOCALSTORAGE_KEY);
  }, []);

  const processImage = useCallback(async (file: File) => {
    setOriginalFile(file);
    resetHistory();
    setUndoImageData(null);
    setRedoImageData(null);
    setSavedCanvasState(null);
    setHasUnsavedChanges(false);
    setRecoveryData(null);
    localStorage.removeItem(LOCALSTORAGE_KEY);
    return processImageHook(file);
  }, [processImageHook, resetHistory]);

  const reset = useCallback(() => {
    setOriginalFile(null);
    resetProcessing();
    resetHistory();
    setUndoImageData(null);
    setRedoImageData(null);
    setSavedCanvasState(null);
    setHasUnsavedChanges(false);
    localStorage.removeItem(LOCALSTORAGE_KEY);
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
        updateProcessedImageUrl,
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
        undoImageData,
        redoImageData,
        clearUndoRedoData,
        savedCanvasState,
        saveCanvasState,
        clearCanvasState,
        hasUnsavedChanges,
        markAsModified,
        markAsSaved,
        hasRecoveryData: !!recoveryData,
        applyRecovery,
        dismissRecovery,
        processImage,
        reset,
      }}
    >
      {children}
    </ImageProcessingContext.Provider>
  );
};
