import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";
import { guardAdmin, isValidObjectId, jsonError } from "@/lib/api";
import { getCloudinary, isOwnPublicId } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await guardAdmin(req);
  if (g.error) return g.error;
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return jsonError("Not found", 404);
  await connectDB();
  const doc = await Media.findById(id);
  if (!doc) return jsonError("Image not found", 404);
  try {
    if (isOwnPublicId(doc.publicId)) {
      await getCloudinary().uploader.destroy(doc.publicId, { invalidate: true });
    }
    await doc.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[media] delete failed", err);
    return jsonError("Could not delete the image. Please try again.", 500);
  }
}
