import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

const RefundPolicy = () => {
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

        <h1 className="font-heading text-4xl font-bold text-foreground">Refund Policy</h1>
        <p className="mt-2 text-muted-foreground">Last updated: January 2025</p>

        <div className="mt-8 space-y-8 text-foreground/80">
          <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 text-destructive" />
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">No Refund Policy</h2>
                <p className="mt-2">
                  All purchases made on FotoID are final. We do not offer refunds for any reason once a 
                  payment has been processed.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">Why We Have This Policy</h2>
            <p className="mt-3">
              FotoID is a digital service that provides instant access to photo processing features. 
              Once you've used our service to create passport photos, the value has been delivered. 
              Unlike physical goods, digital services cannot be "returned."
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">Before You Purchase</h2>
            <p className="mt-3">We encourage you to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Try our free tier with 2 downloads to test the service</li>
              <li>Review the features included in the Pro plan</li>
              <li>Check that your photos meet basic requirements before upgrading</li>
              <li>Ensure you understand what you're purchasing</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">What's Covered</h2>
            <p className="mt-3">This no-refund policy applies to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Pro subscription purchases</li>
              <li>One-time payments</li>
              <li>Any other paid features or services</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">Exceptions</h2>
            <p className="mt-3">
              In rare cases, we may consider exceptions for technical issues that prevented you from 
              using the service entirely. These are evaluated on a case-by-case basis and are not guaranteed. 
              Contact us with proof of the technical issue within 24 hours of purchase.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">Chargebacks</h2>
            <p className="mt-3">
              Filing a chargeback or payment dispute instead of contacting us will result in permanent 
              account termination. If you believe there's an issue with your payment, please contact us 
              first at{" "}
              <a href="mailto:fotoid@zohomail.in" className="text-primary underline">
                fotoid@zohomail.in
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold text-foreground">Contact Us</h2>
            <p className="mt-3">
              If you have questions about this policy or need assistance, please contact us at{" "}
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

export default RefundPolicy;
