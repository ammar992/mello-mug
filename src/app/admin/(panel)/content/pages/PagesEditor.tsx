"use client";

import { ExternalLink } from "lucide-react";
import type { PagesContent } from "@/lib/content/schema";
import { LangTabs, SaveBar, useContentEditor } from "@/components/admin/editor";
import { Card, PageHeader, TextField } from "@/components/admin/ui";

const PAGES = [
  { key: "menu", title: "Menu page", path: "/menu" },
  { key: "about", title: "About page", path: "/about" },
  { key: "visit", title: "Visit page", path: "/visit" },
] as const;

export function PagesEditor({ initial, lang }: { initial: PagesContent; lang: "en" | "mk" }) {
  const { data, set, save, reset, dirty, saving, err, errorCount } = useContentEditor("pages", initial, lang);
  return (
    <>
      <PageHeader title="Page headings" description="The large heading at the top of the Menu, About and Visit pages." />
      <LangTabs lang={lang} basePath="/admin/content/pages" />
      <div className="space-y-6">
        {PAGES.map((p) => (
          <Card
            key={p.key}
            title={p.title}
            actions={<a href={lang === "mk" ? `/mk${p.path}` : p.path} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium hover:bg-mist"><ExternalLink className="size-4" /> Preview</a>}
          >
            <TextField label="Small label" value={data[p.key].eyebrow} onChange={(v) => set([p.key, "eyebrow"], v)} max={60} />
            <TextField label="Heading" required multiline rows={2} value={data[p.key].heading} onChange={(v) => set([p.key, "heading"], v)} max={120} error={err(p.key, "heading")} hint="Press Enter for a second line — it appears in italic caramel." />
            <TextField label="Description" multiline rows={2} value={data[p.key].description} onChange={(v) => set([p.key, "description"], v)} max={400} />
          </Card>
        ))}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} errorCount={errorCount} />
    </>
  );
}
