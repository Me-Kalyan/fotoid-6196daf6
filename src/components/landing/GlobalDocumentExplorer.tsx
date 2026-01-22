import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, ChevronRight, Info, CheckCircle2 } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { countryRequirements, CountryRequirement } from "@/data/countries";
import { useNavigate } from "react-router-dom";

export const GlobalDocumentExplorer = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const filteredCountries = countryRequirements.filter((country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLaunchEditor = (countryCode: string) => {
        // Navigate to editor with country code as state/param
        navigate("/editor", { state: { selectedCountryCode: countryCode } });
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
                        Global Document Explorer
                    </motion.h2>
                    <motion.p
                        className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        Not all passport photos are the same. Explore specific requirements for over 100+ documents worldwide.
                    </motion.p>

                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search country (e.g. United States, UK...)"
                            className="w-full pl-12 pr-4 py-4 bg-background border-3 border-primary shadow-brutal focus:outline-none focus:ring-2 ring-brand font-heading text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredCountries.map((country, index) => (
                            <motion.div
                                key={country.code}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                                <NeoCard className="h-full flex flex-col p-6 border-3 border-primary hover:translate-x-[-4px] hover:translate-y-[-4px] transition-transform">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{country.flag}</span>
                                            <h3 className="font-heading font-bold text-xl">{country.name}</h3>
                                        </div>
                                        <Globe className="w-5 h-5 text-brand" />
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div className="p-3 bg-primary/5 border-2 border-primary/10">
                                            <div className="flex items-center gap-2 text-sm font-bold mb-1">
                                                <Info className="w-4 h-4 text-brand" />
                                                <span>Dimensions</span>
                                            </div>
                                            <p className="font-mono text-sm">{country.dimensions}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Requirements</div>
                                            {country.rules.map((rule, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm">
                                                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                                                    <span>{rule}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 mt-auto">
                                            <div className="text-xs italic text-muted-foreground bg-highlight/10 p-2 border-l-3 border-brand mb-4">
                                                💡 {country.tips}
                                            </div>
                                            <NeoButton
                                                variant="default"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => handleLaunchEditor(country.code)}
                                            >
                                                Create {country.name} Photo
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </NeoButton>
                                        </div>
                                    </div>
                                </NeoCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredCountries.length === 0 && (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-xl text-muted-foreground">No countries found matching your search.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};
