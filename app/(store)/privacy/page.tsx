import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Riziki collects, uses and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      subtitle="Effective date: 1 January 2025. We respect your privacy and are committed to protecting your personal data."
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          1. Information We Collect
        </h2>
        <p>
          We collect information you provide directly (name, email, shipping
          address, payment details) and information generated through your use
          of our service (browsing history, purchase history, device identifiers
          and IP address).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          2. How We Use Your Information
        </h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>To fulfil and manage your orders</li>
          <li>To process payments securely</li>
          <li>To send order confirmations and shipping updates</li>
          <li>
            To send marketing emails (only with your consent — you can
            unsubscribe at any time)
          </li>
          <li>To improve our website and personalise your experience</li>
          <li>To detect and prevent fraudulent transactions</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          3. Sharing Your Data
        </h2>
        <p>
          We do not sell your personal data. We share data with third-party
          service providers only as necessary to operate our business (payment
          processors, logistics partners, email service providers). All partners
          are contractually required to handle your data in accordance with
          applicable data protection laws.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">4. Cookies</h2>
        <p>
          We use essential cookies to keep you signed in and maintain your cart.
          We also use analytics cookies (with your consent) to understand how
          customers use our website. You can manage cookie preferences in your
          browser settings.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">5. Your Rights</h2>
        <p>
          Under Kenyan data protection law and GDPR (where applicable) you have
          the right to access, correct, delete, or export your personal data.
          Submit requests to{" "}
          <a href="mailto:privacy@riziki.co.ke" className="underline">
            privacy@riziki.co.ke
          </a>
          . We will respond within 30 days.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">6. Data Security</h2>
        <p>
          We use industry-standard encryption (TLS 1.3) for all data in transit
          and at rest. We never store raw card numbers — all payment processing
          is handled by PCI DSS-compliant partners.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">7. Contact</h2>
        <p>
          For privacy-related questions contact our Data Protection Officer:{" "}
          <a href="mailto:privacy@riziki.co.ke" className="underline">
            privacy@riziki.co.ke
          </a>
          .
        </p>
      </section>
    </StaticPage>
  );
}
