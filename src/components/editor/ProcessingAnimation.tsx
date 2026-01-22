import { motion } from "framer-motion";
import type { ProcessingStep } from "@/hooks/useImageProcessing";

interface ProcessingAnimationProps {
    step: ProcessingStep;
    progress: number;
}

// Animated brain/AI icon for loading models
const LoadingModelsAnimation = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Brain outline */}
        <motion.path
            d="M60 20 C30 20 20 50 20 65 C20 90 40 100 60 100 C80 100 100 90 100 65 C100 50 90 20 60 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
        />
        {/* Neural network nodes */}
        {[
            { cx: 40, cy: 45 }, { cx: 60, cy: 35 }, { cx: 80, cy: 45 },
            { cx: 35, cy: 65 }, { cx: 60, cy: 60 }, { cx: 85, cy: 65 },
            { cx: 45, cy: 85 }, { cx: 75, cy: 85 },
        ].map((pos, i) => (
            <motion.circle
                key={i}
                cx={pos.cx}
                cy={pos.cy}
                r="5"
                fill="currentColor"
                initial={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
        ))}
        {/* Connection lines */}
        <motion.g stroke="currentColor" strokeWidth="1.5" opacity={0.4}>
            <line x1="40" y1="45" x2="60" y2="35" />
            <line x1="60" y1="35" x2="80" y2="45" />
            <line x1="40" y1="45" x2="60" y2="60" />
            <line x1="80" y1="45" x2="60" y2="60" />
            <line x1="35" y1="65" x2="60" y2="60" />
            <line x1="85" y1="65" x2="60" y2="60" />
            <line x1="45" y1="85" x2="60" y2="60" />
            <line x1="75" y1="85" x2="60" y2="60" />
        </motion.g>
    </svg>
);

// Scanning face animation
const DetectingFaceAnimation = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Face outline */}
        <ellipse cx="60" cy="55" rx="30" ry="38" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.3} />
        {/* Eyes */}
        <circle cx="48" cy="48" r="4" fill="currentColor" opacity={0.5} />
        <circle cx="72" cy="48" r="4" fill="currentColor" opacity={0.5} />
        {/* Nose */}
        <line x1="60" y1="52" x2="60" y2="65" stroke="currentColor" strokeWidth="2" opacity={0.4} />
        {/* Mouth */}
        <path d="M50 75 Q60 82 70 75" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.4} />

        {/* Scanning line */}
        <motion.line
            x1="25"
            y1="20"
            x2="95"
            y2="20"
            stroke="currentColor"
            strokeWidth="3"
            initial={{ y1: 20, y2: 20 }}
            animate={{ y1: 100, y2: 100 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Detection points appearing */}
        {[
            { cx: 48, cy: 48 }, { cx: 72, cy: 48 },
            { cx: 60, cy: 58 }, { cx: 50, cy: 75 }, { cx: 70, cy: 75 },
            { cx: 38, cy: 55 }, { cx: 82, cy: 55 },
        ].map((pos, i) => (
            <motion.circle
                key={i}
                cx={pos.cx}
                cy={pos.cy}
                r="3"
                fill="hsl(var(--success))"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
                transition={{
                    duration: 0.4,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1.5,
                }}
            />
        ))}
    </svg>
);

// Background removal animation
const RemovingBackgroundAnimation = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Background grid pattern */}
        <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <rect width="5" height="5" fill="currentColor" opacity="0.1" />
                <rect x="5" y="5" width="5" height="5" fill="currentColor" opacity="0.1" />
            </pattern>
        </defs>
        <rect width="120" height="120" fill="url(#grid)" />

        {/* Person silhouette */}
        <motion.path
            d="M60 25 C50 25 45 35 45 42 C45 52 52 58 60 58 C68 58 75 52 75 42 C75 35 70 25 60 25 M40 95 L40 70 C40 62 48 58 60 58 C72 58 80 62 80 70 L80 95"
            fill="currentColor"
            opacity={0.8}
        />

        {/* Eraser wipe effect */}
        <motion.rect
            x="0"
            y="0"
            width="40"
            height="120"
            fill="hsl(var(--background))"
            opacity={0.7}
            initial={{ x: -40 }}
            animate={{ x: 160 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Sparkles */}
        {[
            { x: 30, y: 40 }, { x: 90, y: 50 }, { x: 25, y: 80 }, { x: 95, y: 75 },
        ].map((pos, i) => (
            <motion.text
                key={i}
                x={pos.x}
                y={pos.y}
                fontSize="16"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
            >
                ✨
            </motion.text>
        ))}
    </svg>
);

// Applying crop animation
const ApplyingCropAnimation = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full">
        {/* Photo frame */}
        <rect x="20" y="15" width="80" height="90" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.3} />

        {/* Crop corners animating inward */}
        <motion.g
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        >
            {/* Top-left corner */}
            <path d="M25 35 L25 20 L40 20" fill="none" stroke="currentColor" strokeWidth="3" />
            {/* Top-right corner */}
            <path d="M80 20 L95 20 L95 35" fill="none" stroke="currentColor" strokeWidth="3" />
            {/* Bottom-left corner */}
            <path d="M25 85 L25 100 L40 100" fill="none" stroke="currentColor" strokeWidth="3" />
            {/* Bottom-right corner */}
            <path d="M80 100 L95 100 L95 85" fill="none" stroke="currentColor" strokeWidth="3" />
        </motion.g>

        {/* Person silhouette inside */}
        <ellipse cx="60" cy="45" rx="18" ry="22" fill="currentColor" opacity={0.4} />
        <path d="M40 95 L40 75 C40 65 48 60 60 60 C72 60 80 65 80 75 L80 95" fill="currentColor" opacity={0.4} />

        {/* Resize arrows */}
        <motion.g
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
        >
            <path d="M10 60 L5 55 L5 65 Z" fill="currentColor" />
            <path d="M110 60 L115 55 L115 65 Z" fill="currentColor" />
        </motion.g>
    </svg>
);

// Complete animation
const CompleteAnimation = () => (
    <svg viewBox="0 0 120 120" className="w-full h-full">
        <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
        />
        <motion.path
            d="M35 60 L52 77 L85 44"
            fill="none"
            stroke="hsl(var(--success))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        />
    </svg>
);

export const ProcessingAnimation = ({ step, progress }: ProcessingAnimationProps) => {
    const animations: Record<ProcessingStep, React.ReactNode> = {
        idle: <LoadingModelsAnimation />,
        "loading-models": <LoadingModelsAnimation />,
        "detecting-face": <DetectingFaceAnimation />,
        "removing-background": <RemovingBackgroundAnimation />,
        "applying-crop": <ApplyingCropAnimation />,
        complete: <CompleteAnimation />,
        error: <LoadingModelsAnimation />,
    };

    // Estimated times in seconds for each step
    const stepTimes: Record<ProcessingStep, number> = {
        idle: 0,
        "loading-models": 8,
        "detecting-face": 3,
        "removing-background": 15,
        "applying-crop": 2,
        complete: 0,
        error: 0,
    };

    const getEstimatedTimeRemaining = () => {
        const steps: ProcessingStep[] = ["loading-models", "detecting-face", "removing-background", "applying-crop"];
        const currentIndex = steps.indexOf(step);
        if (currentIndex === -1) return null;

        // Calculate remaining time for current step based on progress
        const currentStepProgress = (progress % 25) / 25; // Each step is ~25%
        const currentStepRemaining = stepTimes[step] * (1 - currentStepProgress);

        // Add remaining steps time
        const remainingStepsTime = steps
            .slice(currentIndex + 1)
            .reduce((sum, s) => sum + stepTimes[s], 0);

        return Math.ceil(currentStepRemaining + remainingStepsTime);
    };

    const timeRemaining = getEstimatedTimeRemaining();

    return (
        <div className="relative">
            <motion.div
                className="w-28 h-28 mx-auto text-brand-foreground bg-brand border-3 border-primary p-4"
                key={step}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
            >
                {animations[step]}
            </motion.div>

            {timeRemaining !== null && timeRemaining > 0 && (
                <motion.p
                    className="text-xs text-muted-foreground mt-2 text-center font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    ~{timeRemaining}s remaining
                </motion.p>
            )}
        </div>
    );
};
