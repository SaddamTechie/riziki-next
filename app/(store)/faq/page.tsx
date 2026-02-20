import type { Metadata } from "next";
import { StaticPage } from "@/components/ui/static-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about orders, delivery, returns and your account.",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "How do I track my order?",
    a: "Once your order is dispatched you'll receive an SMS and email with a tracking link. You can also view your order status from the My Orders section in your account.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "You can cancel or modify your order within 1 hour of placing it by contacting us at support@riziki.co.ke. After that the order will have already been processed for dispatch.",
  },
  {
    q: "How long does delivery take?",
    a: "Nairobi orders typically arrive within 1–2 business days. Rest of Kenya 2–5 business days. International 5–10 business days. See our Delivery page for full details.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, Visa, Mastercard, and American Express. All card payments are processed securely via Stripe.",
  },
  {
    q: "Can I return a sale item?",
    a: "Items marked as Final Sale are not eligible for returns. Other sale items follow our standard 14-day returns policy.",
  },
  {
    q: "Do you offer gift wrapping?",
    a: "Yes! Add a note during checkout to request gift wrapping (KES 200). We'll include a handwritten card with your message.",
  },
  {
    q: "How do I find my size?",
    a: "Visit our Size Guide for detailed measurements for women's and men's clothing and footwear.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. We never store your card details. All transactions are encrypted and processed by PCI DSS-compliant payment providers.",
  },
  {
    q: "Do you have a physical store?",
    a: "We currently operate online only. However we have a showroom in Westlands, Nairobi by appointment — email us to schedule a visit.",
  },
  {
    q: "How do I contact customer support?",
    a: "Email support@riziki.co.ke or WhatsApp +254 700 000000. We're available Monday–Friday 8am–6pm and Saturday 9am–3pm.",
  },
];

export default function FaqPage() {
  return (
    <StaticPage
      title="Frequently Asked Questions"
      subtitle="Can't find what you're looking for? Email us at support@riziki.co.ke"
    >
      <div className="divide-y">
        {FAQS.map(({ q, a }) => (
          <div key={q} className="py-5">
            <p className="font-semibold">{q}</p>
            <p className="mt-1.5 text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
}
