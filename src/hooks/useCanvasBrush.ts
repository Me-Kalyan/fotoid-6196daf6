import { useState, useCallback, useRef } from "react";

export type BrushTool = "select" | "pan" | "eraser" | "restore";

export interface CanvasHistoryEntry {
  imageData: ImageData;
}

export interface UseCanvasBrushReturn {
  activeTool: BrushTool;
  setActiveTool: (tool: BrushTool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  historyRef: React.MutableRefObject<CanvasHistoryEntry[]>;
  historyIndexRef: React.MutableRefObject<number>;
  pushHistory: (imageData: ImageData) => void;
  undo: () => ImageData | null;
  redo: () => ImageData | null;
  resetHistory: () => void;
}

export const useCanvasBrush = (): UseCanvasBrushReturn => {
  const [activeTool, setActiveTool] = useState<BrushTool>("select");
  const [brushSize, setBrushSize] = useState(20);
  const [zoom, setZoom] = useState(100);
  
  // History for undo/redo
  const historyRef = useRef<CanvasHistoryEntry[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [, forceUpdate] = useState(0); // Force re-render for canUndo/canRedo

  const pushHistory = useCallback((imageData: ImageData) => {
    // Remove any redo history when new action is performed
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add new entry
    historyRef.current.push({ imageData });
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history to 50 entries to prevent memory issues
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
    
    forceUpdate(n => n + 1);
  }, []);

  const undo = useCallback((): ImageData | null => {
    if (historyIndexRef.current <= 0) return null;
    
    historyIndexRef.current--;
    forceUpdate(n => n + 1);
    
    return historyRef.current[historyIndexRef.current].imageData;
  }, []);

  const redo = useCallback((): ImageData | null => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return null;
    
    historyIndexRef.current++;
    forceUpdate(n => n + 1);
    
    return historyRef.current[historyIndexRef.current].imageData;
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
    historyIndexRef.current = -1;
    forceUpdate(n => n + 1);
  }, []);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return {
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    historyRef,
    historyIndexRef,
    pushHistory,
    undo,
    redo,
    resetHistory,
  };
};
