import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";
import { getSiteConfig } from "@/lib/config/site";
import { FAQ_ITEMS } from "@/lib/config/content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about orders, delivery, returns and your account.",
};

export default async function FaqPage() {
  const config = await getSiteConfig();
  const email = config.contactEmail ?? "support@example.com";
  const whatsapp = config.whatsappNumber
    ? `+${config.whatsappNumber}`
    : "WhatsApp";

  // Replace {email} and {whatsapp} placeholders with live values from site_config
  const faqs = FAQ_ITEMS.map(({ q, a }) => ({
    q,
    a: a.replace(/\{email\}/g, email).replace(/\{whatsapp\}/g, whatsapp),
  }));

  return (
    <StaticPage
      title="Frequently Asked Questions"
      subtitle={`Can't find what you're looking for? Email us at ${email}`}
    >
      <div className="divide-y">
        {faqs.map(({ q, a }) => (
          <div key={q} className="py-5">
            <p className="font-semibold">{q}</p>
            <p className="mt-1.5 text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
