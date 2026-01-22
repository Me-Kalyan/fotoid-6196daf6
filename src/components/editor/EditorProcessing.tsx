import { motion } from "framer-motion";
import { Cpu, Wand2, ScanFace, Sparkles, Crop } from "lucide-react";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import type { ProcessingStep } from "@/hooks/useImageProcessing";
import { PhotoSkeleton, PanelSkeleton } from "@/components/ui/loading-skeleton";
import { ProcessingAnimation } from "./ProcessingAnimation";

const stepConfig: Record<ProcessingStep, { icon: React.ElementType; label: string; sublabel: string }> = {
  idle: { icon: Cpu, label: "Ready", sublabel: "Waiting for image" },
  "loading-models": { icon: Cpu, label: "Initializing AI models...", sublabel: "Loading neural networks (~10MB)" },
  "detecting-face": { icon: ScanFace, label: "Detecting face landmarks...", sublabel: "Finding facial features" },
  "removing-background": { icon: Wand2, label: "Removing background...", sublabel: "AI-powered pixel-perfect extraction" },
  "applying-crop": { icon: Crop, label: "Applying passport crop...", sublabel: "Adjusting to passport specifications" },
  complete: { icon: Sparkles, label: "Processing complete!", sublabel: "Your photo is ready" },
  error: { icon: Cpu, label: "Error occurred", sublabel: "Something went wrong" },
};

export const EditorProcessing = () => {
  const { progress } = useImageProcessingContext();

  const currentStep = stepConfig[progress.step] || stepConfig.idle;

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-8">
      {/* Left Panel Skeleton */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.5, x: 0 }}
        className="hidden lg:block w-72 border-3 border-primary/30 bg-background/50 p-6"
      >
        <PanelSkeleton items={3} />
      </motion.aside>

      {/* Center - Main Processing Card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-lg w-full">
          {/* Processing Status Card */}
          <motion.div
            className="border-3 border-primary bg-background p-8 shadow-brutal-lg mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {/* Animated SVG Illustration */}
            <ProcessingAnimation step={progress.step} progress={progress.progress} />

            {/* Main Text */}
            <motion.h2
              className="text-2xl md:text-3xl font-heading font-bold mb-2 mt-6"
              key={progress.step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {progress.message || currentStep.label}
            </motion.h2>

            <motion.p
              className="text-muted-foreground"
              key={`sub-${progress.step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {currentStep.sublabel}
            </motion.p>

            {/* Progress Bar */}
            <div className="mt-6 h-4 border-2 border-primary bg-secondary overflow-hidden">
              <motion.div
                className="h-full bg-brand"
                initial={{ width: "0%" }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>

            {/* Percentage */}
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              {Math.round(progress.progress)}%
            </p>
          </motion.div>

          {/* Retro Terminal Text */}
          <motion.div
            className="font-mono text-sm text-muted-foreground space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              &gt; PROCESSING...
              <motion.span
                animate={{ opacity: [0, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                _
              </motion.span>
            </motion.p>
            <p className="text-xs">&gt; All processing happens on YOUR device</p>
            <p className="text-xs">&gt; Your photo never leaves your browser</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Photo Preview Skeleton */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.6, x: 0 }}
        className="hidden lg:block w-80 p-6"
      >
        <PhotoSkeleton className="max-w-[200px] mx-auto" />

        {/* Checklist skeleton */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-bold text-muted-foreground/50">Quality Checks</div>
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 p-2 border-2 border-primary/20 bg-muted/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-4 h-4 rounded-full bg-muted-foreground/20" />
              <div className="flex-1 h-3 bg-muted-foreground/10 rounded" />
            </motion.div>
          ))}
        </div>
      </motion.aside>
    </div>
  );
};
