import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

const neoButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-primary",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-foreground hover:bg-brand/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "bg-background text-foreground hover:bg-accent",
        ghost: "border-transparent hover:bg-accent hover:border-primary",
        highlight: "bg-highlight text-highlight-foreground hover:bg-highlight/90",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-14 px-8 py-4 text-base",
        xl: "h-16 px-10 py-5 text-lg",
        icon: "h-12 w-12",
      },
      shape: {
        sharp: "rounded-none",
        pill: "rounded-pill",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "sharp",
    },
  }
);

export interface NeoButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof neoButtonVariants> {
  children: React.ReactNode;
  asChild?: boolean;
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant, size, shape, children, ...props }, ref) => {
    return (
      <motion.button
        className={cn(neoButtonVariants({ variant, size, shape, className }))}
        ref={ref}
        initial={{ boxShadow: "var(--shadow-brutal)" }}
        whileHover={{ 
          boxShadow: "var(--shadow-brutal-hover)",
          x: 2,
          y: 2,
        }}
        whileTap={{ 
          boxShadow: "0px 0px 0px 0px hsl(0 0% 0%)",
          x: 4,
          y: 4,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

NeoButton.displayName = "NeoButton";

export { NeoButton, neoButtonVariants };
