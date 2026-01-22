import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Download, Check } from "lucide-react";

export const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const [modelsReady, setModelsReady] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Check if AI models are cached (simplified check)
        if ('caches' in window) {
            caches.has('ai-models-cache').then((hasCache) => {
                setModelsReady(hasCache);
            });
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    className={`fixed top-16 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-bold ${isOnline
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                >
                    {isOnline ? (
                        <>
                            <Wifi className="w-4 h-4" />
                            <span>You're back online!</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="w-4 h-4" />
                            <span>
                                You're offline.
                                {modelsReady
                                    ? " You can still process photos!"
                                    : " Some features may be limited."}
                            </span>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Compact badge version for header
export const OfflineBadge = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [modelsReady, setModelsReady] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        if ('caches' in window) {
            caches.has('ai-models-cache').then(setModelsReady);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline && !modelsReady) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-mono border-2 ${isOnline && modelsReady
                    ? "border-success bg-success/10 text-success"
                    : !isOnline
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-primary bg-secondary"
                }`}
            title={
                isOnline && modelsReady
                    ? "AI models cached - works offline!"
                    : !isOnline
                        ? "You're offline"
                        : "Online"
            }
        >
            {isOnline ? (
                modelsReady ? (
                    <>
                        <Check className="w-3 h-3" />
                        <span>Offline Ready</span>
                    </>
                ) : (
                    <>
                        <Download className="w-3 h-3 animate-pulse" />
                        <span>Caching...</span>
                    </>
                )
            ) : (
                <>
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                </>
            )}
        </motion.div>
    );
};
