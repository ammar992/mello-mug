/**
 * Create the initial admin account from environment variables.
 *
 *   npm run seed:admin              → creates ADMIN_EMAIL / ADMIN_PASSWORD (skips if it already exists)
 *   npm run seed:admin -- --reset   → resets the password of the existing ADMIN_EMAIL account
 *
 * Credentials are never hardcoded — they come from .env.local.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const reset = process.argv.includes("--reset");
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";
const name = process.env.ADMIN_NAME || "Admin";

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

if (!process.env.MONGODB_URI) fail("MONGODB_URI is not set. Add it to .env.local.");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("ADMIN_EMAIL is missing or not a valid email address.");
if (password.length < 10) fail("ADMIN_PASSWORD must be at least 10 characters.");

const Admin =
  mongoose.models.Admin ||
  mongoose.model(
    "Admin",
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        name: { type: String, default: "Admin" },
        passwordHash: { type: String, required: true },
        tokenVersion: { type: Number, default: 0 },
        lastLoginAt: Date,
      },
      { timestamps: true },
    ),
  );

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "mellow-mug", serverSelectionTimeoutMS: 15000 });
} catch (err) {
  fail(`Could not connect to MongoDB: ${err.message}`);
}

try {
  const existing = await Admin.findOne({ email });
  if (existing && !reset) {
    console.log(`\nℹ Admin ${email} already exists — nothing to do.`);
    console.log("  To change its password run:  npm run seed:admin -- --reset\n");
  } else if (existing && reset) {
    existing.passwordHash = await bcrypt.hash(password, 12);
    existing.name = name;
    existing.tokenVersion = (existing.tokenVersion ?? 0) + 1; // signs out existing sessions
    await existing.save();
    console.log(`\n✔ Password reset for ${email}\n`);
  } else {
    await Admin.create({ email, name, passwordHash: await bcrypt.hash(password, 12) });
    console.log(`\n✔ Admin account created: ${email}`);
    console.log("  Sign in at /admin/login\n");
  }
} catch (err) {
  fail(`Could not save admin: ${err.message}`);
} finally {
  await mongoose.disconnect();
}
