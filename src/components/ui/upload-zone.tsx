import * as React from "react";
import { motion } from "framer-motion";
import { Upload, Image } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  className?: string;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  className,
  onFileSelect,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      onFileSelect?.(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect?.(files[0]);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative cursor-pointer border-3 border-dashed border-primary bg-background p-12 transition-colors",
        isDragging && "border-brand bg-brand/5",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
      animate={{
        borderColor: isDragging ? "hsl(var(--brand))" : "hsl(var(--primary))",
      }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <motion.div
          className="flex h-20 w-20 items-center justify-center border-2 border-primary bg-highlight"
          animate={{
            rotate: isDragging ? [0, -5, 5, -5, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
        >
          {isDragging ? (
            <Image className="h-10 w-10" />
          ) : (
            <Upload className="h-10 w-10" />
          )}
        </motion.div>

        <div className="space-y-2">
          <p className="font-heading text-xl font-bold">
            {isDragging ? "Drop it like it's hot!" : "Drag & drop your photo"}
          </p>
          <p className="text-muted-foreground">
            or click to browse • JPG, PNG up to 10MB
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 border-2 border-primary bg-primary px-3 py-1 font-heading text-sm font-bold text-primary-foreground">
            <Upload className="h-4 w-4" />
            Upload Photo
          </span>
        </div>
      </div>

      {/* Animated corner decorations */}
      <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-brand" />
      <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-brand" />
      <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-brand" />
      <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-brand" />
    </motion.div>
  );
};

export { UploadZone };
