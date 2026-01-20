import { motion } from "framer-motion";
import { Download, Smartphone, Share, Plus, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { NeoButton } from "@/components/ui/neo-button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

const Install = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, isIOS, promptInstall, canInstall } = usePWAInstall();
  const haptic = useHapticFeedback();

  const handleInstall = async () => {
    haptic.medium();
    const success = await promptInstall();
    if (success) {
      haptic.success();
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-success/20 border-3 border-success rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h1 className="font-heading text-2xl font-black mb-2">Already Installed!</h1>
          <p className="text-muted-foreground mb-6">
            FotoID is already installed on your device. Open it from your home screen for the best experience.
          </p>
          <NeoButton onClick={() => navigate("/")} className="w-full">
            <ArrowLeft className="w-5 h-5" />
            Back to App
          </NeoButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-3 border-primary bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-heading font-bold hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <span className="font-heading font-black text-xl">Install App</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Hero */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-brand border-3 border-primary rounded-2xl flex items-center justify-center shadow-brutal">
            <Smartphone className="w-12 h-12 text-brand-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-black mb-3">
            Install FotoID
          </h1>
          <p className="text-muted-foreground">
            Add FotoID to your home screen for instant access and a native app experience.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="grid gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {[
            { icon: "⚡", title: "Instant Access", desc: "Launch from your home screen" },
            { icon: "📶", title: "Works Offline", desc: "Core features work without internet" },
            { icon: "🔔", title: "Fast & Light", desc: "No app store download needed" },
          ].map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-2 border-primary bg-card"
              style={{ boxShadow: "var(--shadow-brutal-sm)" }}
            >
              <span className="text-2xl">{benefit.icon}</span>
              <div>
                <p className="font-heading font-bold">{benefit.title}</p>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Install Instructions */}
        {isInstallable ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NeoButton
              onClick={handleInstall}
              className="w-full h-14 text-lg"
            >
              <Download className="w-6 h-6" />
              Install Now
            </NeoButton>
          </motion.div>
        ) : isIOS ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-4 border-2 border-primary bg-highlight text-center">
              <p className="font-heading font-bold text-highlight-foreground mb-2">
                iOS Installation Steps
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 border-2 border-primary bg-card">
                <div className="w-10 h-10 bg-brand border-2 border-primary flex items-center justify-center shrink-0">
                  <span className="font-heading font-black">1</span>
                </div>
                <div>
                  <p className="font-heading font-bold flex items-center gap-2">
                    Tap the Share button
                    <Share className="w-5 h-5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Find it at the bottom of Safari
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border-2 border-primary bg-card">
                <div className="w-10 h-10 bg-brand border-2 border-primary flex items-center justify-center shrink-0">
                  <span className="font-heading font-black">2</span>
                </div>
                <div>
                  <p className="font-heading font-bold flex items-center gap-2">
                    Tap "Add to Home Screen"
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Scroll down in the share menu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border-2 border-primary bg-card">
                <div className="w-10 h-10 bg-brand border-2 border-primary flex items-center justify-center shrink-0">
                  <span className="font-heading font-black">3</span>
                </div>
                <div>
                  <p className="font-heading font-bold">Tap "Add"</p>
                  <p className="text-sm text-muted-foreground">
                    Confirm to add FotoID to your home screen
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="text-center p-6 border-2 border-primary bg-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-muted-foreground">
              Open this page in Chrome or Safari on your mobile device to install the app.
            </p>
          </motion.div>
        )}

        {/* Skip */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Maybe later
          </button>
        </motion.div>
      </main>
    </div>
  );
};

export default Install;
