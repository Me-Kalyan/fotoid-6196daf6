import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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

        <h1 className="font-heading text-4xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-2 text-muted-foreground">Last updated: January 2025</p>

        <div className="mt-8 space-y-8 text-foreground/80">
          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mt-3">
              By accessing or using FotoID ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">2. Description of Service</h2>
            <p className="mt-3">
              FotoID provides an online tool for converting photos into passport-size format. Our service processes 
              photos entirely on your device, removing backgrounds and resizing images to standard passport photo 
              dimensions.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">3. User Accounts</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>You must provide accurate information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>One account per person; sharing accounts is prohibited</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">4. Acceptable Use</h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to circumvent usage limits or security measures</li>
              <li>Upload photos containing illegal content</li>
              <li>Resell or redistribute the service without authorization</li>
              <li>Use automated tools to access the service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">5. Subscriptions and Payments</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Pro subscriptions are billed as one-time payments for 30 days of access</li>
              <li>There is no automatic renewal</li>
              <li>Prices may change with notice to existing subscribers</li>
              <li>All payments are processed securely through Razorpay</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">6. Photo Disclaimer</h2>
            <p className="mt-3">
              FotoID is a photo conversion tool that resizes and formats photos to standard passport dimensions. 
              We do not guarantee acceptance of photos for any specific purpose. Users are responsible for 
              ensuring photos meet their intended use requirements.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">7. Intellectual Property</h2>
            <p className="mt-3">
              The FotoID service, including its design, features, and content, is owned by us and protected 
              by intellectual property laws. You retain ownership of photos you upload and create.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">8. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, FotoID shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, including loss of profits, data, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">9. Changes to Terms</h2>
            <p className="mt-3">
              We reserve the right to modify these terms at any time. We will notify users of significant changes 
              via email or through the service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">10. Contact</h2>
            <p className="mt-3">
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:support@fotoid.app" className="text-primary underline">
                support@fotoid.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
