import { countryRequirements } from "@/data/countries";
import { motion } from "framer-motion";

export const CountryMarquee = () => {
    // Duplicate items for seamless loop
    const items = [...countryRequirements, ...countryRequirements];

    return (
        <div className="py-6 overflow-hidden bg-secondary/30 border-y-3 border-primary">
            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -50 * countryRequirements.length] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 30,
                        ease: "linear",
                    },
                }}
            >
                {items.map((country, idx) => (
                    <div
                        key={`${country.code}-${idx}`}
                        className="flex items-center gap-2 px-4 py-2 bg-background border-2 border-primary shadow-brutal"
                    >
                        <span className="text-2xl">{country.flag}</span>
                        <span className="font-bold text-sm">{country.name}</span>
                        <span className="text-xs text-muted-foreground">{country.dimensions}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
