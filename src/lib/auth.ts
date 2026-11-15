import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Admin } from "@/lib/models/Admin";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export type AdminUser = { id: string; email: string; name: string };

/** Full session check: valid signature + admin still exists + token version matches. */
export async function getAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const session = await verifySession(store.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  try {
    await connectDB();
    const admin = await Admin.findById(session.sub).select("email name tokenVersion").lean();
    if (!admin || (admin.tokenVersion ?? 0) !== session.v) return null;
    return { id: String(admin._id), email: admin.email, name: admin.name };
  } catch {
    return null;
  }
}

/** For server components/pages: redirect to login if not authenticated. */
export async function requireAdminPage(): Promise<AdminUser> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
