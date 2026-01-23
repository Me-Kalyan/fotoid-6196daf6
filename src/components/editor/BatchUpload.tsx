import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, AlertTriangle, Loader2, Users, ChevronRight, Trash2 } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { NeoBadge } from "@/components/ui/neo-badge";
import { UploadZone } from "@/components/ui/upload-zone";

interface BatchFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "processing" | "complete" | "error";
  error?: string;
  result?: string;
}

interface BatchUploadProps {
  maxFiles?: number;
  onProcessBatch: (files: File[]) => Promise<void>;
  onCancel: () => void;
}

export const BatchUpload = ({
  maxFiles = 10,
  onProcessBatch,
  onCancel,
}: BatchUploadProps) => {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    if (files.length >= maxFiles) return;
    
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const preview = URL.createObjectURL(file);
    
    setFiles(prev => [...prev, {
      id,
      file,
      preview,
      status: "pending",
    }]);
  }, [files.length, maxFiles]);

  const handleMultipleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles).slice(0, maxFiles - files.length);
    
    const newBatchFiles: BatchFile[] = fileArray.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    
    setFiles(prev => [...prev, ...newBatchFiles]);
  }, [files.length, maxFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
        if (file.result) URL.revokeObjectURL(file.result);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(f => {
      URL.revokeObjectURL(f.preview);
      if (f.result) URL.revokeObjectURL(f.result);
    });
    setFiles([]);
  }, [files]);

  const handleStartProcessing = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      await onProcessBatch(files.map(f => f.file));
    } catch (error) {
      console.error("Batch processing error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleMultipleFiles(droppedFiles);
    }
  }, [handleMultipleFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl my-8"
      >
        <NeoCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 border-2 border-brand flex items-center justify-center">
                <Users className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">Batch Processing</h2>
                <p className="text-sm text-muted-foreground">
                  Process multiple photos at once
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-secondary transition-colors"
              aria-label="Close"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload area */}
          {files.length < maxFiles && (
            <div
              className="mb-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <UploadZone onFileSelect={handleFileSelect} />
              <p className="text-center text-xs text-muted-foreground mt-2">
                {files.length} / {maxFiles} photos added
              </p>
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <NeoBadge variant="outline" size="sm">
                  {files.length} photo{files.length !== 1 ? "s" : ""} selected
                </NeoBadge>
                <button
                  onClick={clearAll}
                  className="text-sm text-destructive hover:underline flex items-center gap-1"
                  disabled={isProcessing}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              </div>

              <AnimatePresence>
                {files.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 border-2 ${
                      file.status === "complete"
                        ? "border-success/50 bg-success/5"
                        : file.status === "error"
                        ? "border-destructive/50 bg-destructive/5"
                        : file.status === "processing"
                        ? "border-brand/50 bg-brand/5"
                        : "border-primary bg-background"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-12 h-12 border border-primary overflow-hidden flex-shrink-0">
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {file.status === "pending" && (
                        <span className="text-xs text-muted-foreground">Ready</span>
                      )}
                      {file.status === "processing" && (
                        <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      )}
                      {file.status === "complete" && (
                        <Check className="w-4 h-4 text-success" />
                      )}
                      {file.status === "error" && (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}

                      {!isProcessing && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-destructive/10 transition-colors"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pro tip */}
          <div className="p-3 bg-highlight/10 border-2 border-highlight/30 mb-4">
            <p className="text-sm">
              <strong>💡 Tip:</strong> For best results, use photos with similar lighting and backgrounds.
              Each photo will be processed individually with AI background removal.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <NeoButton 
              variant="outline" 
              onClick={onCancel} 
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </NeoButton>
            <NeoButton
              onClick={handleStartProcessing}
              className="flex-1"
              disabled={files.length === 0 || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Process {files.length} Photo{files.length !== 1 ? "s" : ""}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </NeoButton>
          </div>
        </NeoCard>
      </motion.div>
    </motion.div>
  );
};
