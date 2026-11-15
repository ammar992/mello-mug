import { z } from "zod";

/* ─── primitives ─────────────────────────────────────────── */

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, label = "This field") => z.string().trim().min(1, `${label} is required`).max(max);

const safeUrl = z
  .string()
  .trim()
  .max(1500)
  .refine((v) => v === "" || /^https:\/\//i.test(v), "Must be an https:// link");

export const imageSchema = z.object({
  url: safeUrl.default(""),
  publicId: text(300).default(""),
  alt: text(200).default(""),
});
export type ImageValue = z.infer<typeof imageSchema>;

/* ─── home ───────────────────────────────────────────────── */

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: text(80),
    heading: required(140, "Hero heading"),
    description: text(400),
    primaryCtaLabel: required(30, "Primary button label"),
    secondaryCtaLabel: required(30, "Secondary button label"),
    badges: z.array(required(40, "Badge")).max(4),
  }),
  ticker: z.array(required(40, "Ticker word")).max(12),
  brewing: z.object({
    eyebrow: text(60),
    heading: required(120, "Heading"),
    steps: z
      .array(z.object({ title: required(60, "Step title"), description: text(220).default("") }))
      .length(7, "The brewing animation has exactly 7 steps"),
    finalHeading: required(100, "Final heading"),
    finalMessage: text(240),
  }),
  featured: z.object({ eyebrow: text(60), heading: required(120, "Heading"), description: text(300), ctaLabel: required(40, "Button label").default("See the full menu") }),
  bestsellers: z.object({ eyebrow: text(60), heading: required(120, "Heading"), description: text(300) }),
  team: z.object({ eyebrow: text(60), heading: required(120, "Heading"), description: text(300) }),
  visit: z.object({ eyebrow: text(60), heading: required(120, "Heading"), description: text(300) }),
});
export type HomeContent = z.infer<typeof homeSchema>;

/* ─── inner page headers ─────────────────────────────────── */

const pageHeader = z.object({
  eyebrow: text(60),
  heading: required(120, "Heading"),
  description: text(400),
});
export const pagesSchema = z.object({ menu: pageHeader, about: pageHeader, visit: pageHeader });
export type PagesContent = z.infer<typeof pagesSchema>;

/* ─── story ──────────────────────────────────────────────── */

export const storySchema = z.object({
  eyebrow: text(60),
  heading: required(140, "Heading"),
  intro: text(500),
  body: text(2500),
  quote: text(240),
  quoteAuthor: text(80),
  images: z.array(imageSchema).max(3),
  values: z
    .array(z.object({ title: required(60, "Title"), description: text(240).default("") }))
    .max(4),
});
export type StoryContent = z.infer<typeof storySchema>;

/* ─── contact / footer (site-wide) ───────────────────────── */

export const SOCIAL_KEYS = ["instagram", "facebook", "tiktok", "x", "youtube", "google"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || (/^[+\d(][\d\s().-]{5,}$/.test(v) && v.replace(/\D/g, "").length >= 7), "Enter a valid phone number");

export const contactSchema = z.object({
  businessName: required(60, "Business name"),
  tagline: text(160),
  currency: required(4, "Currency symbol"),
  phone,
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email").max(200)]),
  address: text(300),
  mapQuery: text(300),
  mapEmbedUrl: safeUrl.default(""),
  hours: z.array(z.object({ days: required(40, "Days"), time: required(40, "Hours") })).max(10),
  hoursNote: text(160),
  socials: z.object(
    Object.fromEntries(SOCIAL_KEYS.map((k) => [k, safeUrl.default("")])) as Record<SocialKey, z.ZodDefault<typeof safeUrl>>,
  ),
  footerText: text(300),
  footerNote: text(160),
});
export type ContactContent = z.infer<typeof contactSchema>;

/* ─── registry ───────────────────────────────────────────── */

export const CONTENT_SCHEMAS = { home: homeSchema, pages: pagesSchema, story: storySchema, contact: contactSchema } as const;
export type ContentKey = keyof typeof CONTENT_SCHEMAS;
export const CONTENT_KEYS = Object.keys(CONTENT_SCHEMAS) as ContentKey[];
export type ContentMap = { home: HomeContent; pages: PagesContent; story: StoryContent; contact: ContactContent };

/**
 * Fields that are the same in every language — always taken from the English
 * document and hidden in the translation editor.
 */
export const SHARED_FIELDS: Record<ContentKey, string[]> = {
  home: [],
  pages: [],
  story: ["images"],
  contact: ["currency", "phone", "email", "mapQuery", "mapEmbedUrl", "socials"],
};

/* ─── collections ───────────────────────────────────────── */

const optText = (max: number) => z.string().trim().max(max).default("");

export const categoryInputSchema = z.object({
  name: required(40, "Category name"),
  description: text(160),
  visible: z.boolean(),
  mk: z.object({ name: optText(40), description: optText(160) }).default({ name: "", description: "" }),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryDTO = CategoryInput & { id: string; order: number };

export const menuItemInputSchema = z.object({
  name: required(60, "Name"),
  description: text(300),
  price: z.number({ message: "Price is required" }).min(0, "Price can't be negative").max(100000),
  categoryId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a category"),
  image: imageSchema,
  featured: z.boolean(),
  bestseller: z.boolean(),
  visible: z.boolean(),
  tags: z.array(required(24, "Tag")).max(4),
  mk: z
    .object({ name: optText(60), description: optText(300), tags: z.array(z.string().trim().max(24)).max(4).default([]) })
    .default({ name: "", description: "", tags: [] }),
});
export type MenuItemInput = z.infer<typeof menuItemInputSchema>;
export type MenuItemDTO = MenuItemInput & { id: string; order: number };

export const teamInputSchema = z.object({
  name: required(60, "Name"),
  role: required(60, "Role"),
  bio: text(300),
  photo: imageSchema,
  visible: z.boolean(),
  mk: z.object({ role: optText(60), bio: optText(300) }).default({ role: "", bio: "" }),
});
export type TeamInput = z.infer<typeof teamInputSchema>;
export type TeamDTO = TeamInput & { id: string; order: number };
