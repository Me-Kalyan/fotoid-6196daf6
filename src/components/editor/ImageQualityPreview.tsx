import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle, Image, Maximize2, FileWarning } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";

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
          message: `${img.width} × ${img.height}px — Excellent quality`,
          icon: "resolution",
        });
      } else if (img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT) {
        checks.push({
          id: "resolution",
          label: "Resolution",
          status: "warning",
          message: `${img.width} × ${img.height}px — Acceptable, but may reduce print quality`,
          icon: "resolution",
        });
        hasWarning = true;
      } else {
        checks.push({
          id: "resolution",
          label: "Resolution",
          status: "fail",
          message: `${img.width} × ${img.height}px — Too low. Minimum ${MIN_WIDTH}×${MIN_HEIGHT}px recommended`,
          icon: "resolution",
        });
        hasFail = true;
      }

      // File size check
      const fileSizeMB = file.size / (1024 * 1024);
      if (file.size > MAX_FILE_SIZE) {
        checks.push({
          id: "size",
          label: "File Size",
          status: "fail",
          message: `${fileSizeMB.toFixed(1)}MB — Exceeds 10MB limit`,
          icon: "size",
        });
        hasFail = true;
      } else if (file.size < 50 * 1024) { // Less than 50KB might be too compressed
        checks.push({
          id: "size",
          label: "File Size",
          status: "warning",
          message: `${(file.size / 1024).toFixed(0)}KB — Very small, may be over-compressed`,
          icon: "size",
        });
        hasWarning = true;
      } else {
        checks.push({
          id: "size",
          label: "File Size",
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
          message: `${file.type.split("/")[1].toUpperCase()} — Supported`,
          icon: "format",
        });
      } else {
        checks.push({
          id: "format",
          label: "Format",
          status: "fail",
          message: `${file.type || "Unknown"} — Use JPG, PNG, or WebP`,
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
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-highlight" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const getCheckIcon = (icon: QualityCheck["icon"]) => {
    switch (icon) {
      case "resolution":
        return <Maximize2 className="w-4 h-4" />;
      case "size":
        return <FileWarning className="w-4 h-4" />;
      case "format":
        return <Image className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg"
        >
          <NeoCard className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl font-bold">Image Quality Check</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Preview before processing
              </p>
            </div>

            {/* Image Preview */}
            {preview && (
              <div className="relative aspect-[4/3] mb-6 border-3 border-primary overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                {dimensions && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/90 border-2 border-primary text-xs font-mono">
                    {dimensions.width} × {dimensions.height}
                  </div>
                )}
              </div>
            )}

            {/* Quality Checks */}
            <div className="space-y-3 mb-6">
              {qualityChecks.map((check) => (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-3 border-2 ${
                    check.status === "pass"
                      ? "border-success/50 bg-success/5"
                      : check.status === "warning"
                      ? "border-highlight/50 bg-highlight/5"
                      : "border-destructive/50 bg-destructive/5"
                  }`}
                >
                  {getStatusIcon(check.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getCheckIcon(check.icon)}
                      <span className="font-bold text-sm">{check.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {check.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Warning for poor quality */}
            {overallStatus === "poor" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 border-3 border-destructive bg-destructive/10"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-destructive">Quality Issues Detected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This image may not produce good results. Consider using a higher quality photo.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <NeoButton variant="outline" onClick={onCancel} className="flex-1">
                Choose Different Photo
              </NeoButton>
              <NeoButton
                onClick={onConfirm}
                className="flex-1"
                variant={overallStatus === "poor" ? "outline" : "default"}
              >
                {overallStatus === "poor" ? "Process Anyway" : "Continue"}
              </NeoButton>
            </div>
          </NeoCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
