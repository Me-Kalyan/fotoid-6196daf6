import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Maximize2, FileWarning, Image, X } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";

interface ImageQualityPreviewProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
}

interface QualityCheck {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  message: string;
  icon: "resolution" | "size" | "format";
}

// Minimum recommended resolution for passport photos
const MIN_WIDTH = 600;
const MIN_HEIGHT = 600;
const RECOMMENDED_WIDTH = 1200;
const RECOMMENDED_HEIGHT = 1200;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ImageQualityPreview = ({
  file,
  onConfirm,
  onCancel,
}: ImageQualityPreviewProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [overallStatus, setOverallStatus] = useState<"good" | "acceptable" | "poor">("good");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreview(url);

    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      
      const checks: QualityCheck[] = [];
      let hasWarning = false;
      let hasFail = false;

      // Resolution check
      if (img.width >= RECOMMENDED_WIDTH && img.height >= RECOMMENDED_HEIGHT) {
        checks.push({
          id: "resolution",
          label: "Resolution",
          status: "pass",
          message: `${img.width}×${img.height}px — Excellent`,
          icon: "resolution",
        });
      } else if (img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT) {
        checks.push({
          id: "resolution",
          label: "Resolution",
          status: "warning",
          message: `${img.width}×${img.height}px — May affect print`,
          icon: "resolution",
        });
        hasWarning = true;
      } else {
        checks.push({
          id: "resolution",
          label: "Resolution",
          status: "fail",
          message: `${img.width}×${img.height}px — Too low`,
          icon: "resolution",
        });
        hasFail = true;
      }

      // File size check
      const fileSizeMB = file.size / (1024 * 1024);
      if (file.size > MAX_FILE_SIZE) {
        checks.push({
          id: "size",
          label: "Size",
          status: "fail",
          message: `${fileSizeMB.toFixed(1)}MB — Too large`,
          icon: "size",
        });
        hasFail = true;
      } else if (file.size < 50 * 1024) {
        checks.push({
          id: "size",
          label: "Size",
          status: "warning",
          message: `${(file.size / 1024).toFixed(0)}KB — May be compressed`,
          icon: "size",
        });
        hasWarning = true;
      } else {
        checks.push({
          id: "size",
          label: "Size",
          status: "pass",
          message: `${fileSizeMB.toFixed(1)}MB — Good`,
          icon: "size",
        });
      }

      // Format check
      const validFormats = ["image/jpeg", "image/png", "image/webp"];
      if (validFormats.includes(file.type)) {
        checks.push({
          id: "format",
          label: "Format",
          status: "pass",
          message: `${file.type.split("/")[1].toUpperCase()}`,
          icon: "format",
        });
      } else {
        checks.push({
          id: "format",
          label: "Format",
          status: "fail",
          message: `Unsupported`,
          icon: "format",
        });
        hasFail = true;
      }

      setQualityChecks(checks);
      setOverallStatus(hasFail ? "poor" : hasWarning ? "acceptable" : "good");
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const getStatusIcon = (status: QualityCheck["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-highlight" />;
      case "fail":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getCheckIcon = (icon: QualityCheck["icon"]) => {
    switch (icon) {
      case "resolution":
        return <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />;
      case "size":
        return <FileWarning className="w-3.5 h-3.5 text-muted-foreground" />;
      case "format":
        return <Image className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBorderClass = (status: QualityCheck["status"]) => {
    switch (status) {
      case "pass":
        return "border-success/40 bg-success/5";
      case "warning":
        return "border-highlight/40 bg-highlight/5";
      case "fail":
        return "border-destructive/40 bg-destructive/5";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl border-3 border-primary bg-card shadow-brutal"
        >
          {/* Compact Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-primary bg-secondary/30">
            <div>
              <h2 className="font-heading text-lg font-bold">Quality Check</h2>
              <p className="text-xs text-muted-foreground">Review before processing</p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 border-2 border-primary hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Landscape Layout: Image Left, Info Right */}
          <div className="flex flex-col sm:flex-row">
            {/* Image Preview - Left Side */}
            {preview && (
              <div className="relative sm:w-1/2 aspect-square sm:aspect-auto bg-muted border-b-2 sm:border-b-0 sm:border-r-2 border-primary">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain p-2"
                  style={{ maxHeight: "280px" }}
                />
                {dimensions && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-background/95 border-2 border-primary text-xs font-mono">
                    {dimensions.width}×{dimensions.height}
                  </div>
                )}
              </div>
            )}

            {/* Info Panel - Right Side */}
            <div className="flex-1 p-4 flex flex-col justify-between min-h-[200px] sm:min-h-[280px]">
              {/* Quality Checks - Compact Grid */}
              <div className="space-y-2">
                {qualityChecks.map((check) => (
                  <motion.div
                    key={check.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-2 px-3 py-2 border-2 ${getStatusBorderClass(check.status)}`}
                  >
                    {getStatusIcon(check.status)}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getCheckIcon(check.icon)}
                      <span className="font-bold text-sm">{check.label}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {check.message}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Compact Warning */}
                {overallStatus === "poor" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-destructive bg-destructive/10 mt-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive font-medium">
                      Low quality may affect results
                    </p>
                  </motion.div>
                )}

                {overallStatus === "good" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2 border-2 border-success bg-success/10 mt-3"
                  >
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-xs text-success font-medium">
                      Image quality looks great!
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <NeoButton
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Change Photo
                </NeoButton>
                <NeoButton
                  size="sm"
                  onClick={onConfirm}
                  className="flex-1"
                  variant={overallStatus === "poor" ? "outline" : "default"}
                >
                  {overallStatus === "poor" ? "Continue Anyway" : "Process"}
                </NeoButton>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
