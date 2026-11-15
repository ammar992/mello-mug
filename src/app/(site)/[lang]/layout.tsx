import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../../globals.css";
import { fontVars } from "@/lib/fonts";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { getContent } from "@/lib/content/get";
import { getDict, isLang, LANG_LABELS, LOCALES } from "@/lib/i18n";

export const revalidate = 3600; // CMS saves revalidate instantly; this is a safety net
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const contact = await getContent("contact", lang);
  const name = contact.businessName;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${name} — ${contact.tagline || "Coffee House"}`, template: `%s — ${name}` },
    description: contact.footerText || contact.tagline,
    openGraph: { type: "website", siteName: name, locale: LANG_LABELS[lang].ogLocale },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#24150e", width: "device-width", initialScale: 1 };

export default async function SiteRootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const contact = await getContent("contact", lang);
  const t = getDict(lang);

  return (
    <html lang={LANG_LABELS[lang].htmlLang} className={fontVars}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-foam focus:px-4 focus:py-2">
          {t.skip}
        </a>
        <SmoothScroll />
        <ScrollProgress />
        <SiteHeader businessName={contact.businessName} phone={contact.phone} lang={lang} t={t} />
        <main id="main">{children}</main>
        <SiteFooter contact={contact} lang={lang} t={t} />
      </body>
    </html>
  );
}
