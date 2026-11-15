import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/get";
import { PageHero } from "@/components/sections/PageHero";
import { VisitPage } from "@/components/sections/VisitPage";
import { JsonLd } from "@/components/site/JsonLd";
import { getDict, isLang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const pages = await getContent("pages", lang);
  return { title: getDict(lang).nav.visit, description: pages.visit.description || undefined };
}

export default async function Visit({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const [pages, contact] = await Promise.all([getContent("pages", lang), getContent("contact", lang)]);
  return (
    <>
      <JsonLd contact={contact} />
      <PageHero crumb={t.nav.visit} eyebrow={pages.visit.eyebrow} heading={pages.visit.heading} description={pages.visit.description} lang={lang} t={t} />
      <VisitPage contact={contact} t={t} />
    </>
  );
}
