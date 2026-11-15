import { notFound } from "next/navigation";
import { getContent, getMenu } from "@/lib/content/get";
import { BestsellersSection, Hero, MenuPreview, StoryTeaser, Ticker, VisitSection } from "@/components/sections/HomeSections";
import { BrewingScene } from "@/components/sections/BrewingScene";
import { JsonLd } from "@/components/site/JsonLd";
import { getDict, isLang } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const [home, story, contact, menu] = await Promise.all([getContent("home", lang), getContent("story", lang), getContent("contact", lang), getMenu(lang)]);
  const bestsellers = menu.items.filter((i) => i.bestseller);
  return (
    <>
      <JsonLd contact={contact} />
      <Hero hero={home.hero} star={bestsellers[0]} currency={contact.currency} lang={lang} t={t} />
      <Ticker words={home.ticker} />
      <BrewingScene brewing={home.brewing} />
      <MenuPreview content={home.featured} categories={menu.categories} items={menu.items} currency={contact.currency} lang={lang} t={t} />
      <BestsellersSection content={home.bestsellers} items={bestsellers} currency={contact.currency} />
      <StoryTeaser story={story} lang={lang} t={t} />
      <VisitSection content={home.visit} contact={contact} fallbackImage={story.images[0]} t={t} />
    </>
  );
}
