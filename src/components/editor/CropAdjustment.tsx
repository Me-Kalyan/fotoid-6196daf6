import { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { motion } from "framer-motion";
import { Check, X, RotateCcw, ZoomIn, ZoomOut, Crop, Loader2, RotateCw } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { Slider } from "@/components/ui/slider";

interface CropAdjustmentProps {
  imageUrl: string;
  aspectRatio?: number;
  onConfirm: (cropData: CropData) => void;
  onCancel: () => void;
  isApplying?: boolean;
}

export interface CropData {
  croppedAreaPixels: Area;
  rotation: number;
}

export const CropAdjustment = ({
  imageUrl,
  aspectRatio = 1,
  onConfirm,
  onCancel,
  isApplying = false,
}: CropAdjustmentProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 1));
  
  const handleRotateLeft = () => setRotation(prev => prev - 90);
  const handleRotateRight = () => setRotation(prev => prev + 90);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleConfirm = () => {
    if (croppedAreaPixels) {
      onConfirm({
        croppedAreaPixels,
        rotation,
      });
    }
  };

  return (
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
        className="w-full max-w-lg"
      >
        <NeoCard className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crop className="w-5 h-5 text-brand" />
              <h2 className="font-heading text-xl font-bold">Adjust Position</h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-secondary transition-colors"
              aria-label="Close"
              disabled={isApplying}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground mb-4">
            Drag to reposition, pinch or use slider to zoom. The cropped area will be your final photo.
          </p>

          {/* Crop Container */}
          <div 
            className="relative mx-auto border-3 border-brand overflow-hidden bg-muted"
            style={{ 
              width: "100%",
              height: aspectRatio >= 1 ? 300 : 300 / aspectRatio,
              maxHeight: 400 
            }}
          >
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              objectFit="contain"
              showGrid={true}
              classes={{
                containerClassName: "!bg-muted",
                cropAreaClassName: "!border-brand !border-2",
              }}
              style={{
                cropAreaStyle: {
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                },
              }}
            />
          </div>

          {/* Zoom Slider */}
          <div className="mt-4 flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={([value]) => setZoom(value)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <span className="w-14 text-center text-sm font-mono bg-secondary border border-primary px-2 py-0.5">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Rotation and Reset Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <NeoButton variant="outline" size="sm" onClick={handleZoomOut} title="Zoom out">
              <ZoomOut className="w-4 h-4" />
            </NeoButton>
            <NeoButton variant="outline" size="sm" onClick={handleZoomIn} title="Zoom in">
              <ZoomIn className="w-4 h-4" />
            </NeoButton>
            <div className="w-px h-6 bg-primary mx-1" />
            <NeoButton variant="outline" size="sm" onClick={handleRotateLeft} title="Rotate left 90°">
              <RotateCcw className="w-4 h-4" />
            </NeoButton>
            <NeoButton variant="outline" size="sm" onClick={handleRotateRight} title="Rotate right 90°">
              <RotateCw className="w-4 h-4" />
            </NeoButton>
            <div className="w-px h-6 bg-primary mx-1" />
            <NeoButton variant="outline" size="sm" onClick={handleReset}>
              Reset
            </NeoButton>
          </div>

          {/* Rotation display */}
          {rotation !== 0 && (
            <div className="text-center mt-2 text-sm text-muted-foreground">
              Rotation: {rotation}°
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <NeoButton variant="outline" onClick={onCancel} className="flex-1" disabled={isApplying}>
              Cancel
            </NeoButton>
            <NeoButton 
              onClick={handleConfirm} 
              className="flex-1" 
              disabled={isApplying || !croppedAreaPixels}
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply
                </>
              )}
            </NeoButton>
          </div>
        </NeoCard>
      </motion.div>
    </motion.div>
  );
};
