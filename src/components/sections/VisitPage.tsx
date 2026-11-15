import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { Reveal, Stagger } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { SocialIcon, SOCIAL_LABELS } from "@/components/site/Social";
import { TodayHours } from "./TodayHours";
import { directionsUrl, mapSrc } from "./HomeSections";
import { SOCIAL_KEYS, type ContactContent } from "@/lib/content/schema";
import { telHref } from "@/lib/utils";
import type { Dict } from "@/lib/i18n";

/** Full visit page: large map with a floating info card, then hours + contact cards. */
export function VisitPage({ contact, t }: { contact: ContactContent; t: Dict }) {
  const tel = telHref(contact.phone);
  const src = mapSrc(contact);
  const dir = directionsUrl(contact);
  const socials = SOCIAL_KEYS.filter((k) => contact.socials[k]);

  return (
    <>
      <section className="bg-cream pb-6">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-latte ring-1 ring-line">
              {src ? (
                <iframe
                  title={`${t.mapTitle} ${contact.businessName}${contact.address ? `, ${contact.address}` : ""}`}
                  src={src}
                  className="block h-[460px] w-full saturate-[0.85] sepia-[0.12] lg:h-[620px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-[360px] items-center justify-center text-muted">{t.noMap}</div>
              )}
              {/* floating card */}
              <div className="glass-warm m-3 rounded-[1.6rem] p-5 sm:absolute sm:left-6 sm:top-6 sm:m-0 sm:w-[360px] md:p-6">
                <p className="font-display text-3xl font-medium italic">{contact.businessName}</p>
                {contact.address && (
                  <p className="mt-3 flex items-start gap-2.5 text-ink/85">
                    <MapPin className="mt-1 size-4 shrink-0 text-caramel" aria-hidden />
                    {contact.address}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {dir && (
                    <ButtonLink href={dir} target="_blank" rel="noopener noreferrer" variant="caramel" arrow={false} icon={<Navigation className="size-4" />}>
                      {t.getDirections}
                    </ButtonLink>
                  )}
                  {tel && (
                    <ButtonLink href={tel} variant="dark" arrow={false} icon={<Phone className="size-4" />}>
                      {t.call}
                    </ButtonLink>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-cream pt-12">
        <Stagger className="container-x grid gap-5 lg:grid-cols-3" itemClassName="h-full">
          <div className="h-full rounded-[var(--radius-card)] bg-foam p-7 ring-1 ring-line lg:col-span-2">
            <p className="eyebrow flex items-center gap-2 text-caramel"><Clock className="size-4" aria-hidden /> {t.openingHours}</p>
            <div className="mt-4 text-lg">
              <TodayHours hours={contact.hours} note={contact.hoursNote} todayLabel={t.today} />
            </div>
          </div>
          <div className="flex h-full flex-col gap-4 rounded-[var(--radius-card)] bg-espresso p-7 text-foam">
            <p className="eyebrow text-crema">{t.getInTouch}</p>
            {tel && (
              <a href={tel} className="group flex items-center gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-caramel text-foam transition-transform group-hover:-rotate-12"><Phone className="size-5" /></span>
                <span><span className="block text-sm text-foam/55">{t.callUs}</span><span className="font-display text-xl">{contact.phone}</span></span>
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="group flex items-center gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-foam/10 text-crema transition-transform group-hover:-rotate-12"><Mail className="size-5" /></span>
                <span className="min-w-0"><span className="block text-sm text-foam/55">{t.emailUs}</span><span className="block break-all font-display text-xl">{contact.email}</span></span>
              </a>
            )}
            {socials.length > 0 && (
              <ul className="mt-auto flex flex-wrap gap-2 pt-4">
                {socials.map((k) => (
                  <li key={k}>
                    <a href={contact.socials[k]} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[k]} className="inline-flex size-11 items-center justify-center rounded-full border border-foam/15 text-foam/75 hover:border-crema hover:text-crema">
                      <SocialIcon name={k} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Stagger>
      </section>
    </>
  );
}
