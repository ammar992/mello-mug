"use client";

import Image from "next/image";
import { Check, ImagePlus, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ImageValue } from "@/lib/content/schema";
import type { MediaDTO } from "@/lib/media";
import { api, MAX_UPLOAD_MB, uploadImage } from "./client";
import { useConfirm } from "./Confirm";
import { Btn, EmptyState, Modal, Spinner, TextField } from "./ui";
import { cn } from "@/lib/utils";

/* ── data hook ──────────────────────────────────────────── */

export function useMediaLibrary(enabled = true) {
  const [items, setItems] = useState<MediaDTO[] | null>(null);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    api<{ data: MediaDTO[] }>("/api/admin/media")
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data);
        setError("");
      })
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load images"));
    return () => {
      cancelled = true;
    };
  }, [enabled, version]);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { items, setItems, error, reload };
}

/* ── dropzone ───────────────────────────────────────────── */

export function UploadDropzone({ onUploaded, multiple = true, compact }: { onUploaded: (m: MediaDTO) => void; multiple?: boolean; compact?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState<{ name: string; pct: number }[]>([]);

  async function handle(files: FileList | File[]) {
    const list = Array.from(files).slice(0, multiple ? 10 : 1);
    for (const file of list) {
      setProgress((p) => [...p, { name: file.name, pct: 0 }]);
      try {
        const m = await uploadImage(file, (pct) => setProgress((p) => p.map((x) => (x.name === file.name ? { ...x, pct } : x))));
        onUploaded(m);
        toast.success(`Uploaded ${file.name}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setProgress((p) => p.filter((x) => x.name !== file.name));
      }
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files.length) void handle(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors",
        compact ? "px-4 py-6" : "px-6 py-10",
        drag ? "border-blue bg-blue-50" : "border-line bg-paper",
      )}
    >
      <UploadCloud className="size-8 text-blue" aria-hidden />
      <p className="mt-3 text-sm font-medium text-navy">Drag & drop images here</p>
      <p className="mt-1 text-xs text-slate">JPG, PNG, WebP or AVIF · up to {MAX_UPLOAD_MB} MB</p>
      <Btn variant="secondary" size="sm" className="mt-4" onClick={() => input.current?.click()}>
        <ImagePlus className="size-4" /> Choose file{multiple ? "s" : ""}
      </Btn>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) void handle(e.target.files);
          e.target.value = "";
        }}
      />
      {progress.length > 0 && (
        <ul className="mt-4 w-full max-w-sm space-y-2 text-left">
          {progress.map((p) => (
            <li key={p.name} className="text-xs text-slate">
              <div className="flex justify-between"><span className="truncate">{p.name}</span><span>{p.pct}%</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist">
                <div className="h-full bg-blue transition-[width]" style={{ width: `${p.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── picker modal ───────────────────────────────────────── */

export function MediaPicker({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (m: MediaDTO) => void }) {
  const { items, setItems, error, reload } = useMediaLibrary(open);
  const [selected, setSelected] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const confirm = useConfirm();

  async function remove(m: MediaDTO) {
    const ok = await confirm({
      title: "Delete this image?",
      message: "It will be permanently removed from your media library and Cloudinary. Pages still using it will show an empty image until you pick another.",
      confirmLabel: "Delete image",
      danger: true,
    });
    if (!ok) return;
    setDeleting(m.id);
    try {
      await api(`/api/admin/media/${m.id}`, { method: "DELETE" });
      setItems((list) => list?.filter((x) => x.id !== m.id) ?? null);
      if (selected === m.id) setSelected(null);
      toast.success("Image deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  const close = () => {
    setSelected(null);
    onClose();
  };

  const choose = () => {
    const m = items?.find((i) => i.id === selected);
    if (m) {
      onSelect(m);
      close();
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Choose an image"
      size="xl"
      footer={
        <>
          <Btn variant="secondary" onClick={close}>Cancel</Btn>
          <Btn onClick={choose} disabled={!selected}>Use selected image</Btn>
        </>
      }
    >
      <UploadDropzone
        compact
        onUploaded={(m) => {
          setItems((prev) => [m, ...(prev ?? [])]);
          setSelected(m.id);
        }}
      />
      <div className="mt-5">
        {error ? (
          <div className="text-sm text-red-600">{error} <button className="underline" onClick={reload}>Retry</button></div>
        ) : !items ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate">No images yet — upload one above.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((m) => (
              <li key={m.id} className="group/tile relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    void remove(m);
                  }}
                  disabled={deleting === m.id}
                  className="absolute left-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-lg bg-white/95 text-red-600 shadow-md transition hover:bg-red-600 hover:text-white focus-visible:opacity-100 sm:opacity-0 sm:group-hover/tile:opacity-100"
                  aria-label={`Delete ${m.originalName || "image"} from library`}
                  title="Delete from library"
                >
                  {deleting === m.id ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(m.id)}
                  onDoubleClick={() => {
                    onSelect(m);
                    close();
                  }}
                  className={cn(
                    "group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-mist transition",
                    selected === m.id ? "border-blue ring-4 ring-blue/15" : "border-transparent hover:border-line",
                  )}
                  aria-pressed={selected === m.id}
                  aria-label={m.originalName || m.publicId}
                >
                  <Image src={m.url} alt="" fill sizes="200px" className="object-cover" />
                  {selected === m.id && (
                    <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-blue text-white">
                      <Check className="size-4" />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

/* ── single image field ─────────────────────────────────── */

export function ImageField({ label, value, onChange, hint, aspect = "aspect-[16/10]" }: { label: string; value: ImageValue; onChange: (v: ImageValue) => void; hint?: string; aspect?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-navy">{label}</p>
      <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
        <div className={cn("relative overflow-hidden rounded-xl border border-line bg-mist", aspect)}>
          {value.url ? (
            <Image src={value.url} alt={value.alt} fill sizes="240px" className="object-cover" />
          ) : (
            <button type="button" onClick={() => setOpen(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-slate hover:text-blue">
              <ImagePlus className="size-6" /> Add image
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Btn variant="secondary" size="sm" onClick={() => setOpen(true)}>
              {value.url ? <><RefreshCw className="size-4" /> Replace</> : <><ImagePlus className="size-4" /> Choose image</>}
            </Btn>
            {value.url && (
              <Btn variant="ghost" size="sm" onClick={() => onChange({ url: "", publicId: "", alt: value.alt })}>
                <Trash2 className="size-4" /> Remove
              </Btn>
            )}
          </div>
          <TextField label="Alt text" value={value.alt} onChange={(alt) => onChange({ ...value, alt })} max={200} hint={hint ?? "Describe the image for screen readers and SEO."} />
        </div>
      </div>
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(m) => onChange({ url: m.url, publicId: m.publicId, alt: value.alt || m.originalName.replace(/\.[a-z]+$/i, "") })} />
    </div>
  );
}

/* ── multiple images (hero) ─────────────────────────────── */

export function ImageListField({ label, value, onChange, max = 6, hint }: { label: string; value: ImageValue[]; onChange: (v: ImageValue[]) => void; max?: number; hint?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-navy">{label}</p>
        <span className="font-mono text-xs text-slate">{value.length}/{max}</span>
      </div>
      {hint && <p className="-mt-1 mb-3 text-xs text-slate">{hint}</p>}
      {value.length === 0 ? (
        <EmptyState title="No images" action={<Btn size="sm" variant="secondary" onClick={() => setOpen(true)}><ImagePlus className="size-4" /> Add image</Btn>} />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((img, i) => (
            <li key={`${img.url}-${i}`} className="overflow-hidden rounded-xl border border-line bg-white">
              <div className="relative aspect-[4/3] bg-mist">
                {img.url && <Image src={img.url} alt={img.alt} fill sizes="240px" className="object-cover" />}
                <span className="absolute left-2 top-2 rounded-full bg-navy/70 px-2 py-0.5 font-mono text-[0.65rem] text-white">{i + 1}</span>
              </div>
              <div className="space-y-2 p-2.5">
                <input
                  className="h-8 w-full rounded-md border border-line px-2 text-xs outline-none focus:border-blue"
                  placeholder="Alt text"
                  value={img.alt}
                  maxLength={200}
                  onChange={(e) => onChange(value.map((v, k) => (k === i ? { ...v, alt: e.target.value } : v)))}
                />
                <div className="flex justify-between">
                  <div className="flex gap-1">
                    <button type="button" disabled={i === 0} className="rounded px-1.5 text-xs text-slate hover:bg-mist disabled:opacity-30" onClick={() => onChange(move(value, i, i - 1))} aria-label="Move earlier">←</button>
                    <button type="button" disabled={i === value.length - 1} className="rounded px-1.5 text-xs text-slate hover:bg-mist disabled:opacity-30" onClick={() => onChange(move(value, i, i + 1))} aria-label="Move later">→</button>
                  </div>
                  <button type="button" className="rounded p-1 text-red-600 hover:bg-red-50" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Remove image">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {value.length < max && (
            <li>
              <button type="button" onClick={() => setOpen(true)} className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line text-sm text-slate hover:border-blue hover:text-blue">
                <ImagePlus className="size-6" /> Add image
              </button>
            </li>
          )}
        </ul>
      )}
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(m) => onChange([...value, { url: m.url, publicId: m.publicId, alt: m.originalName.replace(/\.[a-z]+$/i, "") }].slice(0, max))} />
    </div>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}
