import { motion } from "framer-motion";
import { 
  Eraser, 
  Paintbrush, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut,
  Hand,
  MousePointer2
} from "lucide-react";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import type { BrushTool } from "@/hooks/useCanvasBrush";

interface ToolButton {
  id: BrushTool;
  icon: React.ElementType;
  label: string;
  shortcut: string;
}

const tools: ToolButton[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "pan", icon: Hand, label: "Pan", shortcut: "H" },
  { id: "eraser", icon: Eraser, label: "Eraser", shortcut: "E" },
  { id: "restore", icon: Paintbrush, label: "Restore", shortcut: "R" },
];

export const EditorToolbar = () => {
  const {
    activeTool,
    setActiveTool,
    brushSize,
    setBrushSize,
    zoom,
    setZoom,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useImageProcessingContext();

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  return (
    <div className="border-b-3 border-primary bg-background px-4 py-2">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Tool Selection */}
        <div className="flex items-center gap-1">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`p-2.5 border-2 transition-all ${
                activeTool === tool.id
                  ? "border-brand bg-brand text-brand-foreground shadow-brutal"
                  : "border-primary hover:bg-secondary"
              }`}
              whileTap={{ scale: 0.95 }}
              title={`${tool.label} (${tool.shortcut})`}
            >
              <tool.icon className="w-5 h-5" />
            </motion.button>
          ))}

          {/* Divider */}
          <div className="w-px h-8 bg-primary mx-2" />

          {/* Brush Size (only for eraser/restore) */}
          {(activeTool === "eraser" || activeTool === "restore") && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">Size:</span>
              <input
                type="range"
                min="5"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-brand"
              />
              <span className="text-xs font-mono w-6">{brushSize}</span>
            </div>
          )}
        </div>

        {/* Center: Undo/Redo */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`p-2.5 border-2 border-primary transition-all ${
              canUndo ? "hover:bg-secondary" : "opacity-40 cursor-not-allowed"
            }`}
            whileTap={canUndo ? { scale: 0.95 } : undefined}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </motion.button>

          <motion.button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`p-2.5 border-2 border-primary transition-all ${
              canRedo ? "hover:bg-secondary" : "opacity-40 cursor-not-allowed"
            }`}
            whileTap={canRedo ? { scale: 0.95 } : undefined}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right: Zoom */}
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2.5 border-2 border-primary hover:bg-secondary transition-all"
            whileTap={{ scale: 0.95 }}
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>

          <span className="font-mono text-sm w-12 text-center">{zoom}%</span>

          <motion.button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2.5 border-2 border-primary hover:bg-secondary transition-all"
            whileTap={{ scale: 0.95 }}
            title="Zoom In (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
