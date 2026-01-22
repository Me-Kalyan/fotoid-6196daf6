import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Crown,
  Download,
  Calendar,
  Clock,
  Globe,
  Zap,
  ArrowLeft,
  Loader2,
  Gift
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle } from "@/components/ui/neo-card";
import { NeoBadge } from "@/components/ui/neo-badge";
import { useRazorpay } from "@/hooks/useRazorpay";
import { format } from "date-fns";

interface Profile {
  is_pro: boolean;
  pro_expires_at: string | null;
  full_name: string | null;
  email: string | null;
}

interface DownloadRecord {
  id: string;
  downloaded_at: string;
  photo_type: string | null;
  country_code: string | null;
  is_paid: boolean;
}

const FREE_DOWNLOAD_LIMIT = 2;

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { initiatePayment, isLoading: paymentLoading } = useRazorpay();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("is_pro, pro_expires_at, full_name, email")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch download history
      const { data: downloadData } = await supabase
        .from("download_history")
        .select("*")
        .eq("user_id", user.id)
        .order("downloaded_at", { ascending: false });

      if (downloadData) {
        setDownloads(downloadData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Calculate credits
  const freeDownloadsUsed = downloads.filter(d => !d.is_paid && d.photo_type !== "paid_credit").length;
  const paidCredits = downloads.filter(d => d.photo_type === "paid_credit").length;
  const actualDownloads = downloads.filter(d => d.photo_type !== "paid_credit");
  const freeRemaining = Math.max(0, FREE_DOWNLOAD_LIMIT - freeDownloadsUsed);

  const isPro = profile?.is_pro && profile?.pro_expires_at
    ? new Date(profile.pro_expires_at) > new Date()
    : false;

  const proExpiresAt = profile?.pro_expires_at
    ? new Date(profile.pro_expires_at)
    : null;

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
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <NeoButton
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </NeoButton>
          <h1 className="font-heading text-xl font-bold">Dashboard</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-heading text-3xl font-bold">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and view your download history.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Subscription Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NeoCard className="h-full">
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2 text-base">
                  <Crown className="h-5 w-5" />
                  Subscription
                </NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                {isPro ? (
                  <div className="space-y-3">
                    <NeoBadge variant="brand" icon={<Crown className="h-3 w-3" />}>
                      Pro Member
                    </NeoBadge>
                    <p className="text-sm text-muted-foreground">
                      Expires: {proExpiresAt ? format(proExpiresAt, "MMM d, yyyy") : "N/A"}
                    </p>
                    <NeoButton
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate("/subscription")}
                    >
                      Manage Subscription
                    </NeoButton>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <NeoBadge variant="muted">Free Plan</NeoBadge>
                    <p className="text-sm text-muted-foreground">
                      Upgrade for unlimited downloads
                    </p>
                    <NeoButton
                      size="sm"
                      className="w-full"
                      onClick={() => initiatePayment("pro")}
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
                )}
              </NeoCardContent>
            </NeoCard>
          </motion.div>

          {/* Download Credits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <NeoCard className="h-full">
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2 text-base">
                  <Gift className="h-5 w-5" />
                  Download Credits
                </NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                {isPro ? (
                  <div className="space-y-3">
                    <div className="text-4xl font-bold font-heading text-brand">∞</div>
                    <p className="text-sm text-muted-foreground">
                      Unlimited downloads with Pro
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold font-heading">{freeRemaining}</span>
                      <span className="text-muted-foreground">free remaining</span>
                    </div>
                    {paidCredits > 0 && (
                      <p className="text-sm text-muted-foreground">
                        + {paidCredits} paid credit{paidCredits !== 1 ? "s" : ""}
                      </p>
                    )}
                    {freeRemaining === 0 && paidCredits === 0 && (
                      <NeoButton
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => initiatePayment("single")}
                        disabled={paymentLoading}
                      >
                        {paymentLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Buy Single Credit ₹29"
                        )}
                      </NeoButton>
                    )}
                  </div>
                )}
              </NeoCardContent>
            </NeoCard>
          </motion.div>

          {/* Total Downloads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <NeoCard className="h-full">
              <NeoCardHeader>
                <NeoCardTitle className="flex items-center gap-2 text-base">
                  <Download className="h-5 w-5" />
                  Total Downloads
                </NeoCardTitle>
              </NeoCardHeader>
              <NeoCardContent>
                <div className="space-y-3">
                  <div className="text-4xl font-bold font-heading">{actualDownloads.length}</div>
                  <p className="text-sm text-muted-foreground">
                    Photos downloaded
                  </p>
                </div>
              </NeoCardContent>
            </NeoCard>
          </motion.div>
        </div>

        {/* Download History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NeoCard>
            <NeoCardHeader>
              <NeoCardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Download History
              </NeoCardTitle>
            </NeoCardHeader>
            <NeoCardContent>
              {actualDownloads.length === 0 ? (
                <div className="text-center py-8">
                  <Download className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No downloads yet</p>
                  <NeoButton
                    className="mt-4"
                    onClick={() => navigate("/")}
                  >
                    Create Your First Photo
                  </NeoButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {actualDownloads.slice(0, 10).map((download) => (
                    <div
                      key={download.id}
                      className="flex items-center justify-between p-3 border-2 border-foreground rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg border-2 border-foreground bg-background flex items-center justify-center">
                          <Globe className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {download.country_code || "Unknown"} {download.photo_type || "Passport"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(download.downloaded_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      <NeoBadge variant={download.is_paid ? "brand" : "muted"} size="sm">
                        {download.is_paid ? "Paid" : "Free"}
                      </NeoBadge>
                    </div>
                  ))}
                  {actualDownloads.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      Showing latest 10 of {actualDownloads.length} downloads
                    </p>
                  )}
                </div>
              )}
            </NeoCardContent>
          </NeoCard>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
