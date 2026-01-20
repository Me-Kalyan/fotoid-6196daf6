import { motion } from "framer-motion";
import { Cpu, Wand2, ScanFace, Sparkles, Crop } from "lucide-react";
import { useImageProcessingContext } from "@/contexts/ImageProcessingContext";
import type { ProcessingStep } from "@/hooks/useImageProcessing";

const stepConfig: Record<ProcessingStep, { icon: React.ElementType; label: string; sublabel: string }> = {
  idle: { icon: Cpu, label: "Ready", sublabel: "Waiting for image" },
  "loading-models": { icon: Cpu, label: "Initializing AI models...", sublabel: "Loading neural networks (~10MB)" },
  "detecting-face": { icon: ScanFace, label: "Detecting face landmarks...", sublabel: "Finding 468 facial points" },
  "removing-background": { icon: Wand2, label: "Removing background...", sublabel: "Pixel-perfect extraction" },
  "applying-crop": { icon: Crop, label: "Applying passport crop...", sublabel: "Adjusting size and position" },
  complete: { icon: Sparkles, label: "Processing complete!", sublabel: "Your photo is ready" },
  error: { icon: Cpu, label: "Error occurred", sublabel: "Something went wrong" },
};

export const EditorProcessing = () => {
  const { progress } = useImageProcessingContext();
  
  const currentStep = stepConfig[progress.step] || stepConfig.idle;
  const CurrentIcon = currentStep.icon;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        {/* Retro Terminal Style Box */}
        <motion.div
          className="border-3 border-primary bg-background p-8 shadow-brutal-lg mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {/* Animated Icon */}
          <motion.div
            className="w-24 h-24 mx-auto mb-6 bg-brand border-3 border-primary flex items-center justify-center"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.02, 0.98, 1],
            }}
            transition={{ 
              duration: 0.5, 
              repeat: Infinity,
              repeatType: "loop",
            }}
          >
            <CurrentIcon className="w-12 h-12 text-brand-foreground" />
          </motion.div>

          {/* Main Text */}
          <motion.h2
            className="text-2xl md:text-3xl font-heading font-bold mb-2"
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
  );
};
