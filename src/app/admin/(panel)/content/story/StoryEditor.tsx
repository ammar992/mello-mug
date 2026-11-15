"use client";

import { ExternalLink } from "lucide-react";
import type { StoryContent } from "@/lib/content/schema";
import { LangTabs, ListEditor, SaveBar, useContentEditor } from "@/components/admin/editor";
import { ImageListField } from "@/components/admin/media";
import { Card, PageHeader, TextField } from "@/components/admin/ui";

export function StoryEditor({ initial, lang }: { initial: StoryContent; lang: "en" | "mk" }) {
  const { data, set, save, reset, dirty, saving, err, errorCount } = useContentEditor("story", initial, lang);
  return (
    <>
      <PageHeader
        title="Our story"
        description="Tell visitors who you are. Changes go live when you save."
        actions={<a href={lang === "mk" ? "/mk/about" : "/about"} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium hover:bg-mist"><ExternalLink className="size-4" /> Preview</a>}
      />
      <LangTabs lang={lang} basePath="/admin/content/story" />
      <div className="space-y-6">
        <Card title="Story text">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Small label" value={data.eyebrow} onChange={(v) => set(["eyebrow"], v)} max={60} />
            <TextField label="Heading" required value={data.heading} onChange={(v) => set(["heading"], v)} max={140} error={err("heading")} />
          </div>
          <TextField label="Introduction" multiline rows={2} value={data.intro} onChange={(v) => set(["intro"], v)} max={500} hint="Shown larger, in coffee brown." />
          <TextField label="Brand story" multiline rows={6} value={data.body} onChange={(v) => set(["body"], v)} max={2500} />
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <TextField label="Quote" multiline rows={2} value={data.quote} onChange={(v) => set(["quote"], v)} max={240} />
            <TextField label="Quote by" value={data.quoteAuthor} onChange={(v) => set(["quoteAuthor"], v)} max={80} />
          </div>
        </Card>
        {lang === "en" && (
        <Card title="Photos" description="The first photo is shown large; the second overlaps it. The first is also used near the map when no address is set.">
          <ImageListField label="Story photos" value={data.images} onChange={(v) => set(["images"], v)} max={3} />
        </Card>
        )}
        <Card title="What we care about" description="Up to 4 short value cards under the story.">
          <ListEditor
            items={data.values}
            onChange={(v) => set(["values"], v)}
            create={() => ({ title: "", description: "" })}
            itemLabel={(x) => x.title}
            max={4}
            addLabel="Add value"
            render={(x, update, i) => (
              <>
                <TextField label="Title" required value={x.title} onChange={(title) => update({ title })} max={60} error={err("values", i, "title")} />
                <TextField label="Description" multiline rows={2} value={x.description} onChange={(description) => update({ description })} max={240} />
              </>
            )}
          />
        </Card>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} errorCount={errorCount} />
    </>
  );
}
