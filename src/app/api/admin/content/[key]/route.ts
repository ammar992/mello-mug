import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";
import { connectDB } from "@/lib/db";
import { Content } from "@/lib/models/Content";
import { guardAdmin, jsonError, parseJson, revalidateSite } from "@/lib/api";
import { contentDocKey, getContent } from "@/lib/content/get";
import { CONTENT_KEYS, CONTENT_SCHEMAS, type ContentKey } from "@/lib/content/schema";
import { DEFAULT_LANG, isLang, type Lang } from "@/lib/i18n";

export const runtime = "nodejs";

function isKey(k: string): k is ContentKey {
  return (CONTENT_KEYS as string[]).includes(k);
}
function langOf(req: NextRequest): Lang | null {
  const l = req.nextUrl.searchParams.get("lang") ?? DEFAULT_LANG;
  return isLang(l) ? l : null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  const { key } = await ctx.params;
  const lang = langOf(req);
  if (!isKey(key) || !lang) return jsonError("Unknown content section", 404);
  return NextResponse.json({ ok: true, data: await getContent(key, lang) });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ key: string }> }) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  const { key } = await ctx.params;
  const lang = langOf(req);
  if (!isKey(key) || !lang) return jsonError("Unknown content section", 404);

  const parsed = await parseJson(req, CONTENT_SCHEMAS[key] as ZodType<unknown>);
  if (parsed.error) return parsed.error;

  try {
    await connectDB();
    const docKey = contentDocKey(key, lang);
    await Content.findOneAndUpdate({ key: docKey }, { key: docKey, data: parsed.data, updatedBy: g.admin.email }, { upsert: true, setDefaultsOnInsert: true });
    revalidateSite();
    return NextResponse.json({ ok: true, data: await getContent(key, lang) });
  } catch (err) {
    console.error("[content] save failed", err);
    return jsonError("Could not save changes. Please try again.", 500);
  }
}
