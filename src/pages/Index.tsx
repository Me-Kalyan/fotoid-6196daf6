import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import { CountryMarquee } from "@/components/ui/country-marquee";
import HowItWorks from "@/components/landing/HowItWorks";
import UploadSection from "@/components/landing/UploadSection";
import Pricing from "@/components/landing/Pricing";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <CountryMarquee />
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <UploadSection />
        <section id="pricing">
          <Pricing />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
