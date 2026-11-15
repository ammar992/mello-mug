import Image from "next/image";
import { Mail, MapPin, Navigation, Phone, Star } from "lucide-react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Marquee } from "@/components/motion/Marquee";
import { ButtonLink } from "@/components/ui/Button";
import { HeroCup } from "@/components/three/HeroCup";
import { SocialIcon, SOCIAL_LABELS } from "@/components/site/Social";
import { BestsellerList, MenuCard } from "./MenuSection";
import { TodayHours } from "./TodayHours";
import { SOCIAL_KEYS, type CategoryDTO, type ContactContent, type HomeContent, type MenuItemDTO, type StoryContent, type TeamDTO } from "@/lib/content/schema";
import { telHref } from "@/lib/utils";
import { localeHref, type Dict, type Lang } from "@/lib/i18n";

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${light ? "text-crema" : "text-caramel"}`}>
      <span aria-hidden className={`h-px w-8 ${light ? "bg-crema/50" : "bg-caramel/50"}`} />
      {children}
    </p>
  );
}

/* ── Hero ─────────────────────────────────────────────────── */
export function Hero({ hero, star, currency, lang, t }: { hero: HomeContent["hero"]; star?: MenuItemDTO; currency: string; lang: Lang; t: Dict }) {
  return (
    <section className="grain relative overflow-hidden bg-cream">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob absolute -right-[12%] top-[-10%] h-[70%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgb(226_168_102/0.55),transparent)] blur-3xl motion-reduce:animate-none" />
        <div className="animate-blob absolute -left-[10%] bottom-[-20%] h-[60%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgb(194_122_62/0.25),transparent)] blur-3xl [animation-delay:-6s] motion-reduce:animate-none" />
      </div>

      <div className="container-x relative grid min-h-[100svh] items-center gap-8 pb-16 pt-28 lg:min-h-[min(100svh,960px)] lg:grid-cols-12 lg:gap-4 lg:pb-20 lg:pt-32">
        <div className="relative z-10 lg:col-span-6">
          {hero.eyebrow && (
            <Reveal delay={0.1}>
              <p className="glass-warm inline-flex items-center gap-2 rounded-full py-1.5 pl-2 pr-4 text-sm font-semibold text-coffee">
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-caramel text-foam">☕︎</span>
                {hero.eyebrow}
              </p>
            </Reveal>
          )}
          <SplitHeading
            as="h1"
            text={hero.heading}
            immediate
            delay={0.15}
            className="display-xl mt-7 text-espresso"
            secondaryLineClassName="italic-soft text-caramel"
          />
          {hero.description && (
            <Reveal delay={0.5}>
              <p className="lead mt-7 max-w-[46ch] text-muted">{hero.description}</p>
            </Reveal>
          )}
          <Reveal delay={0.65} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={localeHref(lang, "/menu")} variant="caramel" size="lg">{hero.primaryCtaLabel}</ButtonLink>
            <ButtonLink href={localeHref(lang, "/visit")} variant="outline" size="lg">{hero.secondaryCtaLabel}</ButtonLink>
          </Reveal>
          {hero.badges.length > 0 && (
            <Reveal delay={0.8}>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-coffee">
                {hero.badges.map((b) => (
                  <li key={b} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-caramel" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative mx-auto aspect-square w-full max-w-[620px]">
            {/* plate + rotating badge */}
            <div aria-hidden className="absolute inset-[8%] rounded-full bg-gradient-to-br from-latte to-sand shadow-[inset_0_-30px_60px_rgb(90_56_37/0.15)]" />
            <svg aria-hidden viewBox="0 0 200 200" className="animate-spin-slow absolute right-[2%] top-[4%] z-20 size-[24%] motion-reduce:animate-none">
              <defs><path id="circ" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" /></defs>
              <circle cx="100" cy="100" r="96" fill="#24150e" />
              <text fontSize="17" letterSpacing="5" fill="#f7f0e6" fontFamily="var(--font-manrope)" fontWeight="700">
                <textPath href="#circ" textLength="460" lengthAdjust="spacingAndGlyphs">{t.badge}</textPath>
              </text>
              <text x="100" y="114" textAnchor="middle" fontSize="44" fill="#e2a866">☕︎</text>
            </svg>
            <div className="relative z-10 size-full">
              <HeroCup />
            </div>
            {star && (
              <Reveal delay={1.1} className="absolute bottom-[6%] left-0 z-20 sm:left-[-4%]">
                <div className="glass-warm animate-float flex items-center gap-3 rounded-2xl p-2.5 pr-5 motion-reduce:animate-none">
                  {star.image.url && (
                    <span className="relative size-14 overflow-hidden rounded-xl">
                      <Image src={star.image.url} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                  )}
                  <span className="leading-tight">
                    <span className="flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wider text-caramel">
                      <Star className="size-3" fill="currentColor" aria-hidden /> {t.bestSeller}
                    </span>
                    <span className="block font-display text-lg font-medium">{star.name}</span>
                    <span className="text-sm font-semibold text-muted">{currency}{star.price.toFixed(2)}</span>
                  </span>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Ticker ───────────────────────────────────────────────── */
export function Ticker({ words }: { words: string[] }) {
  if (!words.length) return null;
  return (
    <div className="relative z-10 overflow-hidden py-3"><div className="-mx-4 -rotate-[1.2deg] bg-espresso py-5 text-foam lg:py-7" aria-label="What we serve">
      <Marquee duration={Math.max(26, words.length * 5)}>
        {words.map((w) => (
          <span key={w} className="flex items-center">
            <span className="whitespace-nowrap px-7 font-display text-3xl italic lg:px-10 lg:text-5xl">{w}</span>
            <span aria-hidden className="text-2xl text-crema lg:text-3xl">✻</span>
          </span>
        ))}
      </Marquee>
    </div></div>
  );
}


/* ── Homepage menu preview ────────────────────────────────── */
export function MenuPreview({ content, categories, items, currency, lang, t }: { content: HomeContent["featured"]; categories: CategoryDTO[]; items: MenuItemDTO[]; currency: string; lang: Lang; t: Dict }) {
  const featured = (items.some((i) => i.featured) ? items.filter((i) => i.featured) : items).slice(0, 6);
  if (!featured.length) return null;
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  return (
    <section className="section-y bg-cream">
      <div className="container-x">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            {content.eyebrow && <Eyebrow>{content.eyebrow}</Eyebrow>}
            <SplitHeading text={content.heading} className="display-lg mt-5 max-w-[14ch]" />
            {content.description && <p className="mt-5 max-w-md text-muted">{content.description}</p>}
          </div>
          <ButtonLink href={localeHref(lang, "/menu")} variant="dark" size="lg" className="self-start lg:self-auto">{content.ctaLabel}</ButtonLink>
        </div>
        <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" itemClassName="h-full" stagger={0.08}>
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} currency={currency} categoryName={catName[item.categoryId]} bestSellerLabel={t.bestSeller} />
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── Homepage story teaser ────────────────────────────────── */
export function StoryTeaser({ story, lang, t }: { story: StoryContent; lang: Lang; t: Dict }) {
  const img = story.images.find((i) => i.url);
  return (
    <section className="section-y bg-latte/60">
      <div className="container-x grid items-center gap-12 lg:grid-cols-12">
        {img && (
          <div className="relative lg:col-span-6">
            <ImageReveal src={img.url} alt={img.alt} parallax className="aspect-[5/4] rounded-[2rem]" sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
        )}
        <div className="lg:col-span-5 lg:col-start-8">
          {story.eyebrow && <Eyebrow>{story.eyebrow}</Eyebrow>}
          <SplitHeading text={story.heading} className="display-lg mt-5" />
          {story.intro && <p className="lead mt-6 text-muted">{story.intro}</p>}
          <ButtonLink href={localeHref(lang, "/about")} variant="outline" size="lg" className="mt-9">{t.readOurStory}</ButtonLink>
        </div>
      </div>
    </section>
  );
}

/* ── Best sellers ─────────────────────────────────────────── */
export function BestsellersSection({ content, items, currency }: { content: HomeContent["bestsellers"]; items: MenuItemDTO[]; currency: string }) {
  if (!items.length) return null;
  return (
    <section id="bestsellers" className="section-y grain relative scroll-mt-20 overflow-hidden bg-mocha text-foam">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(closest-side,rgb(226_168_102/0.25),transparent)] blur-3xl" />
      <div className="container-x relative">
        <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            {content.eyebrow && <Eyebrow light>{content.eyebrow}</Eyebrow>}
            <SplitHeading text={content.heading} className="display-lg mt-5" />
          </div>
          {content.description && <p className="text-foam/60 lg:col-span-4 lg:col-start-9">{content.description}</p>}
        </div>
        <BestsellerList items={items} currency={currency} />
      </div>
    </section>
  );
}

/* ── Story ────────────────────────────────────────────────── */
export function StorySection({ story }: { story: StoryContent }) {
  const [a, b] = story.images.filter((i) => i.url);
  return (
    <section id="story" className="section-y scroll-mt-20 bg-cream">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="relative lg:col-span-6">
          {a && <ImageReveal src={a.url} alt={a.alt} parallax className="aspect-[4/5] w-[82%] rounded-[2rem]" sizes="(min-width:1024px) 40vw, 80vw" />}
          {b && (
            <div className="absolute -bottom-8 right-0 w-[48%]">
              <ImageReveal src={b.url} alt={b.alt} from="right" className="aspect-square rounded-[1.6rem] border-[6px] border-cream shadow-2xl" sizes="(min-width:1024px) 24vw, 48vw" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center lg:col-span-6 lg:pl-6">
          {story.eyebrow && <Eyebrow>{story.eyebrow}</Eyebrow>}
          <SplitHeading text={story.heading} className="display-lg mt-5" />
          {story.intro && (
            <Reveal>
              <p className="lead mt-7 font-medium text-coffee">{story.intro}</p>
            </Reveal>
          )}
          {story.body && (
            <Reveal delay={0.1}>
              <p className="mt-5 text-muted">{story.body}</p>
            </Reveal>
          )}
          {story.quote && (
            <Reveal delay={0.15}>
              <blockquote className="mt-10 border-l-2 border-caramel pl-6">
                <p className="font-display text-2xl italic leading-snug text-espresso lg:text-3xl">“{story.quote}”</p>
                {story.quoteAuthor && <footer className="mt-3 text-sm font-semibold text-muted">— {story.quoteAuthor}</footer>}
              </blockquote>
            </Reveal>
          )}
        </div>

        {story.values.length > 0 && (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:col-span-12 lg:mt-20 lg:grid-cols-3" itemClassName="h-full">
            {story.values.map((v, i) => (
              <div key={v.title} className="h-full rounded-[var(--radius-card)] bg-latte/70 p-7 transition-colors duration-500 hover:bg-latte">
                <p className="font-display text-4xl italic text-caramel">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-4 text-2xl font-medium">{v.title}</h3>
                {v.description && <p className="mt-2 text-muted">{v.description}</p>}
              </div>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

/* ── Team ─────────────────────────────────────────────────── */
export function TeamSection({ content, team }: { content: HomeContent["team"]; team: TeamDTO[] }) {
  if (!team.length) return null;
  return (
    <section id="team" className="section-y scroll-mt-20 bg-latte">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          {content.eyebrow && <p className="eyebrow text-caramel">{content.eyebrow}</p>}
          <SplitHeading text={content.heading} className="display-lg mt-5" />
          {content.description && <p className="mt-5 text-muted">{content.description}</p>}
        </div>
        <Stagger className="mt-14 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4" itemClassName="h-full" stagger={0.1}>
          {team.map((m, i) => (
            <figure key={m.id} className={`group h-full ${i % 2 ? "lg:translate-y-10" : ""}`}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-[1.8rem] bg-sand">
                {m.photo.url && (
                  <Image src={m.photo.url} alt={m.photo.alt || m.name} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover saturate-[0.85] transition-[transform,filter] duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-105 group-hover:saturate-100" />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-espresso/85 via-espresso/30 to-transparent p-4 pt-16 md:p-5 md:pt-20">
                  <span className="inline-block rounded-full bg-caramel px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-foam">{m.role}</span>
                  <p className="mt-2 font-display text-2xl font-medium text-foam md:text-3xl">{m.name}</p>
                </div>
              </div>
              {m.bio && <figcaption className="mt-3 px-1 text-sm text-muted">{m.bio}</figcaption>}
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ── Visit ────────────────────────────────────────────────── */
export function directionsUrl(c: ContactContent) {
  const q = c.mapQuery || c.address;
  return q ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}` : "";
}

export function mapSrc(c: ContactContent) {
  if (c.mapEmbedUrl) {
    try {
      const u = new URL(c.mapEmbedUrl);
      if (/(^|\.)google\.[a-z.]+$/.test(u.hostname) && u.pathname.startsWith("/maps")) return c.mapEmbedUrl;
    } catch {
      /* ignore invalid */
    }
  }
  const q = c.mapQuery || c.address;
  return q ? `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed` : "";
}

export function VisitSection({ content, contact, fallbackImage, t }: { content: HomeContent["visit"]; contact: ContactContent; fallbackImage?: { url: string; alt: string }; t: Dict }) {
  const tel = telHref(contact.phone);
  const src = mapSrc(contact);
  const socials = SOCIAL_KEYS.filter((k) => contact.socials[k]);
  return (
    <section id="visit" className="section-y scroll-mt-20 bg-cream">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {content.eyebrow && <Eyebrow>{content.eyebrow}</Eyebrow>}
          <SplitHeading text={content.heading} className="display-lg mt-5" />
          {content.description && <p className="mt-5 text-muted">{content.description}</p>}

          <div className="mt-9 space-y-4">
            {contact.address && (
              <p className="flex items-start gap-3 text-lg">
                <MapPin className="mt-1 size-5 shrink-0 text-caramel" aria-hidden />
                <span>{contact.address}</span>
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {tel && <ButtonLink href={tel} variant="dark" arrow={false} icon={<Phone className="size-4" />}>{contact.phone}</ButtonLink>}
              {contact.email && <ButtonLink href={`mailto:${contact.email}`} variant="outline" arrow={false} icon={<Mail className="size-4" />}>{contact.email}</ButtonLink>}
            
              {directionsUrl(contact) && (
                <ButtonLink href={directionsUrl(contact)} variant="caramel" target="_blank" rel="noopener noreferrer" arrow={false} icon={<Navigation className="size-4" />}>
                  {t.getDirections}
                </ButtonLink>
              )}
            </div>
          </div>

          {contact.hours.length > 0 && (
            <div className="mt-10 rounded-[var(--radius-card)] bg-foam p-6 ring-1 ring-line md:p-7">
              <p className="eyebrow text-caramel">{t.openingHours}</p>
              <div className="mt-3">
                <TodayHours hours={contact.hours} note={contact.hoursNote} todayLabel={t.today} />
              </div>
            </div>
          )}

          {socials.length > 0 && (
            <ul className="mt-8 flex gap-2">
              {socials.map((k) => (
                <li key={k}>
                  <a href={contact.socials[k]} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[k]} className="inline-flex size-11 items-center justify-center rounded-full bg-latte text-coffee transition-colors hover:bg-caramel hover:text-foam">
                    <SocialIcon name={k} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <div className="relative h-full min-h-[380px] overflow-hidden rounded-[2rem] bg-latte ring-1 ring-line lg:min-h-[560px]">
            {src ? (
              <iframe title={`${t.mapTitle} ${contact.businessName}`} src={src} className="absolute inset-0 size-full saturate-[0.8] sepia-[0.15]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            ) : (
              fallbackImage?.url && (
                <>
                  <Image src={fallbackImage.url} alt={fallbackImage.alt} fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
                  <p className="absolute bottom-6 left-6 right-6 font-display text-3xl italic text-foam">{t.seeYouSoon}</p>
                </>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
