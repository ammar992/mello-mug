import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import type { ZodType } from "zod";
import { getAdmin, type AdminUser } from "@/lib/auth";

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

export function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Reject cross-origin state-changing requests (defence in depth on top of SameSite cookies). */
export function isSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Guarded = { admin: AdminUser; error?: undefined } | { admin?: undefined; error: NextResponse };

export async function guardAdmin(req: NextRequest): Promise<Guarded> {
  if (req.method !== "GET" && !isSameOrigin(req)) return { error: jsonError("Invalid origin", 403) };
  const admin = await getAdmin();
  if (!admin) return { error: jsonError("Your session has expired. Please sign in again.", 401) };
  return { admin };
}

type Parsed<T> = { data: T; error?: undefined } | { data?: undefined; error: NextResponse };

export async function parseJson<T>(req: NextRequest, schema: ZodType<T>): Promise<Parsed<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { error: jsonError("Invalid JSON body") };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    const first = parsed.error.issues[0];
    return { error: jsonError(first?.message ?? "Invalid input", 422, { fieldErrors }) };
  }
  return { data: parsed.data };
}

/** Refresh every public page after CMS changes. */
export function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/[lang]", "layout"); // every page in every language
}

export function isValidObjectId(id: string) {
  return /^[a-f\d]{24}$/i.test(id);
}
