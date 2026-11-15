import { requireAdminPage } from "@/lib/auth";
import { getContent } from "@/lib/content/get";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const contact = await getContent("contact");
  return (
    <div className="min-h-svh bg-paper">
      <Sidebar admin={admin} businessName={contact.businessName} />
      <div className="lg:pl-68">
        <main className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</main>
      </div>
    </div>
  );
}
