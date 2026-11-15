"use client";

import { ExternalLink } from "lucide-react";
import type { HomeContent } from "@/lib/content/schema";
import { LangTabs, ListEditor, SaveBar, useContentEditor } from "@/components/admin/editor";
import { Card, PageHeader, TextField } from "@/components/admin/ui";

const SECTIONS = [
  { key: "featured", title: "Menu preview section", note: "Featured items shown on the homepage." },
  { key: "bestsellers", title: "Best sellers section", note: "Items marked as best sellers appear here." },
  { key: "team", title: "Team section", note: "Team members are managed under Team." },
  { key: "visit", title: "Visit / location section", note: "Address, hours and map are under Hours, location & footer." },
] as const;

export function HomeEditor({ initial, lang }: { initial: HomeContent; lang: "en" | "mk" }) {
  const { data, set, save, reset, dirty, saving, err, errorCount } = useContentEditor("home", initial, lang);

  return (
    <>
      <PageHeader
        title="Homepage"
        description="Headings and text shown across the homepage. Changes go live when you save."
        actions={<a href={lang === "mk" ? "/mk" : "/"} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium hover:bg-mist"><ExternalLink className="size-4" /> Preview</a>}
      />
      <LangTabs lang={lang} basePath="/admin/content/home" />
      <div className="space-y-6">
        <Card title="Hero" description="The first thing visitors see, next to the 3D coffee cup.">
          <TextField label="Small label above heading" value={data.hero.eyebrow} onChange={(v) => set(["hero", "eyebrow"], v)} max={80} />
          <TextField label="Heading" required multiline rows={2} value={data.hero.heading} onChange={(v) => set(["hero", "heading"], v)} max={140} error={err("hero", "heading")} hint="Press Enter for a second line — it appears in italic caramel." />
          <TextField label="Description" multiline rows={3} value={data.hero.description} onChange={(v) => set(["hero", "description"], v)} max={400} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Main button" required value={data.hero.primaryCtaLabel} onChange={(v) => set(["hero", "primaryCtaLabel"], v)} max={30} error={err("hero", "primaryCtaLabel")} hint="Opens the Menu page." />
            <TextField label="Second button" required value={data.hero.secondaryCtaLabel} onChange={(v) => set(["hero", "secondaryCtaLabel"], v)} max={30} error={err("hero", "secondaryCtaLabel")} hint="Opens the Visit page." />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-navy">Small highlights under the buttons</p>
            <ListEditor
              items={data.hero.badges.map((text) => ({ text }))}
              onChange={(v) => set(["hero", "badges"], v.map((x) => x.text))}
              create={() => ({ text: "" })}
              itemLabel={(x) => x.text}
              max={4}
              addLabel="Add highlight"
              render={(x, update) => <TextField label="Highlight" value={x.text} onChange={(text) => update({ text })} max={40} />}
            />
          </div>
        </Card>

        <Card title="Scrolling words" description="The dark band of words that scrolls under the hero.">
          <ListEditor
            items={data.ticker.map((text) => ({ text }))}
            onChange={(v) => set(["ticker"], v.map((x) => x.text))}
            create={() => ({ text: "" })}
            itemLabel={(x) => x.text}
            max={12}
            addLabel="Add word"
            render={(x, update) => <TextField label="Word" value={x.text} onChange={(text) => update({ text })} max={40} />}
          />
        </Card>

        <Card title="Bean-to-cup animation" description="Captions for the 7 scroll steps (beans → grinder → machine → water → pour → steam → final cup).">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Small label" value={data.brewing.eyebrow} onChange={(v) => set(["brewing", "eyebrow"], v)} max={60} />
            <TextField label="Heading" required value={data.brewing.heading} onChange={(v) => set(["brewing", "heading"], v)} max={120} error={err("brewing", "heading")} />
          </div>
          <ol className="space-y-3">
            {data.brewing.steps.map((st, i) => (
              <li key={i} className="grid gap-3 rounded-xl border border-line bg-paper p-4 sm:grid-cols-[40px_1fr_2fr] sm:items-start">
                <span className="font-display text-2xl text-blue">{String(i + 1).padStart(2, "0")}</span>
                <TextField label="Title" required value={st.title} onChange={(v) => set(["brewing", "steps", i, "title"], v)} max={60} error={err("brewing", "steps", i, "title")} />
                <TextField label="Description" value={st.description} onChange={(v) => set(["brewing", "steps", i, "description"], v)} max={220} />
              </li>
            ))}
          </ol>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Final heading" required value={data.brewing.finalHeading} onChange={(v) => set(["brewing", "finalHeading"], v)} max={100} error={err("brewing", "finalHeading")} />
            <TextField label="Final welcome message" value={data.brewing.finalMessage} onChange={(v) => set(["brewing", "finalMessage"], v)} max={240} />
          </div>
        </Card>

        {SECTIONS.map((s) => (
          <Card key={s.key} title={s.title} description={s.note}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Small label" value={data[s.key].eyebrow} onChange={(v) => set([s.key, "eyebrow"], v)} max={60} />
              <TextField label="Heading" required value={data[s.key].heading} onChange={(v) => set([s.key, "heading"], v)} max={120} error={err(s.key, "heading")} />
            </div>
            <TextField label="Description" multiline rows={2} value={data[s.key].description} onChange={(v) => set([s.key, "description"], v)} max={300} />
            {s.key === "featured" && (
              <TextField label="Button label" required value={data.featured.ctaLabel} onChange={(v) => set(["featured", "ctaLabel"], v)} max={40} error={err("featured", "ctaLabel")} hint="Links to the full Menu page." />
            )}
          </Card>
        ))}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} errorCount={errorCount} />
    </>
  );
}
