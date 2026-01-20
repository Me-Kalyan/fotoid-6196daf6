import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const countries = [
  { code: "US", flag: "🇺🇸", name: "United States" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "UK", flag: "🇬🇧", name: "United Kingdom" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "CN", flag: "🇨🇳", name: "China" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "PL", flag: "🇵🇱", name: "Poland" },
];

interface CountryMarqueeProps {
  className?: string;
  speed?: number;
  direction?: "left" | "right";
}

const CountryMarquee: React.FC<CountryMarqueeProps> = ({
  className,
  speed = 20,
  direction = "left",
}) => {
  const marqueeContent = countries.map((country) => (
    <span
      key={country.code}
      className="inline-flex items-center gap-2 mx-4 font-heading font-bold text-lg whitespace-nowrap"
    >
      <span className="text-2xl">{country.flag}</span>
      <span>{country.code}</span>
    </span>
  ));

  return (
    <div
      className={cn(
        "overflow-hidden border-y-2 border-primary bg-highlight py-3",
        className
      )}
    >
      <motion.div
        className="flex"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: "linear",
          },
        }}
      >
        {/* Duplicate content for seamless loop */}
        {marqueeContent}
        {marqueeContent}
      </motion.div>
    </div>
  );
};

export { CountryMarquee };
