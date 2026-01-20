import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const neoBadgeVariants = cva(
  "inline-flex items-center gap-1.5 border-2 border-primary font-heading font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        brand: "bg-brand text-brand-foreground",
        highlight: "bg-highlight text-highlight-foreground",
        outline: "bg-background text-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
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

export interface NeoBadgeProps
  extends VariantProps<typeof neoBadgeVariants> {
  animated?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const NeoBadge = React.forwardRef<HTMLSpanElement, NeoBadgeProps>(
  ({ className, variant, size, shape, animated = false, icon, children }, ref) => {
    const content = (
      <>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </>
    );

    if (animated) {
      return (
        <motion.span
          ref={ref}
          className={cn(neoBadgeVariants({ variant, size, shape, className }))}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {content}
        </motion.span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(neoBadgeVariants({ variant, size, shape, className }))}
      >
        {content}
      </span>
    );
  }
);

NeoBadge.displayName = "NeoBadge";

export { NeoBadge, neoBadgeVariants };
