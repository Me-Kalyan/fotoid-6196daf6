import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, Crown, Download, Clock } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { useEffect, useState } from "react";
import Confetti from "@/components/ui/confetti";

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const planType = searchParams.get("plan") || "pro";
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const isPro = planType === "pro";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {showConfetti && <Confetti />}
      
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <NeoCard className="p-8 md:p-10 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 border-3 border-green-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                Payment Successful!
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {isPro 
                  ? "Your Pro subscription is now active" 
                  : "Your single photo credit has been added"}
              </p>
            </motion.div>

            {/* Plan Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 ${
                isPro 
                  ? "bg-brand/10 border-brand text-brand" 
                  : "bg-highlight/20 border-primary"
              }`}>
                {isPro ? (
                  <>
                    <Crown className="w-5 h-5" />
                    <span className="font-bold">Pro Plan Activated</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span className="font-bold">1 Photo Credit Added</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-left bg-secondary/50 border-2 border-dashed border-primary/30 p-4"
            >
              <h3 className="font-heading font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                What you get:
              </h3>
              <ul className="space-y-2 text-sm">
                {isPro ? (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Unlimited downloads for 30 days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>All countries & formats included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>High-resolution exports (300 DPI)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Print sheet layouts (4×6, A4, Letter)</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>1 additional photo download</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>All formats included</span>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Validity Notice for Pro */}
            {isPro && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mb-6 p-3 bg-brand/5 border border-brand/20 text-sm"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Valid for 30 days from now</span>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Link to="/editor" className="block">
                <NeoButton variant="default" size="lg" className="w-full">
                  Create Your Photo
                  <ArrowRight className="w-5 h-5" />
                </NeoButton>
              </Link>

              <Link to="/dashboard" className="block">
                <NeoButton variant="secondary" size="lg" className="w-full">
                  View Dashboard
                </NeoButton>
              </Link>
            </motion.div>

            {/* Receipt Info */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-xs text-muted-foreground mt-6"
            >
              A receipt has been sent to your registered email address.
            </motion.p>
          </NeoCard>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
