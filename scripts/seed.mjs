/**
 * Seed default content, menu and team.
 *
 *   npm run seed              → inserts anything that doesn't exist yet (safe to re-run)
 *   npm run seed -- --force   → overwrites page content AND replaces menu + team with defaults
 *
 * Stock photos are copied into the Cloudinary folder and registered in the
 * media library so they can be replaced or deleted from the dashboard.
 */
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { DEFAULT_CONTENT, SEED_CATEGORIES, SEED_ITEMS, SEED_TEAM } from "../src/lib/content/defaults.ts";
import { SEED_CATEGORIES_MK, SEED_ITEMS_MK, SEED_TEAM_MK } from "../src/lib/content/defaults-mk.ts";

const force = process.argv.includes("--force");
const folder = process.env.CLOUDINARY_FOLDER || "mellow-mug";
const canUpload = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

if (!process.env.MONGODB_URI) {
  console.error("✖ MONGODB_URI is not set");
  process.exit(1);
}
if (canUpload) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const S = mongoose.Schema;
const imgDef = { url: String, publicId: String, alt: String };
const m = (name, def, opts = { timestamps: true }) => mongoose.models[name] || mongoose.model(name, new S(def, opts));
const Content = m("Content", { key: { type: String, unique: true }, data: S.Types.Mixed, updatedBy: String }, { timestamps: true, minimize: false });
const Category = m("Category", { name: String, description: String, visible: Boolean, order: Number, mk: { name: String, description: String } });
const MenuItem = m("MenuItem", { name: String, description: String, price: Number, categoryId: S.Types.ObjectId, image: imgDef, featured: Boolean, bestseller: Boolean, visible: Boolean, tags: [String], order: Number, mk: { name: String, description: String, tags: [String] } });
const TeamMember = m("TeamMember", { name: String, role: String, bio: String, photo: imgDef, visible: Boolean, order: Number, mk: { role: String, bio: String } });
const Media = m("Media", { url: String, publicId: { type: String, unique: true }, width: Number, height: Number, bytes: Number, format: String, originalName: String });

const uploaded = new Map();
async function toCloudinary(url, alt) {
  if (!canUpload || !url || url.includes("res.cloudinary.com")) return { url, publicId: "", alt };
  if (uploaded.has(url)) return { ...uploaded.get(url), alt };
  const id = "stock-" + (url.match(/photo-([\w-]+)/)?.[1] ?? Date.now().toString(36));
  try {
    const r = await cloudinary.uploader.upload(url, { folder, public_id: id, overwrite: false, resource_type: "image" });
    await Media.updateOne(
      { publicId: r.public_id },
      { url: r.secure_url, publicId: r.public_id, width: r.width, height: r.height, bytes: r.bytes, format: r.format, originalName: alt || id },
      { upsert: true },
    );
    const v = { url: r.secure_url, publicId: r.public_id };
    uploaded.set(url, v);
    process.stdout.write("·");
    return { ...v, alt };
  } catch (err) {
    console.warn(`\n  ! upload failed for ${id}: ${err?.message ?? err} — keeping original URL`);
    return { url, publicId: "", alt };
  }
}

async function migrateImages(node) {
  if (Array.isArray(node)) return Promise.all(node.map(migrateImages));
  if (node && typeof node === "object") {
    if ("url" in node && "publicId" in node && "alt" in node) return toCloudinary(node.url, node.alt);
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = await migrateImages(v);
    return out;
  }
  return node;
}

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "mellow-mug" });
console.log(`Connected. ${force ? "FORCE mode — overwriting." : "Inserting missing content only."}`);
if (canUpload) console.log(`Uploading stock photos to Cloudinary folder "${folder}"`);

for (const [key, data] of Object.entries(DEFAULT_CONTENT)) {
  const exists = await Content.exists({ key });
  if (exists && !force) {
    console.log(`  – ${key}: exists, skipped`);
    continue;
  }
  await Content.updateOne({ key }, { key, data: await migrateImages(structuredClone(data)), updatedBy: "seed" }, { upsert: true });
  console.log(`\n  ✔ ${key}: ${exists ? "overwritten" : "created"}`);
}

if ((await Category.countDocuments()) === 0 || force) {
  if (force) await Promise.all([Category.deleteMany({}), MenuItem.deleteMany({})]);
  const catIds = {};
  for (const [i, c] of SEED_CATEGORIES.entries()) {
    const doc = await Category.create({ name: c.name, description: c.description, visible: true, order: i });
    catIds[c.key] = doc._id;
  }
  for (const [i, it] of SEED_ITEMS.entries()) {
    await MenuItem.create({
      name: it.name, description: it.description, price: it.price, categoryId: catIds[it.cat],
      image: await toCloudinary(it.image, it.alt), featured: !!it.featured, bestseller: !!it.bestseller,
      visible: true, tags: it.tags ?? [], order: i,
    });
  }
  console.log(`\n  ✔ menu: ${SEED_CATEGORIES.length} categories, ${SEED_ITEMS.length} items`);
} else console.log("  – menu: exists, skipped");

if ((await TeamMember.countDocuments()) === 0 || force) {
  if (force) await TeamMember.deleteMany({});
  for (const [i, t] of SEED_TEAM.entries()) {
    await TeamMember.create({ name: t.name, role: t.role, bio: t.bio, photo: await toCloudinary(t.photo, t.alt), visible: true, order: i });
  }
  console.log(`\n  ✔ team: ${SEED_TEAM.length} members`);
} else console.log("  – team: exists, skipped");

/* ── Macedonian translations for seeded collections (only fills empty ones) ── */
let translated = 0;
const fillMk = async (Model, matchField, map) => {
  for (const [en, mk] of Object.entries(map)) {
    const r = await Model.updateMany(
      { [matchField]: en, $or: [{ mk: { $exists: false } }, { "mk.name": { $in: [null, ""] } }, { "mk.role": "" }] },
      { $set: { mk } },
    );
    translated += r.modifiedCount;
  }
};
await fillMk(Category, "name", Object.fromEntries(Object.entries(SEED_CATEGORIES_MK).map(([k, v]) => [k, { name: v.name, description: v.description }])));
await fillMk(MenuItem, "name", Object.fromEntries(Object.entries(SEED_ITEMS_MK).map(([k, v]) => [k, { name: v.name, description: v.description, tags: v.tags ?? [] }])));
await fillMk(TeamMember, "name", Object.fromEntries(Object.entries(SEED_TEAM_MK).map(([k, v]) => [k, { role: v.role, bio: v.bio }])));
console.log(`  ✔ macedonian: ${translated} records translated`);

await mongoose.disconnect();
console.log("Done.");
