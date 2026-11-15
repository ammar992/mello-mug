import { getContent } from "@/lib/content/get";
import { ContactEditor } from "./ContactEditor";

export const metadata = { title: "Hours, location & footer" };

export default async function Page({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const lang = (await searchParams).lang === "mk" ? "mk" : "en";
  return <ContactEditor key={lang} lang={lang} initial={await getContent("contact", lang)} />;
}
