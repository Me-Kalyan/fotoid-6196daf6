import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, User, LogOut, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NeoButton } from "@/components/ui/neo-button";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Photo Sizes", href: "#photo-sizes" },
];

export const MobileMenu = ({ isOpen, onToggle }: MobileMenuProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const haptic = useHapticFeedback();

  const handleToggle = () => {
    haptic.medium();
    onToggle();
  };

  const handleNavClick = (href: string) => {
    haptic.selection();
    onToggle();
    // Small delay for animation
    setTimeout(() => {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleAuthAction = () => {
    haptic.light();
    onToggle();
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };

  const handleCreatePhoto = () => {
    haptic.success();
    onToggle();
    navigate("/editor");
  };

  return (
    <>
      {/* Hamburger Button */}
      <motion.button
        className="md:hidden flex items-center justify-center w-12 h-12 border-2 border-primary bg-background touch-manipulation"
        onClick={handleToggle}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        style={{ boxShadow: "var(--shadow-brutal)" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-foreground/50 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-[65px] left-0 right-0 bottom-0 z-50 bg-background border-t-2 border-primary overflow-y-auto md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex flex-col p-4 space-y-2">
                {/* User Info Section */}
                {user && (
                  <motion.div
                    className="flex items-center gap-3 p-4 border-2 border-primary bg-accent mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ boxShadow: "var(--shadow-brutal)" }}
                  >
                    <div className="w-12 h-12 border-2 border-primary bg-brand flex items-center justify-center">
                      <User className="w-6 h-6 text-brand-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-bold text-sm truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">Logged in</p>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    className="flex items-center justify-between w-full p-4 border-2 border-primary bg-background font-heading font-bold text-left touch-manipulation active:bg-accent"
                    onClick={() => handleNavClick(item.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * (index + 1) }}
                    whileTap={{ scale: 0.98, x: 2, y: 2 }}
                    style={{ boxShadow: "var(--shadow-brutal)" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                ))}

                {/* Divider */}
                <div className="h-px bg-primary my-4" />

                {/* Action Buttons */}
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {user ? (
                    <>
                      <NeoButton
                        className="w-full h-14 text-base"
                        onClick={handleCreatePhoto}
                      >
                        <Zap className="w-5 h-5" />
                        Create Photo
                      </NeoButton>
                      <NeoButton
                        variant="outline"
                        className="w-full h-14 text-base"
                        onClick={handleAuthAction}
                      >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                      </NeoButton>
                    </>
                  ) : (
                    <NeoButton
                      className="w-full h-14 text-base"
                      onClick={handleAuthAction}
                    >
                      <Zap className="w-5 h-5" />
                      Get Started — 2 Free
                    </NeoButton>
                  )}
                </motion.div>

                {/* Bottom Badge */}
                <motion.div
                  className="mt-6 p-4 border-2 border-primary bg-highlight text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  style={{ boxShadow: "var(--shadow-brutal)" }}
                >
                  <p className="font-heading font-bold text-highlight-foreground">
                    ⚡ AI-Powered Passport Photos
                  </p>
                  <p className="text-sm text-highlight-foreground/80 mt-1">
                    Ready in seconds, not hours
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
