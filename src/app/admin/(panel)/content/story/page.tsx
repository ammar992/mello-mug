import { getContent } from "@/lib/content/get";
import { StoryEditor } from "./StoryEditor";

export const metadata = { title: "Our story" };

export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = (await searchParams).lang === "mk" ? "mk" : "en";
  return <StoryEditor key={lang} lang={lang} initial={await getContent("story", lang)} />;
}
