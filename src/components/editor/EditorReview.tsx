import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { ControlsPanel, type PhotoFormat } from "./ControlsPanel";
import { BrushCanvas } from "./BrushCanvas";
import { CompliancePanel } from "./CompliancePanel";
import { EditorToolbar } from "./EditorToolbar";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { CropAdjustment, type CropData } from "./CropAdjustment";
import { NeoButton } from "@/components/ui/neo-button";
import { Download, ChevronRight, SplitSquareHorizontal, Paintbrush, Crop } from "lucide-react";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface EditorReviewProps {
  selectedFormat: PhotoFormat;
  setSelectedFormat: (format: PhotoFormat) => void;
  bgColor: "white" | "grey";
  setBgColor: (color: "white" | "grey") => void;
  onProceedToDownload: () => void;
}

export const EditorReview = ({
  selectedFormat,
  setSelectedFormat,
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
    undoImageData,
    redoImageData,
  } = useImageProcessingContext();

  const [showComparison, setShowComparison] = useState(false);
  const [showCropAdjustment, setShowCropAdjustment] = useState(false);

  const handlePushHistory = useCallback((imageData: ImageData) => {
    pushHistory(imageData);
  }, [pushHistory]);

  const handleCropConfirm = useCallback((cropData: CropData) => {
    // For now, we log the crop data - in a full implementation,
    // this would apply the crop transformation to the image
    console.log("Crop applied:", cropData);
    setShowCropAdjustment(false);
  }, []);

  // Calculate aspect ratio from format dimensions
  const getAspectRatio = () => {
    const dims = selectedFormat.dimensions.match(/(\d+)×(\d+)/);
    if (dims) return parseInt(dims[1]) / parseInt(dims[2]);
    return 0.8; // default passport ratio
  };

  // Keyboard shortcuts for undo/redo and zoom
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onZoomIn: () => setZoom(Math.min(200, zoom + 10)),
    onZoomOut: () => setZoom(Math.max(50, zoom - 10)),
    onResetView: () => setZoom(100),
    enabled: !showComparison,
  });

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
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
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
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold transition-all ${!showComparison
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
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-bold transition-all ${showComparison
                ? "bg-brand text-brand-foreground"
                : "hover:bg-secondary"
                }`}
              whileTap={{ scale: 0.95 }}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              Compare
            </motion.button>
            <motion.button
              onClick={() => setShowCropAdjustment(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold hover:bg-secondary transition-all"
              whileTap={{ scale: 0.95 }}
              title="Adjust crop position"
            >
              <Crop className="w-4 h-4" />
              Crop
            </motion.button>
          </div>

          {showComparison && processedImage?.originalImage && processedImage?.processedImage ? (
            <div
              className="w-full max-w-md overflow-hidden"
              style={{
                aspectRatio: (() => {
                  const dims = selectedFormat.dimensions.match(/(\d+)×(\d+)/);
                  if (dims) return `${dims[1]}/${dims[2]}`;
                  return "3/4";
                })()
              }}
            >
              <BeforeAfterSlider
                beforeImage={processedImage.originalImage}
                afterImage={processedImage.processedImage}
                className="w-full h-full"
              />
            </div>
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
              selectedFormat={selectedFormat}
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

      {/* Crop Adjustment Modal */}
      <AnimatePresence>
        {showCropAdjustment && processedImage?.processedImage && (
          <CropAdjustment
            imageUrl={processedImage.processedImage}
            aspectRatio={getAspectRatio()}
            onConfirm={handleCropConfirm}
            onCancel={() => setShowCropAdjustment(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
