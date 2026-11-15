import type { Metadata } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { AdminProviders } from "@/components/admin/AdminProviders";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Mellow Mug Admin" },
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

/** Root layout for the admin area (separate from the public site's per-language root layout). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <AdminProviders>{children}</AdminProviders>
      </body>
    </html>
  );
}
