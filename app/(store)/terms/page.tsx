import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { TERMS_PAGE } from "@/lib/config/content";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Terms of Service",
    description: `The terms and conditions governing your use of ${config.siteName}.`,
  };
}

export default async function TermsPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contactEmail;
  return (
    <StaticPage title="Terms of Service" subtitle={TERMS_PAGE.subtitle}>
      {TERMS_PAGE.sections.map((s) => (
        <section key={s.heading} className="space-y-3">
          <h2 className="font-heading text-base font-bold">{s.heading}</h2>
          <p>
            {s.body.replace(/\{siteName\}/g, config.siteName)}
            {s.heading === "2. Your Account" && contactEmail && (
              <>
                {" "}
                Notify us at{" "}
                <a href={`mailto:${contactEmail}`} className="underline">
                  {contactEmail}
                </a>
                .
              </>
            )}
          </p>
        </section>
      ))}
    </StaticPage>
  );
}
