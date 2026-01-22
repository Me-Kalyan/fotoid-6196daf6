import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import { CountryMarquee } from "@/components/ui/country-marquee";
import HowItWorks from "@/components/landing/HowItWorks";
import { GlobalDocumentExplorer } from "@/components/landing/GlobalDocumentExplorer";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";
import InstallBanner from "@/components/landing/InstallBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <section id="countries">
          <CountryMarquee />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <GlobalDocumentExplorer />
        <section id="pricing">
          <Pricing />
        </section>
      </main>
      <Footer />
      <InstallBanner />
    </div>
  );
};

export default Index;
