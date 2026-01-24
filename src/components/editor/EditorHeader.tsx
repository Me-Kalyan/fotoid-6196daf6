import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, CloudOff, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import { toast } from "@/hooks/use-toast";
import type { EditorState } from "@/pages/Editor";

interface EditorHeaderProps {
  editorState: EditorState;
  onStartOver: () => void;
  hasUnsavedChanges?: boolean;
}

export const EditorHeader = ({ editorState, onStartOver, hasUnsavedChanges }: EditorHeaderProps) => {
  const { savedCanvasState, markAsSaved } = useImageProcessingContext();
  
  const stateLabels: Record<EditorState, string> = {
    upload: "Upload Photo",
    processing: "Processing...",
    review: "Review & Edit",
    download: "Download",
  };

  const handleSaveNow = () => {
    if (!savedCanvasState) return;
    
    const recoveryData = {
      canvasState: savedCanvasState,
      timestamp: Date.now(),
    };
    localStorage.setItem("fotoid_canvas_recovery", JSON.stringify(recoveryData));
    markAsSaved();
    
    toast({
      title: "Saved!",
      description: "Your edits have been saved locally.",
    });
  };

  return (
    <header className="border-b-3 border-primary bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: -2 }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-heading font-bold text-lg hidden sm:inline">Back</span>
            </motion.div>
          </Link>

          <div className="h-6 w-px bg-primary hidden sm:block" />

          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-brand" />
            <span className="font-heading font-bold text-xl">FotoID</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Unsaved Changes Indicator & Save Button */}
          <AnimatePresence>
            {hasUnsavedChanges && (editorState === "review" || editorState === "download") && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/20 border-2 border-warning text-warning-foreground text-xs font-bold">
                  <CloudOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unsaved</span>
                </div>
                <NeoButton
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveNow}
                  className="gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Save</span>
                </NeoButton>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="px-4 py-2 border-2 border-primary bg-highlight text-highlight-foreground font-heading font-bold text-sm"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            key={editorState}
          >
            {stateLabels[editorState]}
          </motion.div>

          {editorState !== "upload" && (
            <NeoButton
              variant="outline"
              size="sm"
              onClick={onStartOver}
            >
              Start Over
            </NeoButton>
          )}
        </div>
      </div>
    </header>
  );
};