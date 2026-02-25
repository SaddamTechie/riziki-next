import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { PRIVACY_PAGE } from "@/lib/config/content";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Privacy Policy",
    description: `How ${config.siteName} collects, uses and protects your personal data.`,
  };
}

export default async function PrivacyPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contactEmail ?? "our privacy team";

  function interpolate(text: string) {
    return text
      .replace(/\{email\}/g, contactEmail)
      .replace(
        /\{dataRequestResponseDays\}/g,
        String(PRIVACY_PAGE.dataRequestResponseDays),
      );
  }

  return (
    <StaticPage title="Privacy Policy" subtitle={PRIVACY_PAGE.subtitle}>
      {PRIVACY_PAGE.sections.map((s) => (
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
