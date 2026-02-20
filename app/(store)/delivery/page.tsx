import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Delivery Information",
  description:
    "Find out about our delivery options, timelines and costs for orders across Kenya and internationally.",
};

export default function DeliveryPage() {
  return (
    <StaticPage
      title="Delivery Information"
      subtitle="We deliver across Kenya and ship internationally. Here's everything you need to know."
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Nairobi Delivery</h2>
        <p>
          Orders placed before 12:00 noon on weekdays are dispatched same day
          and typically arrive within <strong>1–2 business days</strong>. We
          deliver to all areas within Nairobi, including Westlands, Karen,
          Kilimani, Kasarani and surrounding estates.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>Standard delivery: KES 300</li>
          <li>Express (same day): KES 500 — order before 10:00 am</li>
          <li>Free delivery on orders over KES 5,000</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Rest of Kenya</h2>
        <p>
          We deliver to all major towns via our courier partners (G4S, Sendy,
          and DHL). Delivery typically takes <strong>2–5 business days</strong>{" "}
          after dispatch.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>Standard countrywide: KES 500</li>
          <li>Free on orders over KES 8,000</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          International Shipping
        </h2>
        <p>
          We currently ship to Uganda, Tanzania, Rwanda, Ethiopia, and South
          Africa. International orders are dispatched within 2 business days and
          arrive in <strong>5–10 business days</strong> depending on customs
          clearance.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>East Africa: KES 1,500</li>
          <li>South Africa: KES 3,000</li>
          <li>Other destinations: contact us for a quote</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Order Tracking</h2>
        <p>
          Once your order is dispatched you will receive an SMS and email with a
          tracking link. You can also monitor your order status from your{" "}
          <a href="/account/orders" className="underline">
            account orders page
          </a>
          .
        </p>
      </section>

      <p className="text-xs text-muted-foreground">
        Last updated: January 2026. Delivery fees are subject to change. Contact{" "}
        <a href="mailto:support@riziki.co.ke" className="underline">
          support@riziki.co.ke
        </a>{" "}
        for any delivery queries.
      </p>
    </StaticPage>
  );
}
