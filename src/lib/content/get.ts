import "server-only";
import { cache } from "react";
import { connectDB, isDbConfigured } from "@/lib/db";
import { Content } from "@/lib/models/Content";
import { Category } from "@/lib/models/Category";
import { MenuItem } from "@/lib/models/MenuItem";
import { TeamMember } from "@/lib/models/TeamMember";
import { DEFAULT_CONTENT } from "./defaults";
import { DEFAULT_CONTENT_MK } from "./defaults-mk";
import {
  CONTENT_SCHEMAS,
  SHARED_FIELDS,
  type CategoryDTO,
  type ContentKey,
  type ContentMap,
  type MenuItemDTO,
  type TeamDTO,
} from "./schema";
import { DEFAULT_LANG, type Lang } from "@/lib/i18n";
import { deepMerge } from "@/lib/utils";

type Lean = Record<string, unknown> & { _id: unknown };
type Img = { url?: string; publicId?: string; alt?: string };
const toImg = (v: unknown) => {
  const i = (v ?? {}) as Img;
  return { url: i.url ?? "", publicId: i.publicId ?? "", alt: i.alt ?? "" };
};
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});
const str = (v: unknown) => (typeof v === "string" ? v : "");

/* ── DTO converters (admin gets every language) ─────────── */

export function toCategoryDTO(d: Lean): CategoryDTO {
  const mk = obj(d.mk);
  return {
    id: String(d._id),
    name: String(d.name ?? ""),
    description: String(d.description ?? ""),
    visible: d.visible !== false,
    order: Number(d.order ?? 0),
    mk: { name: str(mk.name), description: str(mk.description) },
  };
}

export function toMenuItemDTO(d: Lean): MenuItemDTO {
  const mk = obj(d.mk);
  return {
    id: String(d._id),
    name: String(d.name ?? ""),
    description: String(d.description ?? ""),
    price: Number(d.price ?? 0),
    categoryId: String(d.categoryId ?? ""),
    image: toImg(d.image),
    featured: Boolean(d.featured),
    bestseller: Boolean(d.bestseller),
    visible: d.visible !== false,
    tags: (d.tags as string[]) ?? [],
    order: Number(d.order ?? 0),
    mk: { name: str(mk.name), description: str(mk.description), tags: Array.isArray(mk.tags) ? (mk.tags as string[]) : [] },
  };
}

export function toTeamDTO(d: Lean): TeamDTO {
  const mk = obj(d.mk);
  return {
    id: String(d._id),
    name: String(d.name ?? ""),
    role: String(d.role ?? ""),
    bio: String(d.bio ?? ""),
    photo: toImg(d.photo),
    visible: d.visible !== false,
    order: Number(d.order ?? 0),
    mk: { role: str(mk.role), bio: str(mk.bio) },
  };
}

/* ── localisation of collection items for the public site ─ */

const pick = (translated: string, base: string) => translated.trim() || base;

function localiseCategory(c: CategoryDTO, lang: Lang): CategoryDTO {
  if (lang !== "mk") return c;
  return { ...c, name: pick(c.mk.name, c.name), description: pick(c.mk.description, c.description) };
}
function localiseItem(i: MenuItemDTO, lang: Lang): MenuItemDTO {
  if (lang !== "mk") return i;
  return { ...i, name: pick(i.mk.name, i.name), description: pick(i.mk.description, i.description), tags: i.mk.tags.length ? i.mk.tags : i.tags };
}
function localiseTeam(t: TeamDTO, lang: Lang): TeamDTO {
  if (lang !== "mk") return t;
  return { ...t, role: pick(t.mk.role, t.role), bio: pick(t.mk.bio, t.bio) };
}

/* ── page content ─────────────────────────────────────────── */

export const contentDocKey = (key: ContentKey, lang: Lang) => (lang === DEFAULT_LANG ? key : `${key}:${lang}`);

async function loadEnglish<K extends ContentKey>(key: K): Promise<ContentMap[K]> {
  const fallback = DEFAULT_CONTENT[key];
  if (!isDbConfigured()) return fallback;
  try {
    await connectDB();
    const doc = await Content.findOne({ key }).lean();
    if (!doc) return fallback;
    const parsed = CONTENT_SCHEMAS[key].safeParse(deepMerge(fallback, doc.data));
    if (!parsed.success) {
      console.error(`[content] stored "${key}" failed validation; using defaults`, parsed.error.issues.slice(0, 3));
      return fallback;
    }
    return parsed.data as ContentMap[K];
  } catch (err) {
    console.error(`[content] failed to load "${key}"`, err);
    return fallback;
  }
}

async function loadContent<K extends ContentKey>(key: K, lang: Lang = DEFAULT_LANG): Promise<ContentMap[K]> {
  const en = await loadEnglish(key);
  if (lang === DEFAULT_LANG) return en;

  let saved: unknown = undefined;
  if (isDbConfigured()) {
    try {
      await connectDB();
      saved = (await Content.findOne({ key: contentDocKey(key, lang) }).lean())?.data;
    } catch (err) {
      console.error(`[content] failed to load "${key}:${lang}"`, err);
    }
  }
  const mkDefaults = lang === "mk" ? (DEFAULT_CONTENT_MK as Record<ContentKey, unknown>)[key] : undefined;
  const merged = deepMerge(deepMerge(en, mkDefaults), saved) as Record<string, unknown>;
  for (const f of SHARED_FIELDS[key]) merged[f] = (en as Record<string, unknown>)[f];

  const parsed = CONTENT_SCHEMAS[key].safeParse(merged);
  if (!parsed.success) {
    console.error(`[content] "${key}:${lang}" failed validation; using English`, parsed.error.issues.slice(0, 3));
    return en;
  }
  return parsed.data as ContentMap[K];
}

/** Load one content document for a language (falls back to English). Never throws. */
export const getContent = cache(loadContent) as <K extends ContentKey>(key: K, lang?: Lang) => Promise<ContentMap[K]>;

/* ── collections ─────────────────────────────────────────── */

/** Public menu: visible categories (ordered) with their visible items, localised. */
export const getMenu = cache(async (lang: Lang = DEFAULT_LANG): Promise<{ categories: CategoryDTO[]; items: MenuItemDTO[] }> => {
  if (!isDbConfigured()) return { categories: [], items: [] };
  try {
    await connectDB();
    const cats = (await Category.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean()).map((d) => localiseCategory(toCategoryDTO(d as unknown as Lean), lang));
    const ids = new Set(cats.map((c) => c.id));
    const items = (await MenuItem.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean())
      .map((d) => localiseItem(toMenuItemDTO(d as unknown as Lean), lang))
      .filter((i) => ids.has(i.categoryId));
    return { categories: cats, items };
  } catch (err) {
    console.error("[menu] failed to load", err);
    return { categories: [], items: [] };
  }
});

export const getTeam = cache(async (lang: Lang = DEFAULT_LANG): Promise<TeamDTO[]> => {
  if (!isDbConfigured()) return [];
  try {
    await connectDB();
    return (await TeamMember.find({ visible: true }).sort({ order: 1, createdAt: 1 }).lean()).map((d) => localiseTeam(toTeamDTO(d as unknown as Lean), lang));
  } catch (err) {
    console.error("[team] failed to load", err);
    return [];
  }
});
