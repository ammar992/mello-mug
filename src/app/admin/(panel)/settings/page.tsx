import { CheckCircle2, XCircle } from "lucide-react";
import { requireAdminPage } from "@/lib/auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { Card, PageHeader } from "@/components/admin/ui";
import { PasswordForm } from "./PasswordForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const admin = await requireAdminPage();
  const checks = [
    { label: "Database (MongoDB)", ok: true, hint: "Connected" },
    { label: "Image storage (Cloudinary)", ok: isCloudinaryConfigured(), hint: isCloudinaryConfigured() ? `Folder: ${process.env.CLOUDINARY_FOLDER || "mellow-mug"}` : "Set CLOUDINARY_* environment variables" },
  ];
  return (
    <>
      <PageHeader title="Settings" description={`Signed in as ${admin.email}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Change password" description="Changing your password signs out all other sessions.">
          <PasswordForm />
        </Card>
        <Card title="Integrations" description="Configured by your developer via environment variables.">
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3">
                {c.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-navy">{c.label}</p>
                  <p className="text-xs text-slate">{c.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
