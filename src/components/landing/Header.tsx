import { motion } from "framer-motion";
import { Zap, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoBadge } from "@/components/ui/neo-badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

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

        {/* CTA / User Menu */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <NeoBadge variant="highlight" size="sm" className="hidden sm:inline-flex">
            2 Free
          </NeoBadge>
          
          {loading ? (
            <div className="h-9 w-20 bg-muted animate-pulse border-2 border-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border-2 border-primary bg-background px-3 py-2 font-heading text-sm font-bold hover:bg-accent transition-colors shadow-brutal hover:shadow-brutal-hover">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-2 border-primary">
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
      </div>
    </header>
  );
};

export default Header;
