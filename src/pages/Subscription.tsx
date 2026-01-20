import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Crown, 
  Calendar, 
  ArrowLeft,
  Loader2,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle, NeoCardDescription } from "@/components/ui/neo-card";
import { NeoBadge } from "@/components/ui/neo-badge";
import { useRazorpay } from "@/hooks/useRazorpay";
import { format, differenceInDays, isPast } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Profile {
  is_pro: boolean;
  pro_expires_at: string | null;
  full_name: string | null;
  email: string | null;
}

const Subscription = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_pro, pro_expires_at, full_name, email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    const success = await initiatePayment("pro");
    if (success) {
      // Refresh profile data after successful payment
      await fetchProfile();
    }
  };

  // Note: Subscriptions expire automatically - no manual cancellation needed
  // Users pay for 30 days at a time with no auto-renewal

  const proExpiresAt = profile?.pro_expires_at 
    ? new Date(profile.pro_expires_at) 
    : null;

  const isPro = profile?.is_pro && proExpiresAt && !isPast(proExpiresAt);
  const isExpired = profile?.is_pro && proExpiresAt && isPast(proExpiresAt);
  const daysRemaining = proExpiresAt ? differenceInDays(proExpiresAt, new Date()) : 0;
  const isExpiringSoon = isPro && daysRemaining <= 7 && daysRemaining > 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground bg-background px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <NeoButton 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </NeoButton>
          <h1 className="font-heading text-xl font-bold">Subscription</h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <NeoCard className={isPro ? "border-brand" : ""}>
            <NeoCardHeader>
              <div className="flex items-center justify-between">
                <NeoCardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6" />
                  Current Plan
                </NeoCardTitle>
                {isPro && (
                  <NeoBadge variant="brand" icon={<Crown className="h-3 w-3" />}>
                    Active
                  </NeoBadge>
                )}
                {isExpired && (
                  <NeoBadge variant="muted" icon={<XCircle className="h-3 w-3" />}>
                    Expired
                  </NeoBadge>
                )}
                {!profile?.is_pro && !isExpired && (
                  <NeoBadge variant="muted">Free</NeoBadge>
                )}
              </div>
            </NeoCardHeader>
            <NeoCardContent className="space-y-6">
              {isPro ? (
                <>
                  {/* Pro Status */}
                  <div className="flex items-center gap-4 p-4 border-2 border-foreground rounded-lg bg-brand/10">
                    <div className="h-16 w-16 rounded-lg border-2 border-foreground bg-brand flex items-center justify-center">
                      <Crown className="h-8 w-8 text-brand-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl font-bold">Pro Plan</h3>
                      <p className="text-muted-foreground">₹99/month • Unlimited downloads</p>
                    </div>
                  </div>

                  {/* Expiry Warning */}
                  {isExpiringSoon && (
                    <div className="flex items-start gap-3 p-4 border-2 border-warning bg-warning/10 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-warning">Expiring Soon</p>
                        <p className="text-sm text-muted-foreground">
                          Your subscription expires in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}. 
                          Renew now to keep unlimited access.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Subscription Details */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border-2 border-foreground rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">Expires On</span>
                      </div>
                      <p className="font-heading text-xl font-bold">
                        {proExpiresAt ? format(proExpiresAt, "MMMM d, yyyy") : "N/A"}
                      </p>
                    </div>
                    <div className="p-4 border-2 border-foreground rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm">Days Remaining</span>
                      </div>
                      <p className="font-heading text-xl font-bold">
                        {daysRemaining > 0 ? `${daysRemaining} days` : "Expiring today"}
                      </p>
                    </div>
                  </div>

                  {/* Pro Features */}
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold">Your Benefits</h4>
                    <ul className="grid gap-2 md:grid-cols-2">
                      {[
                        "Unlimited downloads",
                        "Priority processing",
                        "Custom background colors",
                        "Bulk photo export",
                        "No watermarks ever",
                        "Premium support"
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-brand" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-4 border-t-2 border-foreground">
                    <NeoButton 
                      onClick={handleRenew}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Extend for ₹99
                        </>
                      )}
                    </NeoButton>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      No auto-renewal. Your subscription will expire automatically on the date shown above.
                    </p>
                  </div>
                </>
              ) : isExpired ? (
                <>
                  {/* Expired State */}
                  <div className="flex items-center gap-4 p-4 border-2 border-foreground rounded-lg bg-muted/30">
                    <div className="h-16 w-16 rounded-lg border-2 border-foreground bg-muted flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl font-bold">Pro Plan (Expired)</h3>
                      <p className="text-muted-foreground">
                        Expired on {proExpiresAt ? format(proExpiresAt, "MMMM d, yyyy") : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-foreground bg-brand/10 rounded-lg">
                    <p className="font-bold mb-2">Reactivate your Pro subscription</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get back unlimited downloads and all Pro features for just ₹99/month.
                    </p>
                    <NeoButton 
                      onClick={handleRenew}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Reactivate Pro
                        </>
                      )}
                    </NeoButton>
                  </div>
                </>
              ) : (
                <>
                  {/* Free Plan State */}
                  <div className="flex items-center gap-4 p-4 border-2 border-foreground rounded-lg bg-muted/30">
                    <div className="h-16 w-16 rounded-lg border-2 border-foreground bg-muted flex items-center justify-center">
                      <Crown className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-2xl font-bold">Free Plan</h3>
                      <p className="text-muted-foreground">2 downloads included</p>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-brand bg-brand/10 rounded-lg">
                    <p className="font-bold mb-2">Upgrade to Pro</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get unlimited downloads, priority processing, and more for just ₹99/month.
                    </p>
                    <NeoButton 
                      onClick={handleRenew}
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Upgrade to Pro
                        </>
                      )}
                    </NeoButton>
                  </div>

                  {/* Free vs Pro Comparison */}
                  <div className="space-y-3">
                    <h4 className="font-heading font-bold">Free vs Pro</h4>
                    <div className="grid gap-2">
                      {[
                        { feature: "Downloads", free: "2 total", pro: "Unlimited" },
                        { feature: "Processing", free: "Standard", pro: "Priority" },
                        { feature: "Background colors", free: "White only", pro: "Custom colors" },
                        { feature: "Bulk export", free: "No", pro: "Yes" },
                      ].map((row) => (
                        <div key={row.feature} className="grid grid-cols-3 gap-2 text-sm p-2 border-2 border-foreground rounded">
                          <span className="font-medium">{row.feature}</span>
                          <span className="text-muted-foreground text-center">{row.free}</span>
                          <span className="text-brand font-bold text-center">{row.pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </NeoCardContent>
          </NeoCard>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle>Frequently Asked Questions</NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent className="space-y-4">
              {[
                {
                  q: "How does billing work?",
                  a: "Pro subscriptions are billed as one-time payments for 30 days of access. There's no automatic renewal - you choose when to extend."
                },
                {
                  q: "Can I get a refund?",
                  a: "All purchases are final. We do not offer refunds. Please try our free tier before upgrading."
                },
                {
                  q: "What happens when my subscription expires?",
                  a: "You'll be downgraded to the Free plan with 2 downloads. Your existing photos remain accessible."
                },
                {
                  q: "Can I switch between plans?",
                  a: "You can upgrade to Pro anytime. When you extend, the new 30 days are added to your remaining time."
                }
              ].map((faq, i) => (
                <div key={i} className="p-4 border-2 border-foreground rounded-lg">
                  <p className="font-heading font-bold mb-1">{faq.q}</p>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </NeoCardContent>
          </NeoCard>
        </motion.div>
      </main>
    </div>
  );
};

export default Subscription;
