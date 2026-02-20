import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "Our commitment to responsible sourcing, eco-friendly packaging and reducing fashion's environmental impact.",
};

export default function SustainabilityPage() {
  return (
    <StaticPage
      title="Sustainability"
      subtitle="Fashion should be beautiful and responsible. Here's how we're working towards a more sustainable future."
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Responsible Sourcing
        </h2>
        <p>
          Every brand on Riziki is evaluated against our supplier code of
          conduct, which requires fair wages, safe working conditions, and
          compliance with local labour laws. We conduct annual audits of our key
          suppliers and publish the results on request.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Eco-Friendly Packaging
        </h2>
        <p>
          We use 100% recycled and recyclable packaging materials across all our
          deliveries. Our poly mailers are made from post-consumer recycled
          plastic and are fully recyclable at kerbside collection points. We
          removed single-use tissue paper in 2023, saving over 200,000 sheets
          per year.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Carbon-Conscious Logistics
        </h2>
        <p>
          We offset 100% of the carbon emissions from our last-mile deliveries
          through verified reforestation projects in the Mount Kenya ecosystem.
          We are working towards fully electric last-mile delivery within
          Nairobi by 2027.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Our 2026 Commitments
        </h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>50% of products to carry sustainability credentials</li>
          <li>
            Launch a pre-loved / resale section on the platform by Q3 2026
          </li>
          <li>Partner with 3 Kenyan designers using locally sourced fabrics</li>
          <li>Achieve plastic-free packaging across all product categories</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Got Feedback?</h2>
        <p>
          We believe accountability requires transparency. If you have ideas,
          suggestions or concerns about our sustainability practices, email{" "}
          <a href="mailto:sustainability@riziki.co.ke" className="underline">
            sustainability@riziki.co.ke
          </a>
          .
        </p>
      </section>
    </StaticPage>
  );
}
