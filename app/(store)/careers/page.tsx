import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Careers at Riziki",
  description:
    "Join the Riziki team — we're looking for passionate, creative people to help shape the future of African fashion.",
};

export default function CareersPage() {
  return (
    <StaticPage
      title="Careers at Riziki"
      subtitle="We're building the future of fashion retail in Africa. Want to be part of it?"
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Why Riziki?</h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>
            Work on products used by tens of thousands of fashion-conscious
            consumers across East Africa
          </li>
          <li>
            Competitive salaries benchmarked against Kenya tech and retail
            market rates
          </li>
          <li>
            Flexible remote-first culture with optional hot-desking in our
            Westlands office
          </li>
          <li>Quarterly team retreats and a generous clothing allowance</li>
          <li>Clear growth paths and a learning budget of KES 50,000 p.a.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Open Roles</h2>
        <p className="text-muted-foreground">
          We don&apos;t always have open roles publicly listed but we welcome
          speculative applications from exceptional candidates. If you have
          relevant experience in any of the areas below, we&apos;d love to hear
          from you.
        </p>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          <li>Brand & Marketing</li>
          <li>Buying & Merchandise</li>
          <li>Customer Experience</li>
          <li>Full-Stack Engineering (Next.js, React Native)</li>
          <li>Warehouse & Logistics (Nairobi)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">How to Apply</h2>
        <p>
          Send your CV and a short note about why you want to work with us to{" "}
          <a href="mailto:careers@riziki.co.ke" className="underline">
            careers@riziki.co.ke
          </a>
          . We review every application and aim to respond within two weeks.
        </p>
      </section>
    </StaticPage>
  );
}
