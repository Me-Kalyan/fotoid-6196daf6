import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link 
          to="/" 
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="font-heading text-4xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: January 2025</p>

        <div className="mt-8 space-y-8 text-foreground/80">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">1. Introduction</h2>
            <p className="mt-3">
              Welcome to FotoID. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">2. Information We Collect</h2>
            <p className="mt-3">We collect the following types of information:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Account Information:</strong> Email address and name when you create an account.</li>
              <li><strong>Payment Information:</strong> Payment details processed securely through Razorpay. We do not store your card details.</li>
              <li><strong>Usage Data:</strong> Anonymous analytics about how you use our service.</li>
              <li><strong>Device Information:</strong> Browser type, device fingerprint for fraud prevention.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">3. Photo Processing</h2>
            <p className="mt-3">
              <strong>Your photos are processed entirely on your device (client-side).</strong> We do not upload, 
              store, or have access to your photos on our servers. All background removal and photo editing happens 
              locally in your browser.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">4. How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To provide and maintain our service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To communicate with you about your account</li>
              <li>To improve our service based on usage patterns</li>
              <li>To prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">5. Data Security</h2>
            <p className="mt-3">
              We implement appropriate security measures to protect your personal information. Your data is 
              encrypted in transit and at rest. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">6. Third-Party Services</h2>
            <p className="mt-3">We use the following third-party services:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><strong>Razorpay:</strong> For payment processing</li>
              <li><strong>Analytics:</strong> For understanding usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">7. Your Rights</h2>
            <p className="mt-3">You have the right to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">8. Contact Us</h2>
            <p className="mt-3">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:fotoid@zohomail.in" className="text-primary underline">
                fotoid@zohomail.in
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
