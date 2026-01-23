import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileImage, ChevronRight, Ruler, CheckCircle2 } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { photoSizes, printSheetSizes, type PhotoSize } from "@/data/photoSizes";
import { useNavigate } from "react-router-dom";

export const GlobalDocumentExplorer = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const filteredSizes = photoSizes.filter((size) =>
        size.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        size.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        size.dimensions.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLaunchEditor = (sizeId: string) => {
        navigate("/editor", { state: { selectedSizeId: sizeId } });
    };

    return (
        <div className="py-20 px-4 bg-secondary/30 border-y-3 border-primary">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <motion.h2
                        className="text-3xl md:text-5xl font-heading font-bold mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Photo Size Explorer
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Choose from standard passport sizes or custom formats. All photos are auto-cropped to perfect proportions.
                    </motion.p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search size (e.g. 35x45, 2x2, wallet...)"
                            className="w-full pl-12 pr-4 py-4 bg-background border-3 border-primary shadow-brutal focus:outline-none focus:ring-2 ring-brand font-heading text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {filteredSizes.map((size, index) => (
                            <motion.div
                                key={size.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                            >
                                <NeoCard className="h-full flex flex-col p-5 border-3 border-primary hover:translate-x-[-3px] hover:translate-y-[-3px] transition-transform">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-heading font-bold text-lg">{size.name}</h3>
                                        <FileImage className="w-5 h-5 text-brand" />
                                    </div>

                                    <div className="space-y-3 flex-1">
                                        <div className="p-2 bg-primary/5 border-2 border-primary/10">
                                            <div className="flex items-center gap-2 text-xs font-bold mb-1">
                                                <Ruler className="w-3 h-3 text-brand" />
                                                <span>Dimensions</span>
                                            </div>
                                            <p className="font-mono text-sm">{size.dimensions}</p>
                                        </div>

                                        <div className="text-xs text-muted-foreground">
                                            {size.description}
                                        </div>

                                        <div className="pt-3 mt-auto">
                                            <NeoButton
                                                variant="default"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleLaunchEditor(size.id)}
                                            >
                                                Create Photo
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </NeoButton>
                                        </div>
                                    </div>
                                </NeoCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Print Sheet Sizes Section */}
                <div className="mt-16">
                    <motion.h3
                        className="text-2xl font-heading font-bold text-center mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Print Sheet Sizes
                    </motion.h3>
                    <motion.p
                        className="text-muted-foreground text-center max-w-xl mx-auto mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Download tiled sheets ready for printing at any photo lab or at home.
                    </motion.p>

                    <div className="flex flex-wrap justify-center gap-3">
                        {printSheetSizes.map((sheet) => (
                            <div
                                key={sheet.id}
                                className="px-4 py-2 bg-background border-2 border-primary shadow-brutal text-sm"
                            >
                                <span className="font-bold">{sheet.name}</span>
                                <span className="text-muted-foreground ml-2">({sheet.dimensions})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {filteredSizes.length === 0 && (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-xl text-muted-foreground">No sizes found matching your search.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};