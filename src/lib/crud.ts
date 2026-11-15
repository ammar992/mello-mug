import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { Model } from "mongoose";
import { z, type ZodType } from "zod";
import { connectDB } from "@/lib/db";
import { guardAdmin, isValidObjectId, jsonError, parseJson, revalidateSite } from "@/lib/api";

type Lean = Record<string, unknown> & { _id: unknown };
type Ctx = { params: Promise<{ id: string }> };

type Options<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  schema: ZodType<T>;
  toDTO: (d: Lean) => unknown;
  /** Extra check before insert/update (e.g. referenced category exists). Return an error message to reject. */
  validate?: (data: T) => Promise<string | null>;
  /** Return an error message to block deletion. */
  beforeDelete?: (id: string) => Promise<string | null>;
  label: string;
};

/** Generic admin CRUD + reorder handlers for an ordered collection. */
export function createCrud<T extends object>(o: Options<T>) {
  const list = async (req: NextRequest) => {
    const g = await guardAdmin(req);
    if (g.error) return g.error;
    await connectDB();
    const docs = await o.model.find().sort({ order: 1, createdAt: 1 }).lean();
    return NextResponse.json({ ok: true, data: (docs as Lean[]).map(o.toDTO) });
  };

  const create = async (req: NextRequest) => {
    const g = await guardAdmin(req);
    if (g.error) return g.error;
    const parsed = await parseJson(req, o.schema);
    if (parsed.error) return parsed.error;
    await connectDB();
    const problem = await o.validate?.(parsed.data);
    if (problem) return jsonError(problem, 422);
    const last = await o.model.findOne().sort({ order: -1 }).select("order").lean<{ order?: number }>();
    const doc = await o.model.create({ ...parsed.data, order: (last?.order ?? -1) + 1 });
    revalidateSite();
    return NextResponse.json({ ok: true, data: o.toDTO(doc.toObject() as Lean) }, { status: 201 });
  };

  const update = async (req: NextRequest, ctx: Ctx) => {
    const g = await guardAdmin(req);
    if (g.error) return g.error;
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return jsonError("Not found", 404);
    const parsed = await parseJson(req, o.schema);
    if (parsed.error) return parsed.error;
    await connectDB();
    const problem = await o.validate?.(parsed.data);
    if (problem) return jsonError(problem, 422);
    const doc = await o.model.findByIdAndUpdate(id, parsed.data, { returnDocument: "after" }).lean();
    if (!doc) return jsonError(`${o.label} not found`, 404);
    revalidateSite();
    return NextResponse.json({ ok: true, data: o.toDTO(doc as Lean) });
  };

  const remove = async (req: NextRequest, ctx: Ctx) => {
    const g = await guardAdmin(req);
    if (g.error) return g.error;
    const { id } = await ctx.params;
    if (!isValidObjectId(id)) return jsonError("Not found", 404);
    await connectDB();
    const problem = await o.beforeDelete?.(id);
    if (problem) return jsonError(problem, 409);
    const res = await o.model.findByIdAndDelete(id);
    if (!res) return jsonError(`${o.label} not found`, 404);
    revalidateSite();
    return NextResponse.json({ ok: true });
  };

  const reorderSchema = z.object({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(500) });
  const reorder = async (req: NextRequest) => {
    const g = await guardAdmin(req);
    if (g.error) return g.error;
    const parsed = await parseJson(req, reorderSchema);
    if (parsed.error) return parsed.error;
    await connectDB();
    await o.model.bulkWrite(parsed.data.ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
    revalidateSite();
    return NextResponse.json({ ok: true });
  };

  return { list, create, update, remove, reorder };
}
