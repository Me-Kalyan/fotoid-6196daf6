import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoBadge } from "@/components/ui/neo-badge";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary bg-background">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex h-10 w-10 items-center justify-center border-2 border-primary bg-brand">
            <Zap className="h-6 w-6 text-brand-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">PassportPop</span>
        </motion.a>

        {/* Navigation */}
        <motion.nav
          className="hidden items-center gap-6 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <a
            href="#how-it-works"
            className="font-heading text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </a>
          <a
            href="#pricing"
            className="font-heading text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </a>
          <a
            href="#countries"
            className="font-heading text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Countries
          </a>
        </motion.nav>

        {/* CTA */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <NeoBadge variant="highlight" size="sm" className="hidden sm:inline-flex">
            2 Free
          </NeoBadge>
          <NeoButton size="sm">
            Get Started
          </NeoButton>
        </motion.div>
      </div>
    </header>
  );
};

export default Header;
