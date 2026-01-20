import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { ControlsPanel } from "./ControlsPanel";
import { BrushCanvas } from "./BrushCanvas";
import { CompliancePanel } from "./CompliancePanel";
import { EditorToolbar } from "./EditorToolbar";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { NeoButton } from "@/components/ui/neo-button";
import { Download, ChevronRight, SplitSquareHorizontal, Paintbrush } from "lucide-react";
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
  const [showComparison, setShowComparison] = useState(false);

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

        {/* Center - Canvas or Comparison */}
        <motion.main
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-secondary/30 gap-4"
        >
          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-background border-2 border-primary p-1">
            <motion.button
              onClick={() => setShowComparison(false)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold transition-all ${
                !showComparison
                  ? "bg-brand text-brand-foreground"
                  : "hover:bg-secondary"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <Paintbrush className="w-4 h-4" />
              Edit
            </motion.button>
            <motion.button
              onClick={() => setShowComparison(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold transition-all ${
                showComparison
                  ? "bg-brand text-brand-foreground"
                  : "hover:bg-secondary"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              Compare
            </motion.button>
          </div>

          {showComparison && processedImage?.originalImage && processedImage?.processedImage ? (
            <BeforeAfterSlider
              beforeImage={processedImage.originalImage}
              afterImage={processedImage.processedImage}
              className="w-full max-w-md aspect-[3/4]"
            />
          ) : (
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
          )}
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
