import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { DEFAULT_LANG, LOCALES } from "@/lib/i18n";

/**
 * 1. Admin protection: verifies the session signature for /admin and /api/admin
 *    (every admin page and API route also re-checks the session against the DB).
 * 2. Languages: English lives at "/", other languages at "/<lang>/…".
 *    Un-prefixed paths are internally rewritten to "/en/…"; "/en/…" redirects to the clean URL.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ── admin ─────────────────────────────────────────────── */
  if (pathname.startsWith("/api/admin") || pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (pathname.startsWith("/api/admin")) {
      if (pathname.startsWith("/api/admin/auth/")) return NextResponse.next();
      if (!session) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
      return NextResponse.next();
    }
    if (pathname === "/admin/login") {
      return session ? NextResponse.redirect(new URL("/admin", req.url)) : NextResponse.next();
    }
    if (!session) {
      const url = new URL("/admin/login", req.url);
      if (pathname !== "/admin") url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (pathname.startsWith("/api/")) return NextResponse.next();

  /* ── languages ─────────────────────────────────────────── */
  const first = pathname.split("/")[1] ?? "";
  if (first === DEFAULT_LANG) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LANG.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }
  if ((LOCALES as readonly string[]).includes(first)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // everything except Next internals and files with an extension (images, icons, robots.txt, sitemap.xml…)
  matcher: ["/((?!_next/|.*\\.[a-zA-Z0-9]+$).*)"],
};
