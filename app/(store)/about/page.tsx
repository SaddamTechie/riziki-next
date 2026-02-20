import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "About Riziki",
  description:
    "Learn about our story, mission and the team behind Riziki — Kenya's premier online fashion destination.",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="About Riziki"
      subtitle="Kenya's premier online destination for contemporary fashion, beauty and lifestyle."
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Our Story</h2>
        <p>
          Riziki was founded in 2022 by a team of fashion-forward Kenyans who
          believed that world-class style should be accessible to everyone on
          the continent. The name <em>Riziki</em> — Swahili for livelihood and
          abundance — reflects our belief that dressing well is not a luxury, it
          is a form of self-expression and confidence.
        </p>
        <p>
          We started as a curated boutique in Westlands, Nairobi and quickly
          expanded online to reach customers across Kenya and the wider East
          African region. Today we carry over 500 styles across women, men and
          beauty categories.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Our Mission</h2>
        <p>
          We exist to make contemporary, trend-driven fashion accessible to
          every African consumer — from the busy professional in Nairobi CBD to
          the style-conscious student in Eldoret. Every product on Riziki is
          hand-picked for quality, fit, and value.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Our Values</h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>
            <strong>Authenticity —</strong> We only source from verified,
            reputable brands and designers, and every product is quality-checked
            before dispatch.
          </li>
          <li>
            <strong>Inclusivity —</strong> Style has no size. We stock a wide
            range of sizes and are continually expanding our inclusive
            collection.
          </li>
          <li>
            <strong>Sustainability —</strong> We are committed to reducing our
            carbon footprint through responsible sourcing, minimal packaging,
            and partnership with eco-conscious brands.
          </li>
          <li>
            <strong>Customer First —</strong> From lightning-fast delivery to
            our 14-day no-hassle return policy, every decision we make starts
            with our customer.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Get in Touch</h2>
        <p>
          We love hearing from our community. Reach us at{" "}
          <a href="mailto:hello@riziki.co.ke" className="underline">
            hello@riziki.co.ke
          </a>{" "}
          or follow us on Instagram{" "}
          <a
            href="https://instagram.com/rizikifashion"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            @rizikifashion
          </a>
          .
        </p>
      </section>
    </StaticPage>
  );
}
