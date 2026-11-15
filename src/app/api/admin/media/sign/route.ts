import { NextResponse, type NextRequest } from "next/server";
import { guardAdmin, jsonError } from "@/lib/api";
import { createUploadSignature, isCloudinaryConfigured } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  if (!isCloudinaryConfigured()) return jsonError("Image uploads are not configured", 503);
  return NextResponse.json({ ok: true, data: createUploadSignature() });
}
