import { motion } from "framer-motion";
import { Upload, Wand2, Download, Check } from "lucide-react";
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle } from "@/components/ui/neo-card";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload",
    description: "Drop any photo. Selfie? Old photo? We'll make it work.",
    color: "bg-brand",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Magic",
    description: "Background removed. Face centered. All on YOUR device.",
    color: "bg-highlight",
  },
  {
    number: "03",
    icon: Download,
    title: "Download",
    description: "Get print-ready photos for any country. Done in 30 seconds.",
    color: "bg-primary",
  },
];

const HowItWorks = () => {
  return (
    <section className="border-b-2 border-primary bg-secondary px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-4xl font-bold md:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three steps. Zero hassle. No drugstore required.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <NeoCard animated className="h-full bg-background">
                <NeoCardHeader>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-14 w-14 items-center justify-center border-2 border-primary ${step.color}`}
                    >
                      <step.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <span className="font-heading text-4xl font-bold text-muted-foreground/30">
                      {step.number}
                    </span>
                  </div>
                  <NeoCardTitle className="mt-4">{step.title}</NeoCardTitle>
                </NeoCardHeader>
                <NeoCardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </NeoCardContent>
              </NeoCard>
            </motion.div>
          ))}
        </div>

        {/* Compliance Checklist Preview */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <NeoCard className="mx-auto max-w-2xl bg-background">
            <NeoCardHeader>
              <NeoCardTitle className="text-center">
                AI Photo Checklist
              </NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Background Removed",
                  "Head Straight",
                  "Eyes Open",
                  "Proper Lighting",
                  "Face Centered",
                  "Correct Dimensions",
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3 border-2 border-primary bg-highlight/20 px-4 py-2"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  >
                    <div className="flex h-6 w-6 items-center justify-center bg-primary">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-heading font-bold">{item}</span>
                  </motion.div>
                ))}
              </div>
            </NeoCardContent>
          </NeoCard>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
