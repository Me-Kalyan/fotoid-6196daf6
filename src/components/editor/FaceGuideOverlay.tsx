import { motion } from "framer-motion";
import type { FaceLandmarks } from "@/hooks/useImageProcessing";

interface FaceGuideOverlayProps {
  faceLandmarks?: FaceLandmarks | null;
  showGuides: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

export const FaceGuideOverlay = ({
  faceLandmarks,
  showGuides,
  canvasWidth,
  canvasHeight,
}: FaceGuideOverlayProps) => {
  if (!showGuides) return null;

  // Calculate center points and dimensions based on canvas size
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Passport standard: Face should be ~70% of photo height for EU/UK, ~50-69% for US
  // We'll aim for a target face height that adapts well
  const faceHeight = canvasHeight * 0.65;
  const faceWidth = faceHeight * 0.75; // Average face aspect ratio

  // Helper for landmarks positioning
  const getPosition = (point: { x: number; y: number }) => ({
    left: `${(point.x / canvasWidth) * 100}%`,
    top: `${(point.y / canvasHeight) * 100}%`,
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* SVG Overlay for professional passport photo guides */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        preserveAspectRatio="none"
      >
        {/* Head position zone - center vertical line */}
        <line
          x1={centerX} y1={canvasHeight * 0.05}
          x2={centerX} y2={canvasHeight * 0.9}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.15"
          strokeWidth={canvasWidth * 0.003}
          strokeDasharray="2,2"
        />

        {/* Eye level line (typically ~50-60% from bottom/top) */}
        <line
          x1={canvasWidth * 0.15} y1={canvasHeight * 0.45}
          x2={canvasWidth * 0.85} y2={canvasHeight * 0.45}
          stroke="hsl(var(--success))"
          strokeOpacity="0.4"
          strokeWidth={canvasWidth * 0.004}
          strokeDasharray="3,1.5"
        />

        {/* Chin level line */}
        <line
          x1={canvasWidth * 0.25} y1={canvasHeight * 0.8}
          x2={canvasWidth * 0.75} y2={canvasHeight * 0.8}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.25"
          strokeWidth={canvasWidth * 0.003}
          strokeDasharray="2,1"
        />

        {/* Top of head zone marker */}
        <line
          x1={canvasWidth * 0.3} y1={canvasHeight * 0.15}
          x2={canvasWidth * 0.70} y2={canvasHeight * 0.15}
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.25"
          strokeWidth={canvasWidth * 0.003}
          strokeDasharray="2,1"
        />

        {/* Face oval - using calculated face dimensions */}
        <ellipse
          cx={centerX}
          cy={centerY * 0.95} // Offset slightly up for typical head position
          rx={faceWidth / 2}
          ry={faceHeight / 2}
          fill="none"
          stroke="hsl(var(--brand))"
          strokeOpacity="0.35"
          strokeWidth={canvasWidth * 0.008}
          strokeDasharray="4,2"
        />

        {/* Head top curve (hair/crown area) */}
        <path
          d={`M ${canvasWidth * 0.28} ${canvasHeight * 0.25} Q ${centerX} ${canvasHeight * 0.08}, ${canvasWidth * 0.72} ${canvasHeight * 0.25}`}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.2"
          strokeWidth={canvasWidth * 0.005}
          strokeDasharray="2,1"
        />

        {/* Shoulder guide curves */}
        <path
          d={`M ${canvasWidth * 0.1} ${canvasHeight * 0.95} Q ${canvasWidth * 0.25} ${canvasHeight * 0.88}, ${canvasWidth * 0.35} ${canvasHeight * 0.92} Q ${centerX} ${canvasHeight * 0.98}, ${canvasWidth * 0.65} ${canvasHeight * 0.92} Q ${canvasWidth * 0.75} ${canvasHeight * 0.88}, ${canvasWidth * 0.9} ${canvasHeight * 0.95}`}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity="0.2"
          strokeWidth={canvasWidth * 0.005}
          strokeDasharray="2,1"
        />

        {/* Face height zone indicators */}
        <rect
          x={canvasWidth * 0.03} y={canvasHeight * 0.15}
          width={canvasWidth * 0.02} height={canvasHeight * 0.65}
          fill="hsl(var(--brand))"
          fillOpacity="0.15"
        />
        <line x1={canvasWidth * 0.02} y1={canvasHeight * 0.15} x2={canvasWidth * 0.07} y2={canvasHeight * 0.15} stroke="hsl(var(--brand))" strokeOpacity="0.35" strokeWidth={canvasWidth * 0.004} />
        <line x1={canvasWidth * 0.02} y1={canvasHeight * 0.8} x2={canvasWidth * 0.07} y2={canvasHeight * 0.8} stroke="hsl(var(--brand))" strokeOpacity="0.35" strokeWidth={canvasWidth * 0.004} />
      </svg>

      {/* Face landmarks visualization */}
      {faceLandmarks && (
        <>
          {/* Left Eye */}
          <motion.div
            className="absolute w-2.5 h-2.5 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              ...getPosition(faceLandmarks.leftEye),
              borderColor: "hsl(var(--success))",
              backgroundColor: "hsl(var(--success) / 0.3)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          />

          {/* Right Eye */}
          <motion.div
            className="absolute w-2.5 h-2.5 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              ...getPosition(faceLandmarks.rightEye),
              borderColor: "hsl(var(--success))",
              backgroundColor: "hsl(var(--success) / 0.3)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.25 }}
          />

          {/* Eye level line connecting eyes */}
          <motion.div
            className="absolute h-0.5"
            style={{
              backgroundColor: "hsl(var(--success) / 0.5)",
              left: getPosition(faceLandmarks.leftEye).left,
              right: `${100 - parseFloat(getPosition(faceLandmarks.rightEye).left)}%`,
              top: getPosition(faceLandmarks.leftEye).top,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 }}
          />

          {/* Nose marker */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              ...getPosition(faceLandmarks.nose),
              backgroundColor: "hsl(var(--brand) / 0.5)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          />

          {/* Chin marker */}
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              ...getPosition(faceLandmarks.chin),
              backgroundColor: "hsl(var(--brand) / 0.5)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.35 }}
          />
        </>
      )}

      {/* Legend - compact */}
      <div className="absolute bottom-1 right-1 flex flex-col gap-0.5 items-end bg-background/70 px-1.5 py-1 rounded">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[7px] font-mono text-muted-foreground">Eyes</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-0.5 rounded bg-brand/50" />
          <span className="text-[7px] font-mono text-muted-foreground">Face zone</span>
        </div>
      </div>
    </div>
  );
};
