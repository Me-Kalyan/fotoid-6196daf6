import { photoSizes } from "@/data/photoSizes";
import { motion } from "framer-motion";

export const PhotoSizeMarquee = () => {
    // Duplicate items for seamless loop
    const items = [...photoSizes, ...photoSizes];

    return (
        <div className="py-6 overflow-hidden bg-secondary/30 border-y-3 border-primary">
            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -50 * photoSizes.length] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 20,
                        ease: "linear",
                    },
                }}
            >
                {items.map((size, idx) => (
                    <div
                        key={`${size.id}-${idx}`}
                        className="flex items-center gap-2 px-4 py-2 bg-background border-2 border-primary shadow-brutal"
                    >
                        <span className="text-2xl">📷</span>
                        <span className="font-bold text-sm">{size.name}</span>
                        <span className="text-xs text-muted-foreground">{size.dimensions}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// Keep old export name for backwards compatibility
export const CountryMarquee = PhotoSizeMarquee;
