import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorUpload } from "@/components/editor/EditorUpload";
import { EditorProcessing } from "@/components/editor/EditorProcessing";
import { EditorReview } from "@/components/editor/EditorReview";
import { EditorDownload } from "@/components/editor/EditorDownload";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { AuthGate } from "@/components/editor/AuthGate";
import { ImageProcessingProvider, useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { photoSizes } from "@/data/photoSizes";
import type { PhotoFormat } from "@/components/editor/ControlsPanel";

export type EditorState = "upload" | "processing" | "review" | "download";

const EditorContent = () => {
  const [editorState, setEditorState] = useState<EditorState>("upload");
  
  // Default to standard passport size (35x45mm)
  const defaultSize = photoSizes.find((s) => s.id === "35x45") || photoSizes[0];
  const [selectedFormat, setSelectedFormat] = useState<PhotoFormat>({
    id: defaultSize.id,
    name: defaultSize.name,
    dimensions: defaultSize.dimensions,
    bgColor: "white",
  });
  const [bgColor, setBgColor] = useState<"white" | "grey">("white");

  const { processImage, reset, error } = useImageProcessingContext();

  const handleFileSelect = useCallback(async (file: File) => {
    setEditorState("processing");

    const result = await processImage(file);

    if (result) {
      setEditorState("review");
    } else {
      // If processing failed, go back to upload
      setEditorState("upload");
    }
  }, [processImage]);

  const handleProceedToDownload = () => {
    setEditorState("download");
  };

  const handleBackToReview = () => {
    setEditorState("review");
  };

  const handleStartOver = () => {
    reset();
    setEditorState("upload");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EditorHeader
        editorState={editorState}
        onStartOver={handleStartOver}
      />

      <main className="flex-1 flex">
        <AnimatePresence mode="wait">
          {editorState === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              <EditorUpload onFileSelect={handleFileSelect} error={error} />
            </motion.div>
          )}

          {editorState === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1"
            >
              <EditorProcessing />
            </motion.div>
          )}

          {editorState === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <EditorReview
                selectedFormat={selectedFormat}
                setSelectedFormat={setSelectedFormat}
                bgColor={bgColor}
                setBgColor={setBgColor}
                onProceedToDownload={handleProceedToDownload}
              />
            </motion.div>
          )}

          {editorState === "download" && (
            <motion.div
              key="download"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1"
            >
              <EditorDownload
                selectedFormat={selectedFormat}
                bgColor={bgColor}
                onBack={handleBackToReview}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const Editor = () => {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Require authentication
  if (!user) {
    return <AuthGate message="Sign in to create your passport photo" />;
  }

  return (
    <ImageProcessingProvider>
      <EditorContent />
    </ImageProcessingProvider>
  );
};

export default Editor;
