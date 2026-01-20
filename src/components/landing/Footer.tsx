import { motion } from "framer-motion";
import { Shield, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t-2 border-primary bg-primary px-4 py-12 text-primary-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.h3
              className="font-heading text-3xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              FotoID
            </motion.h3>
            <p className="mt-3 max-w-sm text-primary-foreground/80">
              The anti-boring passport photo tool. Instant. Private. And actually fun to use.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">100% Client-Side Processing</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-bold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground hover:underline">
                  How it Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground hover:underline">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground hover:underline">
                  Supported Countries
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-bold">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
              <li>
                <a href="#" className="hover:text-primary-foreground hover:underline">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground hover:underline">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-foreground hover:underline">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/20 pt-8 md:flex-row">
          <p className="text-sm text-primary-foreground/60">
            © 2025 FotoID. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-primary-foreground/60">
            Made with <Heart className="h-4 w-4 text-brand" fill="currentColor" /> for travelers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
