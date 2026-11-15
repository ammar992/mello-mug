import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";
import { guardAdmin, jsonError, parseJson } from "@/lib/api";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export const runtime = "nodejs";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(200)
      .refine((v) => /[a-z]/i.test(v) && /\d/.test(v), "Include at least one letter and one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export async function POST(req: NextRequest) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  const parsed = await parseJson(req, schema);
  if (parsed.error) return parsed.error;

  await connectDB();
  const admin = await Admin.findById(g.admin.id);
  if (!admin) return jsonError("Account not found", 404);
  if (!(await bcrypt.compare(parsed.data.currentPassword, admin.passwordHash))) {
    return jsonError("Current password is incorrect", 400, { fieldErrors: { currentPassword: "Incorrect password" } });
  }
  admin.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  admin.tokenVersion = (admin.tokenVersion ?? 0) + 1; // signs out all other sessions
  await admin.save();

  const token = await signSession({ sub: String(admin._id), email: admin.email, name: admin.name, v: admin.tokenVersion });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
