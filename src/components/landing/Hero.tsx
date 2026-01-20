import { motion } from "framer-motion";
import { Shield, Zap, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoBadge } from "@/components/ui/neo-badge";

const Hero = () => {
  const navigate = useNavigate();

  const handleCreatePhoto = () => {
    navigate("/editor");
  };

  const handleHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden border-b-2 border-primary bg-background px-4 py-16 md:py-24">
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container relative mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          {/* Privacy Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <NeoBadge 
              variant="highlight" 
              size="lg" 
              icon={<Lock className="h-4 w-4" />}
              animated
            >
              100% Client-Side • Your face never leaves your device
            </NeoBadge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="mt-8 font-heading text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Passport photos
            <br />
            <span className="relative">
              made{" "}
              <span className="relative inline-block">
                <span className="relative z-10">easy.</span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-4 w-full bg-brand md:-bottom-2 md:h-6"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  style={{ originX: 0 }}
                />
              </span>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI-powered background removal, processed 100% on your device.{" "}
            <span className="font-bold text-foreground">Privacy first.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <NeoButton size="xl" variant="default" onClick={handleCreatePhoto}>
              <Zap className="h-5 w-5" />
              Create Your Photo
            </NeoButton>
            <NeoButton size="xl" variant="outline" onClick={handleHowItWorks}>
              See How It Works
            </NeoButton>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-brand" />
              <span>No uploads to servers</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-brand" />
              <span>Ready in 30 seconds</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 text-brand" />
              <span>2 free downloads</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
