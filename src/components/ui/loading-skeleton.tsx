import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "photo";
}

export const LoadingSkeleton = ({ 
  className, 
  variant = "rectangular" 
}: LoadingSkeletonProps) => {
  const baseClasses = "relative overflow-hidden bg-muted";
  
  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded",
    photo: "aspect-[3/4] w-full",
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/50 to-transparent"
        animate={{ x: ["0%", "200%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

interface PhotoSkeletonProps {
  className?: string;
}

export const PhotoSkeleton = ({ className }: PhotoSkeletonProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Photo placeholder with face silhouette */}
      <div className="aspect-[3/4] w-full border-3 border-primary bg-muted relative overflow-hidden shadow-brutal">
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/40 to-transparent"
          animate={{ x: ["0%", "200%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Face silhouette */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-2/3 relative">
            {/* Head oval */}
            <motion.div 
              className="absolute top-0 left-1/4 right-1/4 h-[60%] rounded-full bg-muted-foreground/10"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Shoulders */}
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[35%] rounded-t-[50%] bg-muted-foreground/10"
              animate={{ opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-brand/50" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-brand/50" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-brand/50" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-brand/50" />
      </div>

      {/* Text skeleton below */}
      <div className="mt-4 space-y-2">
        <LoadingSkeleton variant="text" className="w-3/4 mx-auto" />
        <LoadingSkeleton variant="text" className="w-1/2 mx-auto" />
      </div>
    </div>
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton = ({ className }: CardSkeletonProps) => {
  return (
    <div className={cn("border-3 border-primary bg-background p-6 shadow-brutal", className)}>
      <div className="space-y-4">
        <LoadingSkeleton variant="text" className="w-1/3 h-6" />
        <LoadingSkeleton variant="text" className="w-full" />
        <LoadingSkeleton variant="text" className="w-full" />
        <LoadingSkeleton variant="text" className="w-2/3" />
      </div>
    </div>
  );
};

interface PanelSkeletonProps {
  className?: string;
  items?: number;
}

export const PanelSkeleton = ({ className, items = 4 }: PanelSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <LoadingSkeleton variant="text" className="w-1/2 h-5" />
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <LoadingSkeleton variant="circular" className="w-8 h-8" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" className="w-full" />
            <LoadingSkeleton variant="text" className="w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};
