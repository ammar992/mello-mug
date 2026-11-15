"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { ContentKey, ContentMap } from "@/lib/content/schema";
import { ApiError, api, setIn } from "./client";
import { Btn } from "./ui";

/* ── useContentEditor ──────────────────────────────────── */

/* ── language tabs for content editors ─────────────────── */

export function LangTabs({ lang, basePath }: { lang: "en" | "mk"; basePath: string }) {
  const tabs = [
    { id: "en", label: "English", short: "EN" },
    { id: "mk", label: "Македонски", short: "МК" },
  ] as const;
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-2 sm:flex-row sm:items-center sm:justify-between">
      <div role="tablist" aria-label="Language" className="flex gap-1">
        {tabs.map((t) => (
          <a
            key={t.id}
            role="tab"
            aria-selected={lang === t.id}
            href={t.id === "en" ? basePath : `${basePath}?lang=${t.id}`}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${lang === t.id ? "bg-navy text-paper" : "text-slate hover:bg-mist"}`}
          >
            <span className={`rounded-md px-1.5 py-0.5 text-[0.68rem] font-bold tracking-wider ${lang === t.id ? "bg-white/15" : "bg-mist"}`}>{t.short}</span>
            {t.label}
          </a>
        ))}
      </div>
      <p className="px-3 text-xs text-slate">
        {lang === "en" ? "Default language." : "Empty fields show the English text. Photos, phone, map & links are shared with English."}
      </p>
    </div>
  );
}

export function useContentEditor<K extends ContentKey>(key: K, initial: ContentMap[K], lang: "en" | "mk" = "en") {
  const [data, setData] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dirty = useMemo(() => JSON.stringify(data) !== saved, [data, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = useCallback((path: (string | number)[], value: unknown) => {
    setData((d) => setIn(d, path, value));
    const p = path.join(".");
    setErrors((e) => {
      if (!e[p]) return e;
      const { [p]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await api<{ data: ContentMap[K] }>(`/api/admin/content/${key}${lang === "en" ? "" : `?lang=${lang}`}`, { method: "PUT", json: data });
      setData(res.data);
      setSaved(JSON.stringify(res.data));
      setErrors({});
      toast.success(lang === "en" ? "Changes saved and published" : "Macedonian version saved and published");
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) setErrors(e.fieldErrors);
      toast.error(e instanceof Error ? e.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  }, [data, key, lang]);

  const reset = useCallback(() => {
    setData(JSON.parse(saved));
    setErrors({});
  }, [saved]);

  const err = useCallback((...path: (string | number)[]) => errors[path.join(".")], [errors]);

  return { data, set, save, reset, dirty, saving, err, errorCount: Object.keys(errors).length };
}

/* ── Save bar ──────────────────────────────────────────── */

export function SaveBar({ dirty, saving, onSave, onReset, errorCount = 0 }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void; errorCount?: number }) {
  // Ctrl/Cmd + S to save
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !saving) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, saving, onSave]);

  return (
    <AnimatePresence>
      {(dirty || errorCount > 0) && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 lg:left-[calc(17rem+1.5rem)] lg:right-6"
        >
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-2xl bg-navy px-4 py-3 text-paper shadow-2xl sm:px-5">
            <p className="text-sm">
              {errorCount > 0 ? (
                <span className="text-orange">Please fix {errorCount} field{errorCount > 1 ? "s" : ""} highlighted below.</span>
              ) : (
                <>
                  <span className="mr-2 inline-block size-2 rounded-full bg-orange align-middle" />
                  Unsaved changes
                </>
              )}
            </p>
            <div className="flex gap-2">
              <Btn variant="ghost" className="text-paper/70 hover:bg-white/10 hover:text-paper" onClick={onReset} disabled={saving}>
                Discard
              </Btn>
              <Btn onClick={onSave} loading={saving}>Save changes</Btn>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── List editor ───────────────────────────────────────── */

export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  itemLabel,
  max = 12,
  addLabel = "Add item",
  emptyText = "Nothing here yet.",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  create: () => T;
  itemLabel: (item: T, index: number) => string;
  max?: number;
  addLabel?: string;
  emptyText?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const update = (i: number) => (patch: Partial<T>) =>
    onChange(items.map((it, k) => (k === i ? ({ ...(it as object), ...(patch as object) } as T) : it)));
  const move = (from: number, to: number) => {
    const copy = [...items];
    const [x] = copy.splice(from, 1);
    copy.splice(to, 0, x);
    onChange(copy);
    setOpen(to);
  };

  return (
    <div>
      {items.length === 0 && <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-slate">{emptyText}</p>}
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="overflow-hidden rounded-xl border border-line bg-paper">
            <div className="flex items-center gap-2 px-3 py-2">
              <GripVertical className="size-4 shrink-0 text-slate/40" aria-hidden />
              <button type="button" className="min-w-0 flex-1 truncate py-1.5 text-left text-sm font-medium text-navy" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span className="mr-2 font-mono text-xs text-slate">{String(i + 1).padStart(2, "0")}</span>
                {itemLabel(item, i) || <span className="text-slate">Untitled</span>}
              </button>
              <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded p-1.5 text-slate hover:bg-white disabled:opacity-30" aria-label="Move up">
                <ChevronUp className="size-4" />
              </button>
              <button type="button" disabled={i === items.length - 1} onClick={() => move(i, i + 1)} className="rounded p-1.5 text-slate hover:bg-white disabled:opacity-30" aria-label="Move down">
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange(items.filter((_, k) => k !== i));
                  setOpen(null);
                }}
                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {open === i && <div className="space-y-4 border-t border-line bg-white p-4">{render(item, update(i), i)}</div>}
          </li>
        ))}
      </ul>
      {items.length < max && (
        <Btn
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => {
            onChange([...items, create()]);
            setOpen(items.length);
          }}
        >
          <Plus className="size-4" /> {addLabel}
        </Btn>
      )}
    </div>
  );
}
