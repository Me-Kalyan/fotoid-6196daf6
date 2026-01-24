import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";

interface RecoveryBannerProps {
  show: boolean;
  onRestore: () => void;
  onDismiss: () => void;
}

export const RecoveryBanner = ({ show, onRestore, onDismiss }: RecoveryBannerProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-brand border-b-3 border-primary"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-brand-foreground">
              <RotateCcw className="w-5 h-5" />
              <span className="font-bold text-sm">
                Unsaved edits found from your last session
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <NeoButton
                variant="outline"
                size="sm"
                onClick={onRestore}
                className="bg-background text-foreground border-background hover:bg-secondary"
              >
                Restore
              </NeoButton>
              <button
                onClick={onDismiss}
                className="p-1.5 hover:bg-brand-foreground/10 rounded transition-colors"
                aria-label="Dismiss recovery"
              >
                <X className="w-4 h-4 text-brand-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
