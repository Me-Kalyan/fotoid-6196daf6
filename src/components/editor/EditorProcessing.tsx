import { motion } from "framer-motion";
import { Loader2, Cpu, Wand2, ScanFace, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const processingSteps = [
  { icon: Cpu, label: "Initializing AI models...", sublabel: "Loading neural networks" },
  { icon: ScanFace, label: "Detecting face landmarks...", sublabel: "Finding 468 facial points" },
  { icon: Wand2, label: "Removing background...", sublabel: "Pixel-perfect extraction" },
  { icon: Sparkles, label: "Applying final touches...", sublabel: "Optimizing for compliance" },
];

export const EditorProcessing = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % processingSteps.length);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = processingSteps[currentStep].icon;

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
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {processingSteps[currentStep].label}
          </motion.h2>

          <motion.p
            className="text-muted-foreground"
            key={`sub-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {processingSteps[currentStep].sublabel}
          </motion.p>

          {/* Progress Bar */}
          <div className="mt-6 h-4 border-2 border-primary bg-secondary">
            <motion.div
              className="h-full bg-brand"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </div>
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
            &gt; HACKING... 
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
