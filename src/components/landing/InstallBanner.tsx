import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share, Plus } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useIsMobile } from "@/hooks/use-mobile";
import { NeoButton } from "@/components/ui/neo-button";
import { triggerHaptic } from "@/hooks/useHapticFeedback";

const InstallBanner = () => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem("install-banner-dismissed") === "true";
  });

  // Only show on mobile devices that can install and haven't dismissed
  if (!isMobile || !canInstall || isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    triggerHaptic("light");
    setIsDismissed(true);
    sessionStorage.setItem("install-banner-dismissed", "true");
  };

  const handleInstall = async () => {
    triggerHaptic("medium");
    if (isIOS) {
      // For iOS, navigate to install page with instructions
      window.location.href = "/install";
    } else {
      const success = await promptInstall();
      if (success) {
        triggerHaptic("success");
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
      >
        <div className="mx-auto max-w-md rounded-2xl border-2 border-foreground bg-background p-4 shadow-[4px_4px_0px_0px_hsl(var(--foreground))]">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
              <Download className="h-6 w-6 text-primary-foreground" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground">Install FotoID</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isIOS ? (
                  <span className="flex items-center gap-1 flex-wrap">
                    Tap <Share className="h-4 w-4 inline" /> then <Plus className="h-4 w-4 inline" /> Add to Home Screen
                  </span>
                ) : (
                  "Get the full app experience on your device"
                )}
              </p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-muted transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Action button */}
          <div className="mt-3">
            <NeoButton
              onClick={handleInstall}
              className="w-full"
              size="sm"
            >
              {isIOS ? "See Instructions" : "Install App"}
            </NeoButton>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallBanner;
