"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn, telHref } from "@/lib/utils";
import { NAV } from "@/lib/nav";
import { LANG_LABELS, LOCALES, localeHref, stripLang, type Dict, type Lang } from "@/lib/i18n";

function LanguageSwitch({ lang, path, dark, label }: { lang: Lang; path: string; dark?: boolean; label: string }) {
  return (
    <div role="group" aria-label={label} className={cn("flex items-center rounded-full p-1", dark ? "bg-foam/10" : "bg-espresso/[0.06]")}>
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={localeHref(l, path)}
          hrefLang={LANG_LABELS[l].htmlLang}
          lang={LANG_LABELS[l].htmlLang}
          aria-current={l === lang ? "true" : undefined}
          title={LANG_LABELS[l].name}
          className={cn(
            "relative rounded-full px-3 py-1.5 text-xs font-bold tracking-wider transition-colors",
            l === lang ? (dark ? "text-espresso" : "text-foam") : dark ? "text-foam/70 hover:text-foam" : "text-ink/60 hover:text-ink",
          )}
        >
          {l === lang && <motion.span layoutId={dark ? "lang-pill-m" : "lang-pill"} className={cn("absolute inset-0 rounded-full", dark ? "bg-foam" : "bg-caramel")} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          <span className="relative">{LANG_LABELS[l].short}</span>
        </Link>
      ))}
    </div>
  );
}

export function SiteHeader({ businessName, phone, lang, t }: { businessName: string; phone: string; lang: Lang; t: Dict }) {
  const pathname = usePathname();
  const path = stripLang(pathname);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // close the mobile menu whenever the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
    setHidden(false);
  }

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (y > 400 && y > prev + 4) setHidden(true);
    else if (y < prev - 4) setHidden(false);
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (p: string) => (p === "/" ? path === "/" : path.startsWith(p));
  const tel = telHref(phone);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4"
        animate={{ y: hidden && !open && !reduce ? "-130%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          initial={reduce ? false : { y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={cn(
            "glass-warm mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-3 rounded-full pl-4 pr-2 transition-shadow duration-500 md:pl-5",
            scrolled && "shadow-[0_18px_40px_-20px_rgb(36_21_14/0.45)]",
          )}
        >
          <Link href={localeHref(lang, "/")} className="shrink-0 rounded-full" aria-label={`${businessName} — ${t.nav.home}`}>
            <Logo name={businessName} />
          </Link>
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((n) => (
                <li key={n.path}>
                  <Link
                    href={localeHref(lang, n.path)}
                    aria-current={isActive(n.path) ? "page" : undefined}
                    className={cn("relative block whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-semibold transition-colors duration-300", isActive(n.path) ? "text-foam" : "text-ink/70 hover:text-ink")}
                  >
                    {isActive(n.path) && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-espresso" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                    <span className="relative">{t.nav[n.key]}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <div className="max-md:hidden">
              <LanguageSwitch lang={lang} path={path} label={t.language} />
            </div>
            {tel && (
              <ButtonLink href={tel} variant="caramel" arrow={false} icon={<Phone className="size-4" />} className="h-12 max-xl:hidden">
                {phone}
              </ButtonLink>
            )}
            {tel && (
              <a href={tel} aria-label={`${t.call}: ${phone}`} className="inline-flex size-12 items-center justify-center rounded-full bg-caramel text-foam md:hidden">
                <Phone className="size-5" aria-hidden />
              </a>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t.closeMenu : t.openMenu}
              className="inline-flex size-12 items-center justify-center rounded-full bg-espresso text-foam md:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </motion.div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={t.openMenu}
            className="fixed inset-0 z-40 flex flex-col bg-espresso px-6 pb-10 pt-28 text-foam md:hidden"
            initial={reduce ? { opacity: 0 } : { clipPath: "circle(0% at 92% 6%)" }}
            animate={reduce ? { opacity: 1 } : { clipPath: "circle(150% at 92% 6%)" }}
            exit={reduce ? { opacity: 0 } : { clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.18, 1] }}
          >
            <ul className="space-y-1">
              {NAV.map((n, i) => (
                <motion.li key={n.path} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.06 }}>
                  <Link href={localeHref(lang, n.path)} onClick={() => setOpen(false)} aria-current={isActive(n.path) ? "page" : undefined} className="flex items-baseline justify-between border-b border-foam/10 py-4">
                    <span className={cn("font-display text-4xl italic", isActive(n.path) && "text-crema")}>{t.nav[n.key]}</span>
                    <span className="text-sm text-crema">0{i + 1}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8">
              <LanguageSwitch lang={lang} path={path} dark label={t.language} />
            </div>
            <div className="mt-auto grid grid-cols-2 gap-3">
              {tel && (
                <ButtonLink href={tel} variant="caramel" size="lg" arrow={false} icon={<Phone className="size-4" />}>
                  {t.call}
                </ButtonLink>
              )}
              <ButtonLink href={localeHref(lang, "/visit")} variant="light" size="lg">
                {t.findUs}
              </ButtonLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
