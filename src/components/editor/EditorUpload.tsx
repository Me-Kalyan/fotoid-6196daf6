import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, ImagePlus, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { UploadZone } from "@/components/ui/upload-zone";
import { NeoCard } from "@/components/ui/neo-card";
import { NeoButton } from "@/components/ui/neo-button";
import { CameraCapture } from "./CameraCapture";
import { ImageQualityPreview } from "./ImageQualityPreview";
import { ProcessingErrorFeedback, parseErrorType } from "./ProcessingErrorFeedback";

interface EditorUploadProps {
  onFileSelect: (file: File) => void;
  error?: string | null;
}

export const EditorUpload = ({ onFileSelect, error }: EditorUploadProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Detect mobile device and camera availability
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    const checkCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasCamera(videoDevices.length > 0);
      } catch {
        setHasCamera(false);
      }
    };

    checkMobile();
    checkCamera();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileSelection = (file: File) => {
    // Show quality preview before processing
    setPendingFile(file);
  };

  const handleQualityConfirm = () => {
    if (pendingFile) {
      onFileSelect(pendingFile);
      setPendingFile(null);
    }
  };

  const handleQualityCancel = () => {
    setPendingFile(null);
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    // Show quality preview for camera captures too
    setPendingFile(file);
  };

  return (
    <>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-6 md:mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-3 md:mb-4">
              Upload Your Photo
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
              {isMobile
                ? "Take a photo or upload from your gallery"
                : "Drop a photo or take one with your camera. We'll handle the rest."
              }
            </p>
          </motion.div>

          {/* Error Message - Enhanced feedback */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <ProcessingErrorFeedback
                errorType={parseErrorType(error)}
                errorMessage={error}
              />
            </motion.div>
          )}

          {/* Mobile: Primary camera button */}
          {isMobile && hasCamera && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-4"
            >
              <NeoButton
                size="xl"
                className="w-full min-h-[56px]"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="w-6 h-6 mr-2" />
                Take Photo
              </NeoButton>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UploadZone onFileSelect={handleFileSelection} />
          </motion.div>

          {/* Feature cards - larger touch targets on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
          >
            {/* Camera card - clickable on desktop */}
            <div
              className={hasCamera && !isMobile ? 'cursor-pointer' : ''}
              onClick={hasCamera && !isMobile ? () => setShowCamera(true) : undefined}
            >
              <NeoCard
                className={`p-4 md:p-4 text-center ${hasCamera && !isMobile ? 'hover:shadow-brutal-hover transition-shadow' : ''}`}
                variant="default"
              >
                <div className="w-12 h-12 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-brand/10 border-2 border-primary flex items-center justify-center">
                  <Camera className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-heading font-bold mb-1">Use Camera</h3>
                <p className="text-sm text-muted-foreground">
                  {hasCamera ? "Take a photo directly" : "No camera detected"}
                </p>
              </NeoCard>
            </div>

            <NeoCard className="p-4 md:p-4 text-center" variant="default">
              <div className="w-12 h-12 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-highlight/20 border-2 border-primary flex items-center justify-center">
                <Upload className="w-6 h-6 text-highlight-foreground" />
              </div>
              <h3 className="font-heading font-bold mb-1">Upload File</h3>
              <p className="text-sm text-muted-foreground">
                JPG, PNG up to 10MB
              </p>
            </NeoCard>

            <NeoCard className="p-4 md:p-4 text-center" variant="default">
              <div className="w-12 h-12 md:w-12 md:h-12 mx-auto mb-2 md:mb-3 bg-secondary border-2 border-primary flex items-center justify-center">
                {isMobile ? <Smartphone className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
              </div>
              <h3 className="font-heading font-bold mb-1">
                {isMobile ? "From Gallery" : "Drag & Drop"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isMobile ? "Pick from your photos" : "Drop anywhere on page"}
              </p>
            </NeoCard>
          </motion.div>
        </div>
      </div>

      {/* Image Quality Preview Modal */}
      <AnimatePresence>
        {pendingFile && (
          <ImageQualityPreview
            file={pendingFile}
            onConfirm={handleQualityConfirm}
            onCancel={handleQualityCancel}
          />
        )}
      </AnimatePresence>

      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
