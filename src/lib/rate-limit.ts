import "server-only";
import { connectDB } from "@/lib/db";
import { RateLimit } from "@/lib/models/RateLimit";

/**
 * Fixed-window rate limiter backed by MongoDB (works across serverless instances).
 * Returns ok:false when the caller exceeded `limit` hits within `windowSec`.
 */
export async function rateLimit(key: string, limit: number, windowSec: number) {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const bucket = Math.floor(now / windowMs);
  const resetAt = (bucket + 1) * windowMs;
  try {
    await connectDB();
    const doc = await RateLimit.findOneAndUpdate(
      { key: `${key}:${bucket}` },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt) } },
      { upsert: true, returnDocument: "after" },
    ).lean();
    const count = doc?.count ?? 1;
    return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfter: Math.ceil((resetAt - now) / 1000) };
  } catch (err) {
    console.error("[rate-limit] unavailable, allowing request", err);
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}
