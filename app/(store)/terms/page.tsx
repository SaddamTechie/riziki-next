import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of Riziki.",
};

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      subtitle="Last updated: 1 January 2025. Please read these terms carefully before using our website."
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using riziki.co.ke you agree to be bound by these
          Terms of Service and our Privacy Policy. If you do not agree, please
          stop using the website immediately.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">2. Your Account</h2>
        <p>
          You must be at least 18 years old to create an account. You are
          responsible for maintaining the confidentiality of your password and
          for all activities that occur under your account. Notify us
          immediately of any unauthorised use at{" "}
          <a href="mailto:support@riziki.co.ke" className="underline">
            support@riziki.co.ke
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          3. Orders & Pricing
        </h2>
        <p>
          All prices are displayed in Kenyan Shillings (KES) inclusive of VAT
          unless stated otherwise. We reserve the right to cancel orders in the
          event of pricing errors or stock unavailability. You will be notified
          and refunded in full.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          4. Intellectual Property
        </h2>
        <p>
          All content on this website — including text, images, logos and design
          — is owned by or licensed to Riziki Limited and protected by copyright
          law. You may not reproduce or redistribute any content without our
          express written permission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          5. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, Riziki shall not be liable for
          indirect, incidental or consequential damages arising from your use of
          the website or any products purchased through it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">6. Governing Law</h2>
        <p>
          These terms are governed by the laws of the Republic of Kenya. Any
          disputes shall be subject to the exclusive jurisdiction of the courts
          of Nairobi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          7. Changes to Terms
        </h2>
        <p>
          We may update these terms from time to time. We will notify registered
          users by email of material changes. Continued use of the website
          constitutes acceptance of the updated terms.
        </p>
      </section>
    </StaticPage>
  );
}
