import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Learn about our hassle-free 14-day return and exchange policy.",
};

export default function ReturnsPage() {
  return (
    <StaticPage
      title="Returns & Exchanges"
      subtitle="Changed your mind? No worries — we offer hassle-free returns within 14 days of delivery."
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Our Returns Policy</h2>
        <p>
          We accept returns on most items within <strong>14 days</strong> of the
          delivery date. Items must be unworn, unwashed, and in their original
          packaging with all tags attached.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Items Eligible for Return
        </h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>Clothing and accessories (unworn, tags on)</li>
          <li>Shoes (unworn, in original box)</li>
          <li>Beauty products (sealed and unopened)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Non-Returnable Items
        </h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>Underwear and swimwear (for hygiene reasons)</li>
          <li>Earrings and pierced jewellery</li>
          <li>Opened cosmetics or skincare products</li>
          <li>Items marked as &ldquo;Final Sale&rdquo;</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          How to Start a Return
        </h2>
        <ol className="ml-4 list-decimal space-y-1 text-muted-foreground">
          <li>Log in to your account and go to My Orders.</li>
          <li>Select the order and item you wish to return.</li>
          <li>Choose &ldquo;Return item&rdquo; and follow the prompts.</li>
          <li>
            Drop the item at any G4S parcel station or arrange a pickup for an
            additional fee.
          </li>
        </ol>
        <p>
          You will receive a refund via M-Pesa or your original payment method
          within <strong>5–7 business days</strong> of us receiving the item.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Exchanges</h2>
        <p>
          Need a different size or colour? Start a return and place a new order
          — we&apos;ll express-process the replacement. Alternatively email{" "}
          <a href="mailto:support@riziki.co.ke" className="underline">
            support@riziki.co.ke
          </a>{" "}
          to arrange a direct exchange.
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Last updated: January 2026. For questions please contact{" "}
        <a href="mailto:support@riziki.co.ke" className="underline">
          support@riziki.co.ke
        </a>
        .
      </p>
    </StaticPage>
  );
}
