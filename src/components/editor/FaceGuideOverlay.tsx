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

  // Calculate face landmarks as percentages
  const getPosition = (point: { x: number; y: number }) => ({
    left: `${(point.x / canvasWidth) * 100}%`,
    top: `${(point.y / canvasHeight) * 100}%`,
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* SVG Overlay for precise guides */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Rule of thirds grid */}
        <line x1="33.33" y1="0" x2="33.33" y2="100" stroke="hsl(var(--brand))" strokeOpacity="0.2" strokeWidth="0.3" />
        <line x1="66.66" y1="0" x2="66.66" y2="100" stroke="hsl(var(--brand))" strokeOpacity="0.2" strokeWidth="0.3" />
        <line x1="0" y1="33.33" x2="100" y2="33.33" stroke="hsl(var(--brand))" strokeOpacity="0.2" strokeWidth="0.3" />
        <line x1="0" y1="66.66" x2="100" y2="66.66" stroke="hsl(var(--brand))" strokeOpacity="0.2" strokeWidth="0.3" />

        {/* Center crosshair */}
        <line x1="48" y1="50" x2="52" y2="50" stroke="hsl(var(--brand))" strokeOpacity="0.5" strokeWidth="0.4" />
        <line x1="50" y1="48" x2="50" y2="52" stroke="hsl(var(--brand))" strokeOpacity="0.5" strokeWidth="0.4" />

        {/* Eye line guide (should be around 33-40% from top) */}
        <line 
          x1="20" y1="35" x2="80" y2="35" 
          stroke="hsl(var(--success))" 
          strokeOpacity="0.4" 
          strokeWidth="0.3" 
          strokeDasharray="2,1" 
        />
        
        {/* Chin line guide */}
        <line 
          x1="30" y1="80" x2="70" y2="80" 
          stroke="hsl(var(--success))" 
          strokeOpacity="0.3" 
          strokeWidth="0.3" 
          strokeDasharray="2,1" 
        />
      </svg>

      {/* Face oval outline - positioned correctly for passport photos */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="relative"
          style={{ 
            width: "50%", 
            height: "65%",
            marginTop: "-5%",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Outer face boundary */}
          <div 
            className="absolute inset-0 border-2 border-dashed rounded-[50%_50%_45%_45%]"
            style={{ 
              borderColor: "hsl(var(--brand) / 0.35)",
            }}
          />
          
          {/* Head top zone */}
          <div 
            className="absolute -top-[8%] left-[25%] right-[25%] h-[15%] border-t-2 border-l-2 border-r-2 border-dashed rounded-t-full"
            style={{ borderColor: "hsl(var(--muted-foreground) / 0.3)" }}
          />

          {/* Shoulder guides */}
          <div 
            className="absolute -bottom-[12%] left-[-20%] right-[-20%] h-[20%] border-t-2 border-dashed"
            style={{ 
              borderColor: "hsl(var(--muted-foreground) / 0.25)",
              borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            }}
          />
        </motion.div>
      </div>

      {/* Face landmarks visualization */}
      {faceLandmarks && (
        <>
          {/* Left Eye */}
          <motion.div 
            className="absolute w-3 h-3 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              ...getPosition(faceLandmarks.leftEye),
              borderColor: "hsl(var(--success))",
              backgroundColor: "hsl(var(--success) / 0.2)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          />
          
          {/* Right Eye */}
          <motion.div 
            className="absolute w-3 h-3 rounded-full border-2 transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              ...getPosition(faceLandmarks.rightEye),
              borderColor: "hsl(var(--success))",
              backgroundColor: "hsl(var(--success) / 0.2)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.25 }}
          />

          {/* Eye level line connecting eyes */}
          <motion.div
            className="absolute h-px"
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

          {/* Nose */}
          <motion.div 
            className="absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              ...getPosition(faceLandmarks.nose),
              backgroundColor: "hsl(var(--brand) / 0.4)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
          />

          {/* Chin */}
          <motion.div 
            className="absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{ 
              ...getPosition(faceLandmarks.chin),
              backgroundColor: "hsl(var(--brand) / 0.4)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.35 }}
          />

          {/* Face center vertical guide */}
          <motion.div
            className="absolute w-px"
            style={{
              backgroundColor: "hsl(var(--brand) / 0.3)",
              left: getPosition(faceLandmarks.nose).left,
              top: getPosition(faceLandmarks.leftEye).top,
              height: `${parseFloat(getPosition(faceLandmarks.chin).top) - parseFloat(getPosition(faceLandmarks.leftEye).top)}%`,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.4 }}
          />
        </>
      )}

      {/* Labels */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-background/80 border border-primary text-muted-foreground">
          PASSPORT GUIDE
        </span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-0.5 items-end">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success/60" />
          <span className="text-[8px] font-mono text-muted-foreground/70">Eyes</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-px bg-brand/50" />
          <span className="text-[8px] font-mono text-muted-foreground/70">Face zone</span>
        </div>
      </div>
    </div>
  );
};
