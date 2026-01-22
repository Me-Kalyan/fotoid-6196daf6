import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, User, LogOut, LayoutDashboard, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoBadge } from "@/components/ui/neo-badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useDownloadHistory } from "@/hooks/useDownloadHistory";
import { MobileMenu } from "./MobileMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { isProActive, freeDownloadsRemaining } = useDownloadHistory();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-primary bg-background">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <motion.a
          href="/"
          className="flex items-center gap-2 touch-manipulation"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-10 w-10 items-center justify-center border-2 border-primary bg-brand">
            <Zap className="h-6 w-6 text-brand-foreground" />
          </div>
          <span className="font-heading text-xl font-bold">FotoID</span>
        </motion.a>

        {/* Desktop Navigation */}
        <motion.nav
          className="hidden items-center gap-6 md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <button
            onClick={() => {
              const element = document.getElementById("how-it-works");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="font-heading text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            How it Works
          </button>
          <button
            onClick={() => {
              const element = document.getElementById("pricing");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="font-heading text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </button>
          <button
            onClick={() => {
              const element = document.getElementById("countries");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
            className="font-heading text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
          >
            Countries
          </button>
        </motion.nav>

        {/* Desktop CTA / User Menu */}
        <motion.div
          className="hidden md:flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ThemeToggle />

          {isProActive ? (
            <NeoBadge variant="default" size="sm" className="bg-success text-success-foreground border-success">
              <Crown className="w-3 h-3 mr-1" />
              Pro
            </NeoBadge>
          ) : (
            <NeoBadge variant="highlight" size="sm">
              {freeDownloadsRemaining} Free
            </NeoBadge>
          )}

          {loading ? (
            <div className="h-9 w-20 bg-muted animate-pulse border-2 border-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border-2 border-primary bg-background px-3 py-2 font-heading text-sm font-bold hover:bg-accent transition-colors shadow-brutal hover:shadow-brutal-hover">
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-2 border-primary">
                <DropdownMenuItem
                  onClick={() => navigate('/dashboard')}
                  className="font-heading cursor-pointer"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/editor')}
                  className="font-heading cursor-pointer"
                >
                  Create Photo
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="font-heading cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <NeoButton size="sm" onClick={() => navigate('/auth')}>
              Get Started
            </NeoButton>
          )}
        </motion.div>

        {/* Mobile Menu Toggle */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
      </div>
    </header>
  );
};

export default Header;
