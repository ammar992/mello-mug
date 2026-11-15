"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { getDict, isLang, localeHref, DEFAULT_LANG } from "@/lib/i18n";

export default function NotFound() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang && isLang(params.lang) ? params.lang : DEFAULT_LANG;
  const t = getDict(lang).notFound;
  return (
    <section className="grain relative flex min-h-[80svh] items-center bg-cream pt-24">
      <div className="container-x">
        <p className="eyebrow text-caramel">404</p>
        <h1 className="display-xl mt-5 max-w-[12ch]">
          {t.title} <span className="italic-soft text-caramel">{t.accent}</span>
        </h1>
        <p className="lead mt-6 max-w-md text-muted">{t.text}</p>
        <Link href={localeHref(lang, "/")} className="mt-10 inline-flex h-14 items-center rounded-full bg-espresso px-7 font-semibold text-foam hover:bg-mocha">
          {t.back}
        </Link>
      </div>
    </section>
  );
}
