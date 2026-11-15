import { Logo } from "@/components/ui/Logo";
import { SocialIcon, SOCIAL_LABELS } from "./Social";
import { SOCIAL_KEYS, type ContactContent } from "@/lib/content/schema";
import { telHref } from "@/lib/utils";
import { NAV } from "@/lib/nav";
import { localeHref, type Dict, type Lang } from "@/lib/i18n";

export function SiteFooter({ contact, lang, t }: { contact: ContactContent; lang: Lang; t: Dict }) {
  const socials = SOCIAL_KEYS.filter((k) => contact.socials[k]);
  const tel = telHref(contact.phone);
  return (
    <footer className="relative overflow-hidden bg-espresso text-foam">
      <div className="container-x">
        <div className="grid gap-12 border-b border-foam/10 py-16 md:grid-cols-12 md:py-20">
          <div className="md:col-span-5">
            <Logo name={contact.businessName} tone="light" />
            {contact.footerText && <p className="mt-5 max-w-sm text-foam/60">{contact.footerText}</p>}
            {socials.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-2">
                {socials.map((k) => (
                  <li key={k}>
                    <a href={contact.socials[k]} target="_blank" rel="noopener noreferrer" aria-label={SOCIAL_LABELS[k]} className="inline-flex size-11 items-center justify-center rounded-full border border-foam/15 text-foam/70 transition-colors hover:border-crema hover:text-crema">
                      <SocialIcon name={k} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow text-crema">{t.footer.explore}</p>
            <ul className="mt-5 space-y-3">
              {NAV.map((n) => (
                <li key={n.path}>
                  <a href={localeHref(lang, n.path)} className="text-foam/75 transition-colors hover:text-crema">{t.nav[n.key]}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="eyebrow text-crema">{t.footer.contact}</p>
            <ul className="mt-5 space-y-3 text-foam/75">
              {tel && <li><a href={tel} className="hover:text-crema">{contact.phone}</a></li>}
              {contact.email && <li><a href={`mailto:${contact.email}`} className="break-all hover:text-crema">{contact.email}</a></li>}
              {contact.address && <li className="text-foam/55">{contact.address}</li>}
            </ul>
          </div>
          {contact.hours.length > 0 && (
            <div className="md:col-span-3">
              <p className="eyebrow text-crema">{t.footer.hours}</p>
              <dl className="mt-5 space-y-2.5 text-sm">
                {contact.hours.map((h, i) => (
                  <div key={i} className="flex justify-between gap-4 border-b border-foam/5 pb-2.5">
                    <dt className="text-foam/55">{h.days}</dt>
                    <dd className="text-foam/90">{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <p aria-hidden className="pointer-events-none select-none py-4 text-center font-display text-[clamp(4rem,15vw,13rem)] italic leading-none tracking-[-0.04em] text-foam/[0.05]">
          {contact.businessName}
        </p>
        <div className="flex flex-col gap-2 pb-8 text-sm text-foam/45 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {contact.businessName}. {t.footer.rights}</p>
          {contact.footerNote && <p>{contact.footerNote}</p>}
        </div>
      </div>
    </footer>
  );
}
