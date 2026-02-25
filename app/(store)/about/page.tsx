import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { ABOUT_PAGE } from "@/lib/config/content";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `About ${config.siteName}`,
    description: `Learn about our story, mission and the team behind ${config.siteName}.`,
  };
}

export default async function AboutPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contactEmail;
  const instagram = config.socialLinks?.instagram;

  return (
    <StaticPage
      title={`About ${config.siteName}`}
      subtitle={config.siteTagline || ""}
    >
      {ABOUT_PAGE.sections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="font-heading text-base font-bold">
            {section.heading}
          </h2>
          {section.paragraphs?.map((p, i) => (
            <p key={i}>{p.replace(/\{siteName\}/g, config.siteName)}</p>
          ))}
          {section.items && (
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              {section.items.map((item) => (
                <li key={item.label}>
                  <strong>{item.label} —</strong> {item.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="font-heading text-base font-bold">Get in Touch</h2>
        <p>
          We love hearing from our community.
          {contactEmail && (
            <>
              {" "}
              Reach us at{" "}
              <a href={`mailto:${contactEmail}`} className="underline">
                {contactEmail}
              </a>
            </>
          )}
          {instagram && (
            <>
              {" "}
              or follow us on Instagram{" "}
              <a
                href={
                  instagram.startsWith("http")
                    ? instagram
                    : `https://instagram.com/${instagram.replace("@", "")}`
                }
                className="underline"
                target="_blank"
                rel="noreferrer"
              >
                {instagram.startsWith("@")
                  ? instagram
                  : `@${instagram.split("/").pop()}`}
              </a>
            </>
          )}
          .
        </p>
      </section>
    </StaticPage>
  );
}
