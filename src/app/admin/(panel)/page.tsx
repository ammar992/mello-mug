import Link from "next/link";
import { ArrowRight, BookOpen, Coffee, ImageIcon, MapPin, Star, Tags, Users } from "lucide-react";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { MenuItem } from "@/lib/models/MenuItem";
import { TeamMember } from "@/lib/models/TeamMember";
import { Media } from "@/lib/models/Media";
import { requireAdminPage } from "@/lib/auth";
import { getContent } from "@/lib/content/get";
import { PageHeader } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const admin = await requireAdminPage();
  await connectDB();
  const [items, visibleItems, categories, featured, bestsellers, team, media, recent, contact] = await Promise.all([
    MenuItem.countDocuments(),
    MenuItem.countDocuments({ visible: true }),
    Category.countDocuments(),
    MenuItem.countDocuments({ featured: true }),
    MenuItem.countDocuments({ bestseller: true }),
    TeamMember.countDocuments(),
    Media.countDocuments(),
    MenuItem.find().sort({ updatedAt: -1 }).limit(6).select("name price updatedAt visible").lean(),
    getContent("contact"),
  ]);

  const stats = [
    { label: "Menu items", value: items, sub: `${visibleItems} visible`, icon: Coffee, href: "/admin/menu", tone: "bg-navy text-paper" },
    { label: "Categories", value: categories, sub: "On the menu", icon: Tags, href: "/admin/menu", tone: "bg-orange text-navy" },
    { label: "Featured / best sellers", value: `${featured} / ${bestsellers}`, sub: "Highlighted items", icon: Star, href: "/admin/menu", tone: "bg-blue-50 text-blue" },
    { label: "Team members", value: team, sub: `${media} images in library`, icon: Users, href: "/admin/team", tone: "bg-blue-50 text-blue" },
  ];

  const quick = [
    { href: "/admin/menu", label: "Update menu & prices", icon: Coffee },
    { href: "/admin/content/contact", label: "Change opening hours", icon: MapPin },
    { href: "/admin/content/home", label: "Edit homepage text", icon: BookOpen },
    { href: "/admin/media", label: "Upload photos", icon: ImageIcon },
  ];

  return (
    <>
      <PageHeader title={`Good to see you, ${admin.name.split(" ")[0]}`} description="Here’s a quick look at your website." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <span className={`inline-flex size-10 items-center justify-center rounded-xl ${s.tone}`}>
              <s.icon className="size-5" />
            </span>
            <p className="mt-5 font-display text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm font-medium text-navy">{s.label}</p>
            <p className="text-xs text-slate">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-white lg:col-span-2">
          <header className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-navy">Recently updated menu items</h2>
            <Link href="/admin/menu" className="inline-flex items-center gap-1 text-sm font-medium text-blue hover:underline">
              Manage menu <ArrowRight className="size-4" />
            </Link>
          </header>
          {recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate">No menu items yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((r) => (
                <li key={String(r._id)} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                  <span className="font-medium text-navy">
                    {r.name} {!r.visible && <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-xs text-slate">Hidden</span>}
                  </span>
                  <span className="flex items-center gap-4 text-sm">
                    <span className="font-semibold">{contact.currency}{Number(r.price).toFixed(2)}</span>
                    <span className="hidden text-slate sm:inline">{formatDate(r.updatedAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="font-semibold text-navy">Quick actions</h2>
          <ul className="mt-4 space-y-2">
            {quick.map((q) => (
              <li key={q.href + q.label}>
                <Link href={q.href} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-medium transition hover:border-blue hover:bg-blue-50">
                  <q.icon className="size-4 text-blue" /> {q.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href="/" target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue hover:underline">
            View website <ArrowRight className="size-4" />
          </a>
        </section>
      </div>
    </>
  );
}
