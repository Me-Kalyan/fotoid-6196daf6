import { motion } from "framer-motion";
import { Mail, Copy, Check, Clock, MessageCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoCard } from "@/components/ui/neo-card";
import { useToast } from "@/hooks/use-toast";

const CONTACT_EMAIL = "fotoid@zohomail.in";

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      toast({
        title: "Email copied!",
        description: "The email address has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy: " + CONTACT_EMAIL,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-3 border-primary bg-card px-4 py-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-brand/10 border-2 border-brand">
            <MessageCircle className="w-5 h-5 text-brand" />
            <span className="font-bold text-sm">Get in Touch</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a question, feedback, or need assistance? We're here to help. 
            Reach out to us via email and our team will get back to you.
          </p>
        </motion.div>

        {/* Main Contact Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeoCard className="p-8 md:p-12 text-center max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-brand/10 border-3 border-brand flex items-center justify-center">
              <Mail className="w-8 h-8 text-brand" />
            </div>

            <h2 className="text-2xl font-heading font-bold mb-2">
              Email Us
            </h2>
            <p className="text-muted-foreground mb-6">
              Click below to copy our email address
            </p>

            {/* Email Display */}
            <div className="bg-secondary border-3 border-primary p-4 mb-6">
              <p className="font-mono text-lg font-bold break-all">
                {CONTACT_EMAIL}
              </p>
            </div>

            {/* Copy Button */}
            <NeoButton
              variant={copied ? "secondary" : "default"}
              size="lg"
              onClick={handleCopyEmail}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Email Address
                </>
              )}
            </NeoButton>
          </NeoCard>
        </motion.div>

        {/* Response Time Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-xl mx-auto"
        >
          <NeoCard variant="highlight" className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-highlight/20 border-2 border-primary flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold mb-1">
                  Response Time
                </h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to all inquiries within <strong>48-72 hours</strong>. 
                  For urgent matters, please include "URGENT" in your email subject line 
                  and we'll prioritize your request.
                </p>
              </div>
            </div>
          </NeoCard>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <h3 className="font-heading font-bold text-lg mb-4">
            What can we help you with?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="p-4 border-2 border-dashed border-primary/30 bg-secondary/30">
              <p className="font-bold mb-1">Technical Support</p>
              <p className="text-sm text-muted-foreground">
                Issues with photo processing or downloads
              </p>
            </div>
            <div className="p-4 border-2 border-dashed border-primary/30 bg-secondary/30">
              <p className="font-bold mb-1">Billing Questions</p>
              <p className="text-sm text-muted-foreground">
                Subscription, payments, or refund inquiries
              </p>
            </div>
            <div className="p-4 border-2 border-dashed border-primary/30 bg-secondary/30">
              <p className="font-bold mb-1">General Feedback</p>
              <p className="text-sm text-muted-foreground">
                Suggestions, feature requests, or compliments
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-bold">Back to Home</span>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default Contact;
