import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { CAREERS_PAGE } from "@/lib/config/content";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `Careers at ${config.siteName}`,
    description: `Join the ${config.siteName} team — we're looking for passionate, creative people to help shape the future of fashion.`,
  };
}

export default async function CareersPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contactEmail;

  return (
    <StaticPage
      title={`Careers at ${config.siteName}`}
      subtitle={CAREERS_PAGE.subtitle}
    >
      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">
          Why {config.siteName}?
        </h2>
        <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
          {CAREERS_PAGE.benefits.map((b) => (
            <li key={b}>{b}</li>
          ))}
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
          {CAREERS_PAGE.roles.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">How to Apply</h2>
        <p>
          {CAREERS_PAGE.applicationNote
            .replace(/\{email\}/g, contactEmail ?? "")
            .split(contactEmail ?? "__NO_EMAIL__")
            .map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="underline">
                      {contactEmail}
                    </a>
                  )}
                </span>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
        </p>
      </section>
    </StaticPage>
  );
}
