import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { ControlsPanel } from "./ControlsPanel";
import { BrushCanvas } from "./BrushCanvas";
import { CompliancePanel } from "./CompliancePanel";
import { EditorToolbar } from "./EditorToolbar";
import { NeoButton } from "@/components/ui/neo-button";
import { Download, ChevronRight } from "lucide-react";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import type { CountryFormat } from "@/pages/Editor";

interface EditorReviewProps {
  selectedCountry: CountryFormat;
  setSelectedCountry: (country: CountryFormat) => void;
  bgColor: "white" | "grey" | "blue";
  setBgColor: (color: "white" | "grey" | "blue") => void;
  onProceedToDownload: () => void;
}

export const EditorReview = ({
  selectedCountry,
  setSelectedCountry,
  bgColor,
  setBgColor,
  onProceedToDownload,
}: EditorReviewProps) => {
  const { 
    processedImage, 
    compliance,
    activeTool,
    brushSize,
    zoom,
    setZoom,
    pushHistory,
    undo,
    redo,
  } = useImageProcessingContext();

  // State to trigger undo/redo in canvas
  const [undoImageData, setUndoImageData] = useState<ImageData | null>(null);
  const [redoImageData, setRedoImageData] = useState<ImageData | null>(null);

  const handlePushHistory = useCallback((imageData: ImageData) => {
    pushHistory(imageData);
    setUndoImageData(null);
    setRedoImageData(null);
  }, [pushHistory]);

  // We need to subscribe to undo/redo from context
  const handleUndo = useCallback(() => {
    const data = undo();
    if (data) setUndoImageData(data);
  }, [undo]);

  const handleRedo = useCallback(() => {
    const data = redo();
    if (data) setRedoImageData(data);
  }, [redo]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Controls */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-72 border-b-3 lg:border-b-0 lg:border-r-3 border-primary bg-background p-4 lg:p-6"
        >
          <ControlsPanel
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            bgColor={bgColor}
            setBgColor={setBgColor}
          />
        </motion.aside>

        {/* Center - Canvas */}
        <motion.main
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-secondary/30"
        >
          <BrushCanvas 
            bgColor={bgColor} 
            processedImageUrl={processedImage?.processedImage}
            originalImageUrl={processedImage?.originalImage}
            faceLandmarks={processedImage?.faceLandmarks}
            activeTool={activeTool}
            brushSize={brushSize}
            zoom={zoom}
            setZoom={setZoom}
            onPushHistory={handlePushHistory}
            undoImageData={undoImageData}
            redoImageData={redoImageData}
          />
        </motion.main>

        {/* Right Panel - Compliance Checklist */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-80 border-t-3 lg:border-t-0 lg:border-l-3 border-primary bg-background p-4 lg:p-6"
        >
          <CompliancePanel compliance={compliance} />
          
          {/* Download CTA */}
          <div className="mt-6 pt-6 border-t-2 border-primary">
            <NeoButton
              variant="default"
              size="lg"
              className="w-full"
              onClick={onProceedToDownload}
            >
              <Download className="w-5 h-5" />
              Proceed to Download
              <ChevronRight className="w-5 h-5" />
            </NeoButton>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};
