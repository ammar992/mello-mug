"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, Coffee, ExternalLink, Heading, House, ImageIcon, LayoutDashboard, LogOut, MapPin, Menu, Settings, Users, X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Website",
    items: [
      { href: "/admin/content/home", label: "Homepage", icon: House },
      { href: "/admin/content/pages", label: "Page headings", icon: Heading },
      { href: "/admin/menu", label: "Menu & prices", icon: Coffee },
      { href: "/admin/content/story", label: "Our story", icon: BookOpen },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/content/contact", label: "Hours, location & footer", icon: MapPin },
      { href: "/admin/media", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

export function Sidebar({ admin, businessName }: { admin: { name: string; email: string }; businessName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out");
      setLoggingOut(false);
    }
  }

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Admin">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="rounded-lg">
          <Logo name={businessName} tone="light" />
        </Link>
        <button type="button" className="rounded-lg p-2 text-paper/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="size-5" />
        </button>
      </div>
      <div className="flex-1 space-y-7 overflow-y-auto px-3 py-4">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-3 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-light/70">{g.label}</p>
            <ul className="mt-2 space-y-0.5">
              {g.items.map((item) => {
                const active = "exact" in item && item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.93rem] transition-colors",
                        active ? "bg-blue text-white" : "text-paper/70 hover:bg-white/5 hover:text-paper",
                      )}
                    >
                      <item.icon className="size-[1.1rem]" aria-hidden />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.93rem] text-paper/70 hover:bg-white/5 hover:text-paper">
          <ExternalLink className="size-[1.1rem]" aria-hidden /> View website
        </a>
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-semibold text-paper">
            {admin.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-paper">{admin.name}</p>
            <p className="truncate text-xs text-paper/50">{admin.email}</p>
          </div>
          <button type="button" onClick={logout} disabled={loggingOut} className="rounded-lg p-2 text-paper/60 hover:bg-white/10 hover:text-paper" aria-label="Sign out" title="Sign out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="-ml-2 rounded-lg p-2 text-navy" aria-label="Open menu" aria-expanded={open}>
          <Menu className="size-5" />
        </button>
        <Logo name={businessName} />
        <span className="w-9" />
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 bg-navy lg:block">{nav}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[85%] max-w-xs bg-navy shadow-2xl">{nav}</aside>
        </div>
      )}
    </>
  );
}
