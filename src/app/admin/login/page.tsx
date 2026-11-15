import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

/**
 * Credentials box with a "Use this" button — shown by default (dev and live).
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from the server env (the DB only stores a hash).
 * To hide it later, set SHOW_DEMO_CREDENTIALS=false.
 */
function getDemoCredentials() {
  if (process.env.SHOW_DEMO_CREDENTIALS === "false") return undefined;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return undefined;
  return { email, password };
}

export default function LoginPage() {
  const demo = getDemoCredentials();
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="grain relative hidden flex-col justify-between overflow-hidden bg-espresso p-12 text-foam lg:flex" data-theme-dark>
        <Logo tone="light" />
        <div>
          <p className="eyebrow text-crema">Café dashboard</p>
          <h1 className="display-lg mt-5 max-w-[14ch]">Your café, your website — no code needed.</h1>
          <p className="mt-5 max-w-md text-paper/60">Update your menu and prices, opening hours, photos, story and team — all in one place.</p>
        </div>
        <p className="font-mono text-xs text-paper/40">Secure admin area</p>
      </section>
      <section className="flex items-center justify-center bg-paper px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-navy">Sign in</h2>
          <p className="mt-2 text-slate">Use your admin email and password.</p>
          <Suspense>
            <LoginForm demo={demo} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
