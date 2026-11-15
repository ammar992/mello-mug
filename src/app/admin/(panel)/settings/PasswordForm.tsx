"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ApiError, api } from "@/components/admin/client";
import { Btn, TextField } from "@/components/admin/ui";

export function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = "Enter your current password";
    if (form.newPassword.length < 10) e.newPassword = "Use at least 10 characters";
    else if (!/[a-z]/i.test(form.newPassword) || !/\d/.test(form.newPassword)) e.newPassword = "Include at least one letter and one number";
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await api("/api/admin/password", { method: "POST", json: form });
      toast.success("Password updated");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors);
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <TextField label="Current password" type="password" value={form.currentPassword} onChange={set("currentPassword")} error={errors.currentPassword} />
      <TextField label="New password" type="password" value={form.newPassword} onChange={set("newPassword")} error={errors.newPassword} hint="At least 10 characters, with a letter and a number." />
      <TextField label="Confirm new password" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
      <Btn type="submit" loading={saving}>Update password</Btn>
    </form>
  );
}
