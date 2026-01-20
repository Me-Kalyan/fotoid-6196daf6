import { motion } from "framer-motion";
import { Upload, Camera, ImagePlus, AlertTriangle } from "lucide-react";
import { UploadZone } from "@/components/ui/upload-zone";
import { NeoCard } from "@/components/ui/neo-card";

interface EditorUploadProps {
  onFileSelect: (file: File) => void;
  error?: string | null;
}

export const EditorUpload = ({ onFileSelect, error }: EditorUploadProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Upload Your Photo
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Drop a photo or take one with your camera. We'll handle the rest — 
            background removal, face centering, and proper sizing.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 border-3 border-destructive bg-destructive/10 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-destructive">Processing Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <UploadZone onFileSelect={onFileSelect} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <NeoCard className="p-4 text-center" variant="default">
            <div className="w-12 h-12 mx-auto mb-3 bg-brand/10 border-2 border-primary flex items-center justify-center">
              <Camera className="w-6 h-6 text-brand" />
            </div>
            <h3 className="font-heading font-bold mb-1">Use Camera</h3>
            <p className="text-sm text-muted-foreground">
              Take a photo directly
            </p>
          </NeoCard>

          <NeoCard className="p-4 text-center" variant="default">
            <div className="w-12 h-12 mx-auto mb-3 bg-highlight/20 border-2 border-primary flex items-center justify-center">
              <Upload className="w-6 h-6 text-highlight-foreground" />
            </div>
            <h3 className="font-heading font-bold mb-1">Upload File</h3>
            <p className="text-sm text-muted-foreground">
              JPG, PNG up to 10MB
            </p>
          </NeoCard>

          <NeoCard className="p-4 text-center" variant="default">
            <div className="w-12 h-12 mx-auto mb-3 bg-secondary border-2 border-primary flex items-center justify-center">
              <ImagePlus className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold mb-1">Drag & Drop</h3>
            <p className="text-sm text-muted-foreground">
              Drop anywhere on page
            </p>
          </NeoCard>
        </motion.div>
      </div>
    </div>
  );
};
