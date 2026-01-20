import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EditorUpload } from "@/components/editor/EditorUpload";
import { EditorProcessing } from "@/components/editor/EditorProcessing";
import { EditorReview } from "@/components/editor/EditorReview";
import { EditorDownload } from "@/components/editor/EditorDownload";
import { EditorHeader } from "@/components/editor/EditorHeader";

export type EditorState = "upload" | "processing" | "review" | "download";

export type CountryFormat = {
  code: string;
  name: string;
  dimensions: string;
  bgColor: "white" | "grey" | "blue";
};

const Editor = () => {
  const [editorState, setEditorState] = useState<EditorState>("upload");
  const [selectedCountry, setSelectedCountry] = useState<CountryFormat>({
    code: "US",
    name: "United States",
    dimensions: "2×2 inches",
    bgColor: "white",
  });
  const [bgColor, setBgColor] = useState<"white" | "grey" | "blue">("white");

  // Mock file for demo purposes
  const handleFileSelect = (file: File) => {
    console.log("File selected:", file.name);
    setEditorState("processing");
    // Simulate processing time
    setTimeout(() => {
      setEditorState("review");
    }, 3000);
  };

  const handleProceedToDownload = () => {
    setEditorState("download");
  };

  const handleBackToReview = () => {
    setEditorState("review");
  };

  const handleStartOver = () => {
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
              <EditorUpload onFileSelect={handleFileSelect} />
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
                onBack={handleBackToReview}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Editor;
