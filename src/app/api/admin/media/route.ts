import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";
import { guardAdmin, jsonError, parseJson } from "@/lib/api";
import { getCloudinary, isOwnPublicId } from "@/lib/cloudinary";
import { toMediaDTO } from "@/lib/media";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  await connectDB();
  const docs = await Media.find().sort({ createdAt: -1 }).limit(500).lean();
  return NextResponse.json({ ok: true, data: docs.map((d) => toMediaDTO(d as never)) });
}

const registerSchema = z.object({
  publicId: z.string().min(1).max(300),
  originalName: z.string().max(200).default(""),
});

/**
 * Register an asset after the browser uploaded it directly to Cloudinary.
 * We re-fetch it from the Cloudinary Admin API, so clients cannot inject arbitrary URLs.
 */
export async function POST(req: NextRequest) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  const parsed = await parseJson(req, registerSchema);
  if (parsed.error) return parsed.error;
  const { publicId, originalName } = parsed.data;
  if (!isOwnPublicId(publicId)) return jsonError("Invalid asset", 400);

  try {
    const r = await getCloudinary().api.resource(publicId, { resource_type: "image" });
    await connectDB();
    const doc = await Media.findOneAndUpdate(
      { publicId: r.public_id },
      {
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        format: r.format,
        originalName,
      },
      { upsert: true, returnDocument: "after" },
    ).lean();
    return NextResponse.json({ ok: true, data: toMediaDTO(doc as never) }, { status: 201 });
  } catch (err) {
    console.error("[media] register failed", err);
    return jsonError("Could not verify the uploaded image", 400);
  }
}
