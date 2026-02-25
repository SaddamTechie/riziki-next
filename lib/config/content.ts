/**
 * Static page content — central place to edit copy for Delivery, FAQ, and About pages.
 *
 * Dynamic values (site name, contact email, WhatsApp number, social links) are
 * still pulled from site_config in the DB so the admin can change them.
 * Everything here is brand/operational copy that changes less frequently.
 *
 * When you're ready to make these DB-configurable, move the values to site_config
 * and read them via getSiteConfig() — no page changes required.
 */

// ─── Delivery ─────────────────────────────────────────────────────────────────

export interface DeliveryZone {
  title: string;
  description: string;
  items: string[];
}

export const DELIVERY_PAGE = {
  title: "Delivery Information",
  subtitle:
    "We deliver across Kenya and ship internationally. Here's everything you need to know.",

  zones: [
    {
      title: "Nairobi Delivery",
      description:
        "Orders placed before 12:00 noon on weekdays are dispatched same day and typically arrive within 1–2 business days. We deliver to all areas within Nairobi, including Westlands, Karen, Kilimani, Kasarani and surrounding estates.",
      items: [
        "Standard delivery: KES 300",
        "Express (same day): KES 500 — order before 10:00 am",
        "Free delivery on orders over KES 5,000",
      ],
    },
    {
      title: "Rest of Kenya",
      description:
        "We deliver to all major towns via our courier partners (G4S, Sendy, and DHL). Delivery typically takes 2–5 business days after dispatch.",
      items: ["Standard countrywide: KES 500", "Free on orders over KES 8,000"],
    },
    {
      title: "International Shipping",
      description:
        "We currently ship to Uganda, Tanzania, Rwanda, Ethiopia, and South Africa. International orders are dispatched within 2 business days and arrive in 5–10 business days depending on customs clearance.",
      items: [
        "East Africa: KES 1,500",
        "South Africa: KES 3,000",
        "Other destinations: contact us for a quote",
      ],
    },
    {
      title: "Order Tracking",
      description:
        "Once your order is dispatched you will receive an SMS and email with a tracking link. You can also monitor your order status from your account orders page.",
      items: [],
    },
  ] satisfies DeliveryZone[],

  footer: "Last updated: January 2026. Delivery fees are subject to change.",
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────

/**
 * FAQ items. Use {email} and {whatsapp} as placeholders — they are replaced
 * at render time with the values from site_config.
 */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "How do I track my order?",
    a: "Once your order is dispatched you'll receive an SMS and email with a tracking link. You can also view your order status from the My Orders section in your account.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "You can cancel or modify your order within 1 hour of placing it by contacting us at {email}. After that the order will have already been processed for dispatch.",
  },
  {
    q: "How long does delivery take?",
    a: "Nairobi orders typically arrive within 1–2 business days. Rest of Kenya 2–5 business days. International 5–10 business days. See our Delivery page for full details.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, Visa, Mastercard, and American Express. All card payments are processed securely.",
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
    a: "Visit our Size Guide for detailed measurements for clothing and footwear.",
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
    a: "Email {email} or WhatsApp {whatsapp}. We're available Monday–Friday 8am–6pm and Saturday 9am–3pm.",
  },
];

// ─── About ────────────────────────────────────────────────────────────────────

export interface AboutSection {
  heading: string;
  /** Paragraphs of text. Use {siteName} as a placeholder. */
  paragraphs?: string[];
  /** Bullet points (optional) */
  items?: { label: string; text: string }[];
}

export const ABOUT_PAGE: { sections: AboutSection[] } = {
  sections: [
    {
      heading: "Our Story",
      paragraphs: [
        "Riziki was founded in 2022 by a team of fashion-forward Kenyans who believed that world-class style should be accessible to everyone on the continent. The name Riziki — Swahili for livelihood and abundance — reflects our belief that dressing well is not a luxury, it is a form of self-expression and confidence.",
        "We started as a curated boutique in Westlands, Nairobi and quickly expanded online to reach customers across Kenya and the wider East African region. Today we carry over 500 styles across women, men and beauty categories.",
      ],
    },
    {
      heading: "Our Mission",
      paragraphs: [
        "We exist to make contemporary, trend-driven fashion accessible to every African consumer — from the busy professional in Nairobi CBD to the style-conscious student in Eldoret. Every product on {siteName} is hand-picked for quality, fit, and value.",
      ],
    },
    {
      heading: "Our Values",
      items: [
        {
          label: "Authenticity",
          text: "We only source from verified, reputable brands and designers, and every product is quality-checked before dispatch.",
        },
        {
          label: "Inclusivity",
          text: "Style has no size. We stock a wide range of sizes and are continually expanding our inclusive collection.",
        },
        {
          label: "Sustainability",
          text: "We are committed to reducing our carbon footprint through responsible sourcing, minimal packaging, and partnership with eco-conscious brands.",
        },
        {
          label: "Customer First",
          text: "From lightning-fast delivery to our 14-day no-hassle return policy, every decision we make starts with our customer.",
        },
      ],
    },
  ],
};

// ─── Terms of Service ─────────────────────────────────────────────────────────

export const TERMS_PAGE = {
  subtitle:
    "Last updated: 1 January 2025. Please read these terms carefully before using our website.",
  sections: [
    {
      heading: "1. Acceptance of Terms",
      body: "By accessing or using this website you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please stop using the website immediately.",
    },
    {
      heading: "2. Your Account",
      body: "You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. Notify us immediately of any unauthorised use.",
    },
    {
      heading: "3. Orders & Pricing",
      body: "All prices are displayed in the store currency inclusive of VAT unless stated otherwise. We reserve the right to cancel orders in the event of pricing errors or stock unavailability. You will be notified and refunded in full.",
    },
    {
      heading: "4. Intellectual Property",
      body: "All content on this website — including text, images, logos and design — is owned by or licensed to {siteName} and protected by copyright law. You may not reproduce or redistribute any content without our express written permission.",
    },
    {
      heading: "5. Limitation of Liability",
      body: "To the fullest extent permitted by law, {siteName} shall not be liable for indirect, incidental or consequential damages arising from your use of the website or any products purchased through it.",
    },
    {
      heading: "6. Governing Law",
      body: "These terms are governed by applicable law. Any disputes shall be resolved through the appropriate legal channels.",
    },
    {
      heading: "7. Changes to Terms",
      body: "We may update these terms from time to time. We will notify registered users by email of material changes. Continued use of the website constitutes acceptance of the updated terms.",
    },
  ] as { heading: string; body: string }[],
};

// ─── Privacy Policy ───────────────────────────────────────────────────────────

export const PRIVACY_PAGE = {
  subtitle:
    "Effective date: 1 January 2025. We respect your privacy and are committed to protecting your personal data.",
  /** How long we take to respond to data requests */
  dataRequestResponseDays: 30,
  sections: [
    {
      heading: "1. Information We Collect",
      body: "We collect information you provide directly (name, email, shipping address, payment details) and information generated through your use of our service (browsing history, purchase history, device identifiers and IP address).",
      items: [] as string[],
    },
    {
      heading: "2. How We Use Your Information",
      body: "",
      items: [
        "To fulfil and manage your orders",
        "To process payments securely",
        "To send order confirmations and shipping updates",
        "To send marketing emails (only with your consent — you can unsubscribe at any time)",
        "To improve our website and personalise your experience",
        "To detect and prevent fraudulent transactions",
      ],
    },
    {
      heading: "3. Sharing Your Data",
      body: "We do not sell your personal data. We share data with third-party service providers only as necessary to operate our business (payment processors, logistics partners, email service providers). All partners are contractually required to handle your data in accordance with applicable data protection laws.",
      items: [] as string[],
    },
    {
      heading: "4. Cookies",
      body: "We use essential cookies to keep you signed in and maintain your cart. We also use analytics cookies (with your consent) to understand how customers use our website. You can manage cookie preferences in your browser settings.",
      items: [] as string[],
    },
    {
      heading: "5. Your Rights",
      body: "You have the right to access, correct, delete, or export your personal data. Submit requests to {email}. We will respond within {dataRequestResponseDays} days.",
      items: [] as string[],
    },
    {
      heading: "6. Data Security",
      body: "We use industry-standard encryption (TLS 1.3) for all data in transit and at rest. We never store raw card numbers — all payment processing is handled by PCI DSS-compliant partners.",
      items: [] as string[],
    },
    {
      heading: "7. Contact",
      body: "For privacy-related questions contact our Data Protection Officer at {email}.",
      items: [] as string[],
    },
  ],
};

// ─── Sustainability ───────────────────────────────────────────────────────────

export const SUSTAINABILITY_PAGE = {
  subtitle:
    "Fashion should be beautiful and responsible. Here's how we're working towards a more sustainable future.",
  sections: [
    {
      heading: "Responsible Sourcing",
      body: "Every brand on {siteName} is evaluated against our supplier code of conduct, which requires fair wages, safe working conditions, and compliance with local labour laws. We conduct annual audits of our key suppliers and publish the results on request.",
      items: [] as string[],
    },
    {
      heading: "Eco-Friendly Packaging",
      body: "We use 100% recycled and recyclable packaging materials across all our deliveries. Our poly mailers are made from post-consumer recycled plastic and are fully recyclable at kerbside collection points. We removed single-use tissue paper in 2023, saving over 200,000 sheets per year.",
      items: [] as string[],
    },
    {
      heading: "Carbon-Conscious Logistics",
      body: "We offset 100% of the carbon emissions from our last-mile deliveries through verified reforestation projects. We are working towards fully electric last-mile delivery by 2027.",
      items: [] as string[],
    },
    {
      heading: "Our 2026 Commitments",
      body: "",
      items: [
        "50% of products to carry sustainability credentials",
        "Launch a pre-loved / resale section on the platform by Q3 2026",
        "Partner with local designers using locally sourced fabrics",
        "Achieve plastic-free packaging across all product categories",
      ],
    },
    {
      heading: "Got Feedback?",
      body: "We believe accountability requires transparency. If you have ideas, suggestions or concerns about our sustainability practices, email {email}.",
      items: [] as string[],
    },
  ],
};

// ─── Careers ─────────────────────────────────────────────────────────────────

export const CAREERS_PAGE = {
  subtitle:
    "We're building the future of fashion retail. Want to be part of it?",
  /** Benefits shown in the "Why join us?" section */
  benefits: [
    "Work on products used by fashion-conscious consumers across the region",
    "Competitive salaries benchmarked against local tech and retail market rates",
    "Flexible remote-first culture with optional hot-desking in our office",
    "Quarterly team retreats and a generous clothing allowance",
    "Clear growth paths and a learning budget of KES 50,000 p.a.",
  ],
  /** Open / speculative roles */
  roles: [
    "Brand & Marketing",
    "Buying & Merchandise",
    "Customer Experience",
    "Full-Stack Engineering (Next.js, React Native)",
    "Warehouse & Logistics",
  ],
  applicationNote:
    "Send your CV and a short note about why you want to work with us to {email}. We review every application and aim to respond within two weeks.",
};
