export const LOCALES = ["en", "mk"] as const;
export type Lang = (typeof LOCALES)[number];
export const DEFAULT_LANG: Lang = "en";

export function isLang(v: string): v is Lang {
  return (LOCALES as readonly string[]).includes(v);
}

export const LANG_LABELS: Record<Lang, { short: string; name: string; htmlLang: string; ogLocale: string }> = {
  en: { short: "EN", name: "English", htmlLang: "en", ogLocale: "en_US" },
  mk: { short: "МК", name: "Македонски", htmlLang: "mk", ogLocale: "mk_MK" },
};

/** Prefix an internal path for a language. English (default) has no prefix. */
export function localeHref(lang: Lang, path: string) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

/** Strip any language prefix from a pathname → the language-neutral path. */
export function stripLang(pathname: string) {
  for (const l of LOCALES) {
    if (l === DEFAULT_LANG) continue;
    if (pathname === `/${l}`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname || "/";
}

/** Fixed interface labels (page content itself comes from the CMS). */
const en = {
  nav: { home: "Home", menu: "Menu", about: "About", visit: "Visit" },
  findUs: "Find us",
  call: "Call",
  callUs: "Call us",
  emailUs: "Email us",
  getInTouch: "Get in touch",
  getDirections: "Get directions",
  openingHours: "Opening hours",
  today: "Today",
  bestSeller: "Best seller",
  featured: "Featured",
  all: "All",
  readOurStory: "Read our story",
  seeYouSoon: "See you soon.",
  menuUpdating: "Our menu is being updated — please check back soon.",
  footer: { explore: "Explore", contact: "Contact", hours: "Hours", rights: "All rights reserved." },
  skip: "Skip to content",
  badge: "FRESHLY BREWED • SLOW SIPPED • ",
  breadcrumbHome: "Home",
  language: "Language",
  notFound: { title: "This cup is", accent: "empty.", text: "The page you were looking for isn’t on the menu.", back: "Back to the café" },
  openMenu: "Open menu",
  closeMenu: "Close menu",
  mapTitle: "Map showing",
  noMap: "Map coming soon.",
};

export type Dict = typeof en;

const mk: Dict = {
  nav: { home: "Почетна", menu: "Мени", about: "За нас", visit: "Посетете не" },
  findUs: "Најдете не",
  call: "Јави се",
  callUs: "Јавете ни се",
  emailUs: "Пишете ни",
  getInTouch: "Контакт",
  getDirections: "Упатства за пат",
  openingHours: "Работно време",
  today: "Денес",
  bestSeller: "Најпродавано",
  featured: "Издвоено",
  all: "Сè",
  readOurStory: "Прочитајте ја нашата приказна",
  seeYouSoon: "Се гледаме наскоро.",
  menuUpdating: "Менито се ажурира — проверете повторно наскоро.",
  footer: { explore: "Истражете", contact: "Контакт", hours: "Работно време", rights: "Сите права се задржани." },
  skip: "Прескокни до содржината",
  badge: "СВЕЖО СВАРЕНО • ПОЛЕКА ИСПИЕНО • ",
  breadcrumbHome: "Почетна",
  language: "Јазик",
  notFound: { title: "Оваа шолја е", accent: "празна.", text: "Страницата што ја баравте не е на менито.", back: "Назад во кафулето" },
  openMenu: "Отвори мени",
  closeMenu: "Затвори мени",
  mapTitle: "Мапа на",
  noMap: "Мапата наскоро.",
};

const DICTS: Record<Lang, Dict> = { en, mk };
export const getDict = (lang: Lang) => DICTS[lang] ?? en;
