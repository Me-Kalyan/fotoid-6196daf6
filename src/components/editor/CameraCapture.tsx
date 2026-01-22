import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, SwitchCamera, Zap, Circle } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";

interface CameraCaptureProps {
    onCapture: (file: File) => void;
    onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [isFlashing, setIsFlashing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            // Stop existing stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 1920 },
                    aspectRatio: { ideal: 3 / 4 },
                },
                audio: false,
            });

            setStream(mediaStream);
            setError(null);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsReady(true);
                };
            }
        } catch (err) {
            console.error("Camera error:", err);
            setError("Could not access camera. Please check permissions.");
        }
    }, [facingMode, stream]);

    // Initialize camera on mount
    useEffect(() => {
        startCamera();
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Restart camera when facing mode changes
    useEffect(() => {
        if (stream) {
            startCamera();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    // Toggle camera facing mode
    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    // Capture photo
    const capturePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Flash effect
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 150);

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Mirror for selfie camera
        if (facingMode === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Convert to file
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
                        type: "image/jpeg",
                    });

                    // Stop camera and close
                    stream?.getTracks().forEach(track => track.stop());
                    onCapture(file);
                }
            },
            "image/jpeg",
            0.92
        );
    }, [facingMode, stream, onCapture]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
                <h2 className="text-white font-heading font-bold text-lg">Take Photo</h2>
                <button
                    onClick={() => {
                        stream?.getTracks().forEach(track => track.stop());
                        onClose();
                    }}
                    className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Camera View */}
            <div className="flex-1 relative overflow-hidden">
                {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center">
                        <div>
                            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-bold mb-2">Camera Access Required</p>
                            <p className="text-sm text-white/70">{error}</p>
                            <NeoButton
                                onClick={startCamera}
                                className="mt-4"
                            >
                                Try Again
                            </NeoButton>
                        </div>
                    </div>
                ) : (
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                        />

                        {/* Face guide overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="relative w-64 h-80 border-2 border-white/50 rounded-lg">
                                {/* Corner markers */}
                                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 border-white rounded-tl-lg" />
                                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 border-white rounded-tr-lg" />
                                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 border-white rounded-bl-lg" />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 border-white rounded-br-lg" />

                                {/* Face oval guide */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-44 border-2 border-dashed border-white/40 rounded-[50%_50%_45%_45%]" />
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="absolute bottom-32 left-0 right-0 text-center">
                            <p className="text-white/80 text-sm font-medium px-4">
                                Position your face in the frame • Neutral expression • Look straight ahead
                            </p>
                        </div>
                    </>
                )}

                {/* Flash effect */}
                <AnimatePresence>
                    {isFlashing && (
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white z-20"
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="p-6 bg-black/80 flex items-center justify-center gap-8">
                {/* Switch camera */}
                <motion.button
                    onClick={toggleCamera}
                    className="w-12 h-12 flex items-center justify-center text-white bg-white/20 rounded-full"
                    whileTap={{ scale: 0.9 }}
                >
                    <SwitchCamera className="w-6 h-6" />
                </motion.button>

                {/* Capture button */}
                <motion.button
                    onClick={capturePhoto}
                    disabled={!isReady}
                    className={`w-20 h-20 flex items-center justify-center rounded-full border-4 border-white transition-all ${isReady ? "bg-white" : "bg-white/50"
                        }`}
                    whileTap={{ scale: 0.95 }}
                >
                    <Circle className="w-16 h-16 text-black fill-white" />
                </motion.button>

                {/* Flash toggle placeholder */}
                <motion.button
                    className="w-12 h-12 flex items-center justify-center text-white/50 bg-white/10 rounded-full cursor-not-allowed"
                    title="Flash not available"
                >
                    <Zap className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
        </motion.div>
    );
};
