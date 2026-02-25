import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { SUSTAINABILITY_PAGE } from "@/lib/config/content";

export const metadata: Metadata = {
  title: "Sustainability",
  description:
    "Our commitment to responsible sourcing, eco-friendly packaging and reducing fashion's environmental impact.",
};

export default async function SustainabilityPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contactEmail ?? "our sustainability team";

  function interpolate(text: string) {
    return text
      .replace(/\{siteName\}/g, config.siteName)
      .replace(/\{email\}/g, contactEmail);
  }

  return (
    <StaticPage title="Sustainability" subtitle={SUSTAINABILITY_PAGE.subtitle}>
      {SUSTAINABILITY_PAGE.sections.map((s) => (
        <section key={s.heading} className="space-y-3">
          <h2 className="font-heading text-base font-bold">{s.heading}</h2>
          {s.body && <p>{interpolate(s.body)}</p>}
          {s.items.length > 0 && (
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              {s.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </StaticPage>
  );
}
