import type { MetadataRoute } from "next";
import { LOCALES, localeHref } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const paths = ["/", "/menu", "/about", "/visit"];
  return paths.flatMap((p) =>
    LOCALES.map((lang) => ({
      url: `${site}${localeHref(lang, p) === "/" ? "" : localeHref(lang, p)}`,
      changeFrequency: "weekly" as const,
      priority: p === "/" ? 1 : 0.8,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${site}${localeHref(l, p) === "/" ? "" : localeHref(l, p)}`])) },
    })),
  );
}
