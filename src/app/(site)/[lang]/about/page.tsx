import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContent, getTeam } from "@/lib/content/get";
import { PageHero } from "@/components/sections/PageHero";
import { StorySection, TeamSection } from "@/components/sections/HomeSections";
import { getDict, isLang } from "@/lib/i18n";

type P = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const pages = await getContent("pages", lang);
  return { title: getDict(lang).nav.about, description: pages.about.description || undefined };
}

export default async function AboutPage({ params }: P) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const [pages, home, story, team] = await Promise.all([getContent("pages", lang), getContent("home", lang), getContent("story", lang), getTeam(lang)]);
  return (
    <>
      <PageHero crumb={t.nav.about} eyebrow={pages.about.eyebrow} heading={pages.about.heading} description={pages.about.description} lang={lang} t={t} />
      <StorySection story={story} />
      <TeamSection content={home.team} team={team} />
    </>
  );
}
