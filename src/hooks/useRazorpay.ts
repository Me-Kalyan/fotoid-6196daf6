import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { triggerHaptic } from "@/hooks/useHapticFeedback";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type PlanType = "single" | "pro";

const PLAN_AMOUNTS: Record<PlanType, number> = {
  single: 2900, // ₹29 in paise
  pro: 9900,    // ₹99 in paise
};

const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
  single: "Single Photo Download",
  pro: "Pro Monthly Subscription",
};

// Lazy load Razorpay script only when needed
const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
};

export function useRazorpay() {
  const [isLoading, setIsLoading] = useState(false);
  const scriptLoadPromise = useRef<Promise<void> | null>(null);

  const initiatePayment = useCallback(
    async (planType: PlanType): Promise<boolean> => {
      setIsLoading(true);
      triggerHaptic("medium");

      try {
        // Lazy load Razorpay script when payment is initiated
        if (!scriptLoadPromise.current) {
          scriptLoadPromise.current = loadRazorpayScript();
        }
        
        await scriptLoadPromise.current;
      } catch (error) {
        console.error("Failed to load Razorpay:", error);
        toast({
          title: "Error",
          description: "Failed to load payment gateway. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }

      try {
        // Create order via edge function
        const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
          body: {
            plan_type: planType,
            amount: PLAN_AMOUNTS[planType],
          },
        });

        if (error || !data?.order_id) {
          console.error("Error creating order:", error);
          toast({
            title: "Error",
            description: "Failed to create payment order. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }

        // Open Razorpay checkout
        return new Promise((resolve) => {
          const options: RazorpayOptions = {
            key: data.key_id,
            amount: data.amount,
            currency: data.currency,
            order_id: data.order_id,
            name: "FotoID",
            description: PLAN_DESCRIPTIONS[planType],
            prefill: {
              email: data.user_email || undefined,
            },
            theme: {
              color: "#000000",
            },
            handler: async (response: RazorpayResponse) => {
              triggerHaptic("light");
              
              // Verify payment
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
                "verify-razorpay-payment",
                {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    plan_type: planType,
                  },
                }
              );

              if (verifyError || !verifyData?.verified) {
                console.error("Payment verification failed:", verifyError);
                triggerHaptic("error");
                toast({
                  title: "Payment Failed",
                  description: "Payment verification failed. Please contact support.",
                  variant: "destructive",
                });
                setIsLoading(false);
                resolve(false);
                return;
              }

              triggerHaptic("success");
              toast({
                title: "Payment Successful!",
                description: verifyData.message,
              });
              setIsLoading(false);
              
              // Navigate to success page using window.location to avoid hook issues
              window.location.href = `/subscription/success?plan=${planType}`;
              resolve(true);
            },
            modal: {
              ondismiss: () => {
                triggerHaptic("light");
                setIsLoading(false);
                resolve(false);
              },
            },
          };

          const razorpay = new window.Razorpay(options);
          razorpay.open();
        });
      } catch (error) {
        console.error("Payment error:", error);
        triggerHaptic("error");
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return false;
      }
    },
    []
  );

  return {
    initiatePayment,
    isLoading,
    isReady: true, // Always ready since we lazy load
  };
}
