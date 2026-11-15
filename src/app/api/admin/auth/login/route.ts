import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";
import { getClientIp, isSameOrigin, jsonError, parseJson } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});

// Constant-time-ish path when the user doesn't exist (avoids user enumeration by timing)
let dummyHash: string | null = null;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("mellow-mug-timing-equaliser", 12));

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return jsonError("Invalid origin", 403);

  const ip = getClientIp(req);
  const limit = await rateLimit(`login:${ip}`, 8, 900);
  if (!limit.ok) {
    return jsonError(`Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.`, 429);
  }

  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;
  const { email, password } = parsed.data;

  try {
    await connectDB();
    const admin = await Admin.findOne({ email });
    const valid = await bcrypt.compare(password, admin?.passwordHash ?? (await getDummyHash()));
    if (!admin || !valid) return jsonError("Incorrect email or password", 401);

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = await signSession({
      sub: String(admin._id),
      email: admin.email,
      name: admin.name,
      v: admin.tokenVersion ?? 0,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("[auth] login failed", err);
    return jsonError("Sign-in is temporarily unavailable. Please try again.", 500);
  }
}
