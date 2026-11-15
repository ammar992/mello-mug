"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, KeyRound, Loader2, Wand2 } from "lucide-react";
import { useState, type FormEvent } from "react";

export function LoginForm({ demo }: { demo?: { email: string; password: string } }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  function fillDemo() {
    if (!demo) return;
    setEmail(demo.email);
    setPassword(demo.password);
    setError("");
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");
    if (!password) return setError("Enter your password.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Sign-in failed");
      const next = params.get("next");
      router.replace(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setLoading(false);
    }
  }

  const input =
    "block h-12 w-full rounded-xl border border-line bg-white px-4 text-ink outline-none transition focus:border-blue focus:shadow-[0_0_0_4px_rgb(37_99_235/0.12)]";

  return (
    <>
    {demo && (
      <div className="mt-8 rounded-2xl border border-blue/25 bg-blue-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-navy">
            <KeyRound className="size-4 text-blue" aria-hidden /> Admin credentials
          </p>
          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-slate">Demo</span>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate">Email</dt>
            <dd className="truncate font-mono text-navy">{demo.email}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate">Password</dt>
            <dd className="flex items-center gap-1.5 font-mono text-navy">
              {showDemo ? demo.password : "•".repeat(Math.min(demo.password.length, 14))}
              <button type="button" onClick={() => setShowDemo((v) => !v)} className="rounded p-1 text-slate hover:text-navy" aria-label={showDemo ? "Hide password" : "Show password"}>
                {showDemo ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue/30 bg-white text-sm font-medium text-blue transition hover:bg-blue hover:text-white"
        >
          <Wand2 className="size-4" aria-hidden /> Use this
        </button>
      </div>
    )}
    <form onSubmit={onSubmit} className={demo ? "mt-6 space-y-5" : "mt-8 space-y-5"} noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">Email</label>
        <input id="email" type="email" autoComplete="username" className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy">Password</label>
        <div className="relative">
          <input id="password" type={show ? "text" : "password"} autoComplete="current-password" className={`${input} pr-12`} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate hover:text-navy" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue font-medium text-white transition hover:bg-blue-600 disabled:opacity-60">
        {loading && <Loader2 className="size-4 animate-spin" />} {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
    </>
  );
}
