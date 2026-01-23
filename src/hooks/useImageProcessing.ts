import { useState, useCallback, useRef } from "react";

export type ProcessingStep =
  | "idle"
  | "loading-models"
  | "detecting-face"
  | "removing-background"
  | "applying-crop"
  | "complete"
  | "error";

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  chin: { x: number; y: number };
  topOfHead: { x: number; y: number };
  rollAngle: number;
  faceBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ProcessedImage {
  originalImage: string;
  processedImage: string;
  faceLandmarks: FaceLandmarks | null;
  width: number;
  height: number;
}

export interface ProcessingProgress {
  step: ProcessingStep;
  progress: number;
  message: string;
}

export const useImageProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress>({
    step: "idle",
    progress: 0,
    message: "",
  });
  const [processedImage, setProcessedImage] = useState<ProcessedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateProgress = (step: ProcessingStep, progressValue: number, message: string) => {
    setProgress({ step, progress: progressValue, message });
  };

  const processImage = useCallback(async (file: File): Promise<ProcessedImage | null> => {
    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Load and validate image
      updateProgress("loading-models", 10, "Loading AI models...");

      const originalImageUrl = await readFileAsDataURL(file);
      const img = await loadImage(originalImageUrl);

      // Step 2: Detect face landmarks
      updateProgress("detecting-face", 30, "Detecting face landmarks...");

      const faceLandmarks = await detectFaceLandmarks(img);

      if (!faceLandmarks) {
        throw new Error("No face detected in the image. Please upload a photo with a clear, visible face.");
      }

      // Step 3: Remove background (dynamic import to avoid module loading issues)
      updateProgress("removing-background", 50, "Removing background...");

      const { removeBackground } = await import("@imgly/background-removal");

      const blob = await removeBackground(file, {
        model: "isnet",  // Use full-precision model for better quality (fewer artifacts)
        progress: (key, current, total) => {
          const bgProgress = 50 + (current / total) * 30;
          updateProgress("removing-background", bgProgress, `Removing background... ${Math.round((current / total) * 100)}%`);
        },
      });

      const processedImageUrl = URL.createObjectURL(blob);

      // Step 4: Apply crop for passport dimensions
      updateProgress("applying-crop", 90, "Applying passport crop...");

      // For now, we'll return the processed image without additional cropping
      // The cropping will be done in the canvas component based on country specs

      updateProgress("complete", 100, "Processing complete!");

      const result: ProcessedImage = {
        originalImage: originalImageUrl,
        processedImage: processedImageUrl,
        faceLandmarks,
        width: img.width,
        height: img.height,
      };

      setProcessedImage(result);
      setIsProcessing(false);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during processing";
      setError(errorMessage);
      updateProgress("error", 0, errorMessage);
      setIsProcessing(false);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setProgress({ step: "idle", progress: 0, message: "" });
    setProcessedImage(null);
    setError(null);
  }, []);

  const updateProcessedImageUrl = useCallback((newUrl: string) => {
    setProcessedImage((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        processedImage: newUrl,
      };
    });
  }, []);

  return {
    processImage,
    isProcessing,
    progress,
    processedImage,
    error,
    reset,
    updateProcessedImageUrl,
  };
};

// Helper: Read file as data URL
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Helper: Load image from URL
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Face detection using basic canvas analysis
// In production, this would use MediaPipe Face Mesh
async function detectFaceLandmarks(img: HTMLImageElement): Promise<FaceLandmarks | null> {
  // Create a canvas to analyze the image
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  // Simple heuristic face detection based on image dimensions
  // This is a placeholder - MediaPipe integration will provide actual landmarks
  // For now, we estimate face position assuming a centered portrait

  const centerX = img.width / 2;
  const centerY = img.height * 0.4; // Face usually in upper portion

  const faceWidth = img.width * 0.4;
  const faceHeight = img.height * 0.5;

  const eyeY = centerY - faceHeight * 0.1;
  const eyeSpacing = faceWidth * 0.25;

  // Simulate face detection with estimated values
  // These will be replaced with actual MediaPipe landmarks
  const landmarks: FaceLandmarks = {
    leftEye: { x: centerX - eyeSpacing, y: eyeY },
    rightEye: { x: centerX + eyeSpacing, y: eyeY },
    nose: { x: centerX, y: centerY },
    chin: { x: centerX, y: centerY + faceHeight * 0.35 },
    topOfHead: { x: centerX, y: centerY - faceHeight * 0.45 },
    rollAngle: 0, // Would be calculated from eye positions
    faceBox: {
      x: centerX - faceWidth / 2,
      y: centerY - faceHeight * 0.45,
      width: faceWidth,
      height: faceHeight,
    },
  };

  // Basic validation: check if image appears to contain a face-like region
  // In production, MediaPipe would provide this
  const imageData = ctx.getImageData(
    Math.floor(centerX - 50),
    Math.floor(centerY - 50),
    100,
    100
  );

  // Simple skin tone detection heuristic
  let skinTonePixels = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    // Very rough skin tone detection
    if (r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      r - b > 15) {
      skinTonePixels++;
    }
  }

  // If less than 5% skin tone pixels, probably no face
  const skinToneRatio = skinTonePixels / (imageData.data.length / 4);
  if (skinToneRatio < 0.05) {
    return null;
  }

  return landmarks;
}
