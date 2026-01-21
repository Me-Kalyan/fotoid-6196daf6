import { motion } from "framer-motion";
import { Lock, LogIn, UserPlus, Sparkles, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";

interface AuthGateProps {
  message?: string;
}

export const AuthGate = ({ message = "Sign in to create your passport photo" }: AuthGateProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <NeoCard className="p-8 text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-brand/10 border-3 border-brand flex items-center justify-center">
            <Lock className="w-8 h-8 text-brand" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-heading font-bold mb-2">
            Sign In Required
          </h1>
          <p className="text-muted-foreground mb-6">
            {message}
          </p>

          {/* Benefits */}
          <div className="mb-8 text-left bg-secondary/50 border-2 border-dashed border-primary/30 p-4">
            <h3 className="font-heading font-bold mb-3 text-sm">
              Why sign in?
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand flex-shrink-0" />
                <span>2 free downloads per device</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Track your download history</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand flex-shrink-0" />
                <span>Unlock Pro features</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link to="/auth?redirect=/editor" className="block">
              <NeoButton variant="default" size="lg" className="w-full">
                <LogIn className="w-5 h-5" />
                Sign In
              </NeoButton>
            </Link>

            <Link to="/auth?mode=signup&redirect=/editor" className="block">
              <NeoButton variant="secondary" size="lg" className="w-full">
                <UserPlus className="w-5 h-5" />
                Create Account
              </NeoButton>
            </Link>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-muted-foreground mt-6">
            🔒 Your photos are processed entirely on your device. We never store your images.
          </p>
        </NeoCard>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
