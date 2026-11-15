"use client";

import Image from "next/image";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import type { CategoryDTO, MenuItemDTO } from "@/lib/content/schema";
import { Spotlight } from "@/components/motion/Spotlight";
import { cn } from "@/lib/utils";
import type { Dict } from "@/lib/i18n";

const price = (p: number, c: string) => `${c}${p.toFixed(2)}`;

/** Single menu card (used by the filterable grid and the homepage preview). */
export function MenuCard({ item, currency, categoryName, bestSellerLabel }: { item: MenuItemDTO; currency: string; categoryName?: string; bestSellerLabel: string }) {
  return (
    <Spotlight className="group h-full rounded-[var(--radius-card)]">
      <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] bg-foam/80 p-3 ring-1 ring-line transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-[0_34px_60px_-30px_rgb(59_36_24/0.45)]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem] bg-latte">
          {item.image.url && (
            <Image src={item.image.url} alt={item.image.alt || item.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]" />
          )}
          <span className="glass-warm absolute right-3 top-3 rounded-full px-3.5 py-1.5 font-display text-lg font-semibold text-espresso">{price(item.price, currency)}</span>
          {item.bestseller && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-caramel px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foam">
              <Star className="size-3.5" fill="currentColor" aria-hidden /> {bestSellerLabel}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
          {categoryName && <p className="eyebrow text-caramel">{categoryName}</p>}
          <h3 className="mt-2 text-[1.7rem] font-medium">{item.name}</h3>
          {item.description && <p className="mt-2 text-[0.97rem] text-muted">{item.description}</p>}
          {item.tags.length > 0 && (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
              {item.tags.map((t) => (
                <li key={t} className="rounded-full bg-latte px-3 py-1 text-xs font-semibold text-coffee">{t}</li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </Spotlight>
  );
}

export function MenuGrid({ categories, items, currency, defaultTab, t }: { categories: CategoryDTO[]; items: MenuItemDTO[]; currency: string; defaultTab?: "featured" | "all"; t: Dict }) {
  const reduce = useReducedMotion();
  const hasFeatured = items.some((i) => i.featured);
  const tabs = useMemo(
    () => [...(hasFeatured ? [{ id: "featured", name: t.featured }] : []), { id: "all", name: t.all }, ...categories.map((c) => ({ id: c.id, name: c.name }))],
    [categories, hasFeatured, t],
  );
  const [tab, setTab] = useState(defaultTab && tabs.some((t) => t.id === defaultTab) ? defaultTab : tabs[0]?.id ?? "all");
  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

  const shown = items.filter((i) => (tab === "all" ? true : tab === "featured" ? i.featured : i.categoryId === tab));

  if (!items.length) return null;

  return (
    <div>
      <LayoutGroup>
        <div role="tablist" aria-label="Menu categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn("relative shrink-0 rounded-full px-5 py-2.5 text-[0.94rem] font-semibold transition-colors", tab === t.id ? "text-foam" : "text-ink/70 hover:text-ink")}
            >
              {tab === t.id && <motion.span layoutId="menu-tab" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{t.name}</span>
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
          <AnimatePresence mode="popLayout">
            {shown.map((item, i) => (
              <motion.li
                key={item.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : Math.min(i, 6) * 0.04 }}
              >
                <MenuCard item={item} currency={currency} categoryName={catName[item.categoryId]} bestSellerLabel={t.bestSeller} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </div>
  );
}

/** Best sellers: big typographic list with a photo that follows the cursor (desktop). */
export function BestsellerList({ items, currency }: { items: MenuItemDTO[]; currency: string }) {
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  if (!items.length) return null;

  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onPointerLeave={() => setHover(null)}
    >
      <ol className="border-t border-foam/15">
        {items.map((item, i) => (
          <li key={item.id} onPointerEnter={() => setHover(i)} className="group border-b border-foam/15">
            <div className="flex items-center gap-4 py-6 md:gap-8 md:py-8">
              <span className="w-10 shrink-0 font-display text-lg italic text-crema md:w-16 md:text-2xl">{String(i + 1).padStart(2, "0")}</span>
              {item.image.url && (
                <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl md:hidden">
                  <Image src={item.image.url} alt="" fill sizes="64px" className="object-cover" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-[clamp(1.6rem,4vw+0.5rem,4.2rem)] font-medium leading-none transition-[color,transform] duration-500 group-hover:translate-x-3 group-hover:text-crema">
                  {item.name}
                </h3>
                {item.description && <p className="mt-2 max-w-xl text-sm text-foam/55 md:text-base">{item.description}</p>}
              </div>
              <span className="shrink-0 font-display text-2xl text-foam md:text-4xl">{price(item.price, currency)}</span>
            </div>
          </li>
        ))}
      </ol>

      {/* floating preview */}
      <AnimatePresence>
        {hover !== null && items[hover]?.image.url && (
          <motion.div
            key="preview"
            className="pointer-events-none absolute left-0 top-0 z-10 hidden h-64 w-52 overflow-hidden rounded-[1.6rem] shadow-2xl md:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, x: pos.x + 30, y: pos.y - 130, rotate: reduce ? 0 : -4 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.6 }}
          >
            <AnimatePresence mode="popLayout">
              <motion.div key={items[hover].id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.15 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <Image src={items[hover].image.url} alt="" fill sizes="210px" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
