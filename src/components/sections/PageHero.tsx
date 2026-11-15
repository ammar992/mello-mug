import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/motion/Reveal";
import { localeHref, type Dict, type Lang } from "@/lib/i18n";

/** Header for inner pages (Menu / About / Visit). Copy comes from the CMS. */
export function PageHero({ eyebrow, heading, description, crumb, lang, t }: { eyebrow?: string; heading: string; description?: string; crumb: string; lang: Lang; t: Dict }) {
  return (
    <section className="grain relative overflow-hidden bg-cream pb-16 pt-32 lg:pb-24 lg:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -right-[8%] -top-[30%] h-[120%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgb(226_168_102/0.45),transparent)] blur-3xl motion-reduce:animate-none" />
      </div>
      {/* decorative steam-cup mark */}
      <svg aria-hidden viewBox="0 0 120 120" className="absolute right-[6%] top-1/2 hidden size-56 -translate-y-1/3 text-caramel/25 lg:block">
        <path d="M22 50h62v22a31 31 0 0 1-62 0z" fill="currentColor" />
        <path d="M84 56h7a12 12 0 0 1 0 24h-9" fill="none" stroke="currentColor" strokeWidth="6" />
        {[38, 53, 68].map((x) => (
          <path key={x} d={`M${x} 40c-6-7 6-12 0-20`} stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
        ))}
      </svg>
      <div className="container-x relative">
        <Reveal delay={0.05}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm font-semibold text-muted">
            <Link href={localeHref(lang, "/")} className="hover:text-caramel">{t.breadcrumbHome}</Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span aria-current="page" className="text-coffee">{crumb}</span>
          </nav>
        </Reveal>
        {eyebrow && (
          <Reveal delay={0.1}>
            <p className="eyebrow mt-8 text-caramel">{eyebrow}</p>
          </Reveal>
        )}
        <SplitHeading as="h1" text={heading} immediate delay={0.12} className="display-xl mt-4 max-w-[16ch] text-espresso" secondaryLineClassName="italic-soft text-caramel" />
        {description && (
          <Reveal delay={0.45}>
            <p className="lead mt-7 max-w-[52ch] text-muted">{description}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
