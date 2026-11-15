import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent, getMenu } from "@/lib/content/get";
import { PageHero } from "@/components/sections/PageHero";
import { MenuGrid } from "@/components/sections/MenuSection";
import { BestsellersSection } from "@/components/sections/HomeSections";
import { getDict, isLang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const pages = await getContent("pages", lang);
  return { title: getDict(lang).nav.menu, description: pages.menu.description || undefined };
}

export default async function MenuPage({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const [pages, home, contact, menu] = await Promise.all([getContent("pages", lang), getContent("home", lang), getContent("contact", lang), getMenu(lang)]);
  return (
    <>
      <PageHero crumb={t.nav.menu} eyebrow={pages.menu.eyebrow} heading={pages.menu.heading} description={pages.menu.description} lang={lang} t={t} />
      <section className="bg-cream pb-24 lg:pb-32">
        <div className="container-x">
          {menu.items.length ? (
            <MenuGrid categories={menu.categories} items={menu.items} currency={contact.currency} defaultTab="all" t={t} />
          ) : (
            <p className="text-muted">{t.menuUpdating}</p>
          )}
        </div>
      </section>
      <BestsellersSection content={home.bestsellers} items={menu.items.filter((i) => i.bestseller)} currency={contact.currency} />
    </>
  );
}
