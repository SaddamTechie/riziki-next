import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { DELIVERY_PAGE } from "@/lib/config/content";

export const metadata: Metadata = {
  title: DELIVERY_PAGE.title,
  description: DELIVERY_PAGE.subtitle,
};

export default async function DeliveryPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contactEmail;

  return (
    <StaticPage title={DELIVERY_PAGE.title} subtitle={DELIVERY_PAGE.subtitle}>
      {DELIVERY_PAGE.zones.map((zone) => (
        <section key={zone.title} className="space-y-3">
          <h2 className="font-heading text-base font-bold">{zone.title}</h2>
          <p>{zone.description}</p>
          {zone.items.length > 0 && (
            <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
              {zone.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        {DELIVERY_PAGE.footer}
        {contactEmail && (
          <>
            {" "}
            Contact{" "}
            <a href={`mailto:${contactEmail}`} className="underline">
              {contactEmail}
            </a>{" "}
            for any delivery queries.
          </>
        )}
      </p>
    </StaticPage>
  );
}
