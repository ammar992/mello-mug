"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2, X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/* ── Layout ────────────────────────────────────────────── */

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.95rem] text-slate">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, actions, className }: { title?: string; description?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white", className)}>
      {(title || actions) && (
        <header className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {title && <h2 className="font-semibold text-navy">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

/* ── Form controls ────────────────────────────────────── */

const inputBase =
  "block w-full rounded-lg border bg-white px-3.5 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-slate/50 focus:border-blue focus:shadow-[0_0_0_3px_rgb(37_99_235/0.15)] disabled:bg-mist";

export function Field({ label, hint, error, children, id, count }: { label: string; hint?: string; error?: string; children: ReactNode; id: string; count?: { value: number; max: number } }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-navy">{label}</label>
        {count && (
          <span className={cn("font-mono text-[0.7rem]", count.value > count.max ? "text-red-600" : "text-slate/70")}>
            {count.value}/{count.max}
          </span>
        )}
      </div>
      {children}
      {error ? <p className="mt-1.5 text-sm text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-slate">{hint}</p> : null}
    </div>
  );
}

type TextProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  error?: string;
  max?: number;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
};

export function TextField({ label, value, onChange, hint, error, max, placeholder, type = "text", multiline, rows = 4, required }: TextProps) {
  const id = useId();
  const cls = cn(inputBase, error ? "border-red-400" : "border-line hover:border-slate-light");
  return (
    <Field label={required ? `${label} *` : label} hint={hint} error={error} id={id} count={max ? { value: value.length, max } : undefined}>
      {multiline ? (
        <textarea id={id} rows={rows} className={cn(cls, "resize-y py-2.5 leading-relaxed")} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input id={id} type={type} className={cn(cls, "h-11")} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </Field>
  );
}

export function NumberField({ label, value, onChange, hint }: { label: string; value: number; onChange: (v: number) => void; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <input id={id} type="number" min={0} className={cn(inputBase, "h-11 border-line")} value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <select id={id} className={cn(inputBase, "h-11 border-line")} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-navy">{label}</label>
        {description && <p className="mt-0.5 text-xs text-slate">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors", checked ? "bg-blue" : "bg-line")}
      >
        <span className={cn("inline-block size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

/* ── Buttons & badges ─────────────────────────────────── */

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-blue text-white hover:bg-blue-600",
  secondary: "border border-line bg-white text-navy hover:bg-mist",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-slate hover:bg-mist hover:text-navy",
};

export function Btn({
  variant = "primary",
  loading,
  children,
  className,
  size = "md",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; loading?: boolean; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm",
        btnVariants[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

const badgeTones = {
  blue: "bg-blue-50 text-blue",
  orange: "bg-amber-50 text-amber-700",
  green: "bg-emerald-50 text-emerald-700",
  gray: "bg-mist text-slate",
  red: "bg-red-50 text-red-700",
  navy: "bg-navy text-paper",
};
export function Badge({ tone = "gray", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", badgeTones[tone])}>{children}</span>;
}

/* ── Modal ────────────────────────────────────────────── */

export function Modal({ open, onClose, title, children, footer, size = "md", elevated }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: "md" | "lg" | "xl"; elevated?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 flex", elevated ? "z-[120]" : "z-[100]", "items-end justify-center sm:items-center sm:p-4")} role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-navy/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn(
              "relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl",
              size === "md" ? "sm:max-w-lg" : size === "lg" ? "sm:max-w-2xl" : "sm:max-w-5xl",
            )}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-semibold text-navy">{title}</h2>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate hover:bg-mist" aria-label="Close">
                <X className="size-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-5" data-lenis-prevent>{children}</div>
            {footer && <footer className="flex justify-end gap-2 border-t border-line px-5 py-3.5">{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-5 animate-spin text-blue", className)} aria-label="Loading" />;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <p className="font-semibold text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-slate">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
