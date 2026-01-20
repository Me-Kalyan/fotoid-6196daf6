import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load heavy pages to reduce initial bundle size
const Editor = lazy(() => import("./pages/Editor"));
const Auth = lazy(() => import("./pages/Auth"));
const Install = lazy(() => import("./pages/Install"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Subscription = lazy(() => import("./pages/Subscription"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <OfflineBanner />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingSkeleton />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/editor" element={<Editor />} />
                <Route path="/install" element={<Install />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/faq" element={<FAQ />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
