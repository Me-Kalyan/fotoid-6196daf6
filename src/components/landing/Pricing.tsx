import { motion } from "framer-motion";
import { Check, Zap, Crown, Loader2 } from "lucide-react";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle, NeoCardDescription, NeoCardFooter } from "@/components/ui/neo-card";
import { NeoBadge } from "@/components/ui/neo-badge";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "",
    description: "Perfect for a quick passport photo",
    features: [
      "2 free downloads",
      "All countries supported",
      "Background removal",
      "Print-ready layouts",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "₹99",
    period: "/month",
    description: "For frequent travelers & photographers",
    features: [
      "Unlimited downloads",
      "Priority processing",
      "Custom background colors",
      "Bulk photo export",
      "No watermarks ever",
    ],
    cta: "Go Pro",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "Single",
    price: "₹29",
    period: "/download",
    description: "Just need one more photo?",
    features: [
      "1 download",
      "All countries supported",
      "Background removal",
      "Print-ready layouts",
    ],
    cta: "Buy Now",
    variant: "outline" as const,
    popular: false,
  },
];

const Pricing = () => {
  const { initiatePayment, isLoading } = useRazorpay();
  const navigate = useNavigate();

  const handlePlanClick = async (planName: string) => {
    if (planName === "Free") {
      // Scroll to upload section or navigate
      document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (planName === "Pro") {
      await initiatePayment("pro");
    } else if (planName === "Single") {
      await initiatePayment("single");
    }
  };

  return (
    <section className="border-b-2 border-primary bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <NeoBadge variant="highlight" size="lg" className="mb-4">
            Simple Pricing
          </NeoBadge>
          <h2 className="font-heading text-4xl font-bold md:text-5xl">
            Start free. Pay if you love it.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No hidden fees. No subscriptions required. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={plan.popular ? "md:-mt-4 md:mb-4" : ""}
            >
              <NeoCard
                animated
                className={`relative h-full ${
                  plan.popular ? "border-brand border-3" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <NeoBadge variant="brand" icon={<Crown className="h-3 w-3" />}>
                      Most Popular
                    </NeoBadge>
                  </div>
                )}

                <NeoCardHeader className={plan.popular ? "pt-6" : ""}>
                  <NeoCardTitle className="flex items-center gap-2">
                    {plan.name}
                  </NeoCardTitle>
                  <div className="mt-4">
                    <span className="font-heading text-5xl font-bold">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <NeoCardDescription className="mt-2">
                    {plan.description}
                  </NeoCardDescription>
                </NeoCardHeader>

                <NeoCardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <div className="flex h-5 w-5 items-center justify-center bg-highlight border border-primary">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </NeoCardContent>

                <NeoCardFooter>
                  <NeoButton
                    variant={plan.variant}
                    className="w-full"
                    size="lg"
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={isLoading && plan.name !== "Free"}
                  >
                    {isLoading && plan.name !== "Free" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        {plan.popular && <Zap className="h-4 w-4" />}
                        {plan.cta}
                      </>
                    )}
                  </NeoButton>
                </NeoCardFooter>
              </NeoCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Note */}
        <motion.p
          className="mt-8 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Secure payments powered by Razorpay. Your data never touches our servers.
        </motion.p>
      </div>
    </section>
  );
};

export default Pricing;
