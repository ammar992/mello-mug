import { SOCIAL_KEYS, type ContactContent } from "@/lib/content/schema";

/** CafeOrCoffeeShop structured data built only from CMS-provided facts. */
export function JsonLd({ contact }: { contact: ContactContent }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: contact.businessName,
    description: contact.tagline || undefined,
    url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    address: contact.address || undefined,
    openingHours: contact.hours.map((h) => `${h.days} ${h.time}`),
    sameAs: SOCIAL_KEYS.map((k) => contact.socials[k]).filter(Boolean),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
