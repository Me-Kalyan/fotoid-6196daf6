import { motion } from "framer-motion";
import { ChevronLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How does FotoID work?",
    answer: "Simply upload your photo, and our AI will automatically detect your face, remove the background, and crop it to the correct passport photo dimensions for your selected country. All processing happens directly in your browser - your photo never leaves your device."
  },
  {
    category: "Getting Started",
    question: "Do I need to create an account?",
    answer: "You can try FotoID with 2 free downloads without an account. To access more features and track your download history, you can create a free account using your email or Google login."
  },
  {
    category: "Getting Started",
    question: "Which countries are supported?",
    answer: "FotoID supports passport photo specifications for over 100+ countries including USA, India, UK, Canada, Australia, Schengen countries, and many more. Each country has specific size and background requirements that we automatically apply."
  },

  // Photo Requirements
  {
    category: "Photo Requirements",
    question: "What kind of photo should I upload?",
    answer: "For best results, upload a clear, well-lit photo taken against a plain background. The photo should show your full face looking straight at the camera with a neutral expression. Avoid shadows, glasses (unless required for medical reasons), and hats."
  },
  {
    category: "Photo Requirements",
    question: "What image formats are supported?",
    answer: "FotoID accepts JPEG, PNG, and WebP image formats. For best quality, we recommend uploading high-resolution photos (at least 600x600 pixels)."
  },
  {
    category: "Photo Requirements",
    question: "Will my passport photo be accepted by authorities?",
    answer: "FotoID follows official passport photo guidelines for each country. However, final acceptance is at the discretion of the issuing authority. We recommend double-checking specific requirements with your local passport office."
  },

  // Pricing & Downloads
  {
    category: "Pricing & Downloads",
    question: "How many free downloads do I get?",
    answer: "Every user gets 2 free passport photo downloads. After that, you can purchase individual downloads or subscribe to our Pro plan for unlimited downloads and premium features."
  },
  {
    category: "Pricing & Downloads",
    question: "What's included in the Pro plan?",
    answer: "The Pro plan includes unlimited passport photo downloads, priority processing, all premium backgrounds, bulk photo processing, and priority support. Pro subscriptions are billed monthly or annually."
  },
  {
    category: "Pricing & Downloads",
    question: "Can I get a refund?",
    answer: "Yes, we offer refunds within 7 days of purchase if you're not satisfied. Please contact our support team with your order details. Note that used credits cannot be refunded."
  },

  // Technical
  {
    category: "Technical",
    question: "Is my photo data safe?",
    answer: "Absolutely! All photo processing happens directly in your browser using advanced AI models. Your photos are never uploaded to our servers, ensuring complete privacy. We don't store, share, or have access to any photos you process."
  },
  {
    category: "Technical",
    question: "What file size will my passport photo be?",
    answer: "Output file sizes vary based on the selected DPI quality and format. At 300 DPI (print quality), expect files around 500KB-2MB. At 72 DPI (web quality), files are typically under 200KB."
  },
  {
    category: "Technical",
    question: "Can I use FotoID on my phone?",
    answer: "Yes! FotoID is fully responsive and works great on mobile devices. You can even install it as a Progressive Web App (PWA) for a native app-like experience directly from your phone's browser."
  },

  // Printing
  {
    category: "Printing",
    question: "How do I print my passport photos?",
    answer: "After downloading, you can print your passport photos at home using a standard photo printer, or take the file to any photo printing service (CVS, Walgreens, Costco, etc.). We provide 4x6 inch print sheets optimized for standard photo paper."
  },
  {
    category: "Printing",
    question: "What paper should I use for printing?",
    answer: "Use matte or glossy photo paper for best results. Most passport offices accept both, but check your country's specific requirements. Avoid regular printer paper as it won't produce acceptable quality."
  },
  {
    category: "Printing",
    question: "What print sizes are available?",
    answer: "FotoID offers multiple print sheet options including 4x6 inch (fits 4 photos), 5x7 inch (fits 6 photos), and Letter size 8.5x11 inch (fits 10 photos). You can also download individual photos at their exact specification size."
  },
];

const FAQ = () => {
  const navigate = useNavigate();
  
  // Group FAQs by category
  const categories = [...new Set(faqData.map(item => item.category))];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b-3 border-primary bg-secondary/30 py-12 md:py-20">
          <div className="container mx-auto max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-brand border-3 border-primary mb-6 shadow-brutal">
                <HelpCircle className="w-8 h-8 text-brand-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about creating perfect passport photos with FotoID.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto max-w-4xl px-4">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
                className="mb-10"
              >
                <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-brand" />
                  {category}
                </h2>
                
                <div className="border-3 border-primary bg-background shadow-brutal">
                  <Accordion type="single" collapsible className="w-full">
                    {faqData
                      .filter(item => item.category === category)
                      .map((item, index) => (
                        <AccordionItem 
                          key={index} 
                          value={`${category}-${index}`}
                          className="border-b-2 border-primary last:border-b-0"
                        >
                          <AccordionTrigger className="px-4 py-4 hover:bg-secondary/50 text-left font-heading font-bold">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-4 text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                </div>
              </motion.div>
            ))}

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center border-3 border-primary bg-brand/10 p-8 shadow-brutal"
            >
              <h3 className="text-xl font-heading font-bold mb-2">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? We're here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <NeoButton onClick={() => navigate("/")}>
                  <ChevronLeft className="w-4 h-4" />
                  Back to Home
                </NeoButton>
                <NeoButton variant="secondary" onClick={() => navigate("/editor")}>
                  Try FotoID Free
                </NeoButton>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
