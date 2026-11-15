"use client";

import { ExternalLink } from "lucide-react";
import { SOCIAL_KEYS, type ContactContent } from "@/lib/content/schema";
import { SOCIAL_LABELS, SocialIcon } from "@/components/site/Social";
import { LangTabs, ListEditor, SaveBar, useContentEditor } from "@/components/admin/editor";
import { Card, PageHeader, TextField } from "@/components/admin/ui";

export function ContactEditor({ initial, lang }: { initial: ContactContent; lang: "en" | "mk" }) {
  const { data, set, save, reset, dirty, saving, err, errorCount } = useContentEditor("contact", initial, lang);
  return (
    <>
      <PageHeader
        title="Hours, location & footer"
        description="Used across the whole website — header, location section and footer."
        actions={<a href={lang === "mk" ? "/mk/visit" : "/visit"} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium hover:bg-mist"><ExternalLink className="size-4" /> Preview</a>}
      />
      <LangTabs lang={lang} basePath="/admin/content/contact" />
      <div className="space-y-6">
        <Card title="Opening hours" description="Today's row is highlighted automatically on the website (use day names like “Monday – Friday”, “Saturday”, “Weekends”).">
          <ListEditor
            items={data.hours}
            onChange={(v) => set(["hours"], v)}
            create={() => ({ days: "", time: "" })}
            itemLabel={(h) => (h.days ? `${h.days} · ${h.time}` : "")}
            max={10}
            addLabel="Add hours row"
            render={(h, update, i) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField label="Days" required value={h.days} onChange={(days) => update({ days })} max={40} placeholder="Monday – Friday" error={err("hours", i, "days")} />
                <TextField label="Open – close" required value={h.time} onChange={(time) => update({ time })} max={40} placeholder="7:00 AM – 7:00 PM" error={err("hours", i, "time")} />
              </div>
            )}
          />
          <TextField label="Note under hours" value={data.hoursNote} onChange={(v) => set(["hoursNote"], v)} max={160} placeholder="e.g. Closed on public holidays" />
        </Card>

        <Card title="Contact & business">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Business name" required value={data.businessName} onChange={(v) => set(["businessName"], v)} max={60} error={err("businessName")} />
            {lang === "en" && <TextField label="Currency symbol" required value={data.currency} onChange={(v) => set(["currency"], v)} max={4} error={err("currency")} hint="Shown before every menu price, e.g. $, €, ден" />}
          </div>
          <TextField label="Tagline" value={data.tagline} onChange={(v) => set(["tagline"], v)} max={160} />
          {lang === "en" && <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Phone number" type="tel" value={data.phone} onChange={(v) => set(["phone"], v)} error={err("phone")} hint="Powers every click-to-call button." />
            <TextField label="Email" type="email" value={data.email} onChange={(v) => set(["email"], v)} error={err("email")} hint="Powers the click-to-email button." />
          </div>}
        </Card>

        <Card title="Location & map">
          <TextField label="Shop address" value={data.address} onChange={(v) => set(["address"], v)} max={300} placeholder="12 Bean Street, Your City" />
          {lang === "en" && (
            <>
          <TextField label="Map search (optional)" value={data.mapQuery} onChange={(v) => set(["mapQuery"], v)} max={300} hint="What to search on Google Maps, e.g. “Mellow Mug, Your City”. Leave empty to use the address." />
          <TextField
            label="Google Maps embed link (optional)"
            type="url"
            value={data.mapEmbedUrl}
            onChange={(v) => set(["mapEmbedUrl"], v)}
            error={err("mapEmbedUrl")}
            hint="Most precise option: Google Maps → Share → Embed a map → copy only the https://www.google.com/maps/embed?... link from the code."
          />
            </>
          )}
        </Card>

        {lang === "en" && (
        <Card title="Social media" description="Paste full links. Empty ones are hidden.">
          <div className="grid gap-4 sm:grid-cols-2">
            {SOCIAL_KEYS.map((k) => (
              <div key={k} className="flex items-end gap-3">
                <span className="mb-2.5 text-slate"><SocialIcon name={k} /></span>
                <div className="flex-1">
                  <TextField label={SOCIAL_LABELS[k]} type="url" value={data.socials[k]} onChange={(v) => set(["socials", k], v)} error={err("socials", k)} placeholder="https://" />
                </div>
              </div>
            ))}
          </div>
        </Card>
        )}

        <Card title="Footer">
          <TextField label="Footer text" multiline rows={2} value={data.footerText} onChange={(v) => set(["footerText"], v)} max={300} />
          <TextField label="Small note (bottom right)" value={data.footerNote} onChange={(v) => set(["footerNote"], v)} max={160} />
        </Card>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} errorCount={errorCount} />
    </>
  );
}
