import { getContent } from "@/lib/content/get";
import { PagesEditor } from "./PagesEditor";

export const metadata = { title: "Page headings" };

export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = (await searchParams).lang === "mk" ? "mk" : "en";
  return <PagesEditor key={lang} lang={lang} initial={await getContent("pages", lang)} />;
}
