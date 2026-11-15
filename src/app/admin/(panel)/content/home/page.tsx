import { getContent } from "@/lib/content/get";
import { HomeEditor } from "./HomeEditor";

export const metadata = { title: "Homepage" };

export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = (await searchParams).lang === "mk" ? "mk" : "en";
  return <HomeEditor key={lang} lang={lang} initial={await getContent("home", lang)} />;
}
