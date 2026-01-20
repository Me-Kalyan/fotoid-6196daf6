import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  className = "",
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden border-3 border-primary shadow-brutal select-none touch-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: isDragging ? "grabbing" : "ew-resize" }}
    >
      {/* After Image (Full) */}
      <img
        src={afterImage}
        alt="After"
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <motion.div
        className="absolute top-0 bottom-0 w-1 bg-brand cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        animate={{ boxShadow: isDragging ? "0 0 20px hsl(var(--brand))" : "none" }}
      >
        {/* Handle Grip */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-brand border-3 border-primary rounded-full flex items-center justify-center shadow-brutal">
          <GripVertical className="w-5 h-5 text-brand-foreground" />
        </div>

        {/* Labels */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-6 text-xs font-bold whitespace-nowrap">
          <span className="bg-muted px-2 py-1 border-2 border-primary">BEFORE</span>
          <span className="bg-brand text-brand-foreground px-2 py-1 border-2 border-primary">AFTER</span>
        </div>
      </motion.div>

      {/* Corner markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-brand pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-brand pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-brand pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-brand pointer-events-none" />
    </div>
  );
};
