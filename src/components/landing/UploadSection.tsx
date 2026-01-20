import { motion } from "framer-motion";
import { UploadZone } from "@/components/ui/upload-zone";
import { NeoBadge } from "@/components/ui/neo-badge";
import { Globe } from "lucide-react";

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "UK", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
];

const UploadSection = () => {
  const handleFileSelect = (file: File) => {
    console.log("File selected:", file.name);
    // TODO: Navigate to editor with file
  };

  return (
    <section className="border-b-2 border-primary bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-4xl font-bold md:text-5xl">
            Ready to create your photo?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Select your country and upload a photo. That's it.
          </p>
        </motion.div>

        {/* Country Selector */}
        <motion.div
          className="mt-8 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <label className="flex items-center gap-2 font-heading font-bold">
            <Globe className="h-5 w-5" />
            Select Country
          </label>
          <div className="relative w-full max-w-sm">
            <select
              className="w-full appearance-none border-2 border-primary bg-background px-4 py-3 pr-10 font-heading font-bold shadow-brutal focus:outline-none focus:ring-2 focus:ring-brand"
              defaultValue="US"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UploadZone onFileSelect={handleFileSelect} />
        </motion.div>

        {/* Supported Countries Tags */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <span className="text-sm text-muted-foreground mr-2">
            Popular countries:
          </span>
          {countries.slice(0, 5).map((country) => (
            <NeoBadge key={country.code} variant="secondary" size="sm">
              {country.flag} {country.code}
            </NeoBadge>
          ))}
          <NeoBadge variant="outline" size="sm">
            +15 more
          </NeoBadge>
        </motion.div>
      </div>
    </section>
  );
};

export default UploadSection;
