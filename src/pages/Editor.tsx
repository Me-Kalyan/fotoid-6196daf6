import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { countryRequirements } from "@/data/countries";

export type EditorState = "upload" | "processing" | "review" | "download";

export type CountryFormat = {
  code: string;
  name: string;
  dimensions: string;
  bgColor: "white" | "grey" | "blue";
};

const EditorContent = () => {
  const location = useLocation();
  const [editorState, setEditorState] = useState<EditorState>("upload");
  const [selectedCountry, setSelectedCountry] = useState<CountryFormat>({
    code: "US",
    name: "United States",
    dimensions: "2×2 inches",
    bgColor: "white",
  });
  const [bgColor, setBgColor] = useState<"white" | "grey" | "blue">("white");

  const { processImage, reset, processedImage, error } = useImageProcessingContext();

  useEffect(() => {
    const state = location.state as { countryCode?: string };
    if (state?.countryCode) {
      const country = countryRequirements.find(c => c.code === state.countryCode);
      if (country) {
        // Map background color string to our union type if possible
        let initialBg: "white" | "grey" | "blue" = "white";
        const bgLower = country.bgColor.toLowerCase();
        if (bgLower.includes("grey") || bgLower.includes("gray")) initialBg = "grey";
        if (bgLower.includes("blue")) initialBg = "blue";

        setSelectedCountry({
          code: country.code,
          name: country.name,
          dimensions: country.dimensions,
          bgColor: initialBg
        });
        setBgColor(initialBg);
      }
    }
  }, [location.state]);

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
                selectedCountry={selectedCountry}
                setSelectedCountry={setSelectedCountry}
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
                selectedCountry={selectedCountry}
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
