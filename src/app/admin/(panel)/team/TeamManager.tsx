"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { TeamDTO, TeamInput } from "@/lib/content/schema";
import { ApiError, api } from "@/components/admin/client";
import { useConfirm } from "@/components/admin/Confirm";
import { ImageField } from "@/components/admin/media";
import { Badge, Btn, EmptyState, Modal, PageHeader, TextField, Toggle } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const blank = (): TeamInput => ({ name: "", role: "", bio: "", photo: { url: "", publicId: "", alt: "" }, visible: true, mk: { role: "", bio: "" } });
const strip = (m: TeamDTO): TeamInput => ({ name: m.name, role: m.role, bio: m.bio, photo: m.photo, visible: m.visible, mk: m.mk });

export function TeamManager({ initial }: { initial: TeamDTO[] }) {
  const confirm = useConfirm();
  const [team, setTeam] = useState(initial);
  const [edit, setEdit] = useState<{ id: string | null; data: TeamInput } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!edit) return;
    setSaving(true);
    setErrors({});
    try {
      if (edit.id) {
        const { data } = await api<{ data: TeamDTO }>(`/api/admin/team/${edit.id}`, { method: "PUT", json: edit.data });
        setTeam((l) => l.map((m) => (m.id === data.id ? data : m)));
      } else {
        const { data } = await api<{ data: TeamDTO }>("/api/admin/team", { method: "POST", json: edit.data });
        setTeam((l) => [...l, data]);
      }
      toast.success("Team member saved");
      setEdit(null);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) setErrors(e.fieldErrors);
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(m: TeamDTO) {
    try {
      const { data } = await api<{ data: TeamDTO }>(`/api/admin/team/${m.id}`, { method: "PUT", json: { ...strip(m), visible: !m.visible } });
      setTeam((l) => l.map((x) => (x.id === data.id ? data : x)));
      toast.success(data.visible ? "Now visible on the website" : "Hidden from the website");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function remove(m: TeamDTO) {
    if (!(await confirm({ title: `Remove ${m.name}?`, message: "They will be removed from the website.", confirmLabel: "Remove", danger: true }))) return;
    try {
      await api(`/api/admin/team/${m.id}`, { method: "DELETE" });
      setTeam((l) => l.filter((x) => x.id !== m.id));
      toast.success("Team member removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function moveTo(from: number, to: number) {
    const prev = team;
    const next = [...team];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    setTeam(next);
    try {
      await api("/api/admin/team/reorder", { method: "POST", json: { ids: next.map((m) => m.id) } });
    } catch (e) {
      setTeam(prev);
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  }

  const d = edit?.data;
  const upd = (p: Partial<TeamInput>) => setEdit((e) => (e ? { ...e, data: { ...e.data, ...p } } : e));

  return (
    <>
      <PageHeader title="Team" description="The friendly faces shown in “Meet the team”." actions={<Btn onClick={() => { setErrors({}); setEdit({ id: null, data: blank() }); }}><Plus className="size-4" /> Add team member</Btn>} />

      {team.length === 0 ? (
        <EmptyState title="No team members yet" description="Add your baristas, bakers and managers." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <li key={m.id} className={cn("overflow-hidden rounded-2xl border border-line bg-white", !m.visible && "opacity-70")}>
              <div className="relative aspect-[4/3] bg-mist">
                {m.photo.url ? <Image src={m.photo.url} alt="" fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover" /> : <UserRound className="absolute inset-0 m-auto size-10 text-slate" />}
                {!m.visible && <span className="absolute left-3 top-3"><Badge>Hidden</Badge></span>}
              </div>
              <div className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy">{m.name}</p>
                  <p className="truncate text-sm text-slate">{m.role}</p>
                </div>
                <div className="flex shrink-0">
                  <button type="button" disabled={i === 0} onClick={() => moveTo(i, i - 1)} className="rounded-lg p-1.5 text-slate hover:bg-mist disabled:opacity-30" aria-label="Move earlier"><ArrowUp className="size-4" /></button>
                  <button type="button" disabled={i === team.length - 1} onClick={() => moveTo(i, i + 1)} className="rounded-lg p-1.5 text-slate hover:bg-mist disabled:opacity-30" aria-label="Move later"><ArrowDown className="size-4" /></button>
                  <button type="button" onClick={() => toggle(m)} className="rounded-lg p-1.5 text-slate hover:bg-mist" aria-label={m.visible ? "Hide" : "Show"}>{m.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                  <button type="button" onClick={() => { setErrors({}); setEdit({ id: m.id, data: strip(m) }); }} className="rounded-lg p-1.5 text-slate hover:bg-mist" aria-label="Edit"><Pencil className="size-4" /></button>
                  <button type="button" onClick={() => remove(m)} className="rounded-lg p-1.5 text-slate hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={Boolean(edit)} onClose={() => !saving && setEdit(null)} title={edit?.id ? "Edit team member" : "Add team member"} size="lg"
        footer={<><Btn variant="secondary" onClick={() => setEdit(null)} disabled={saving}>Cancel</Btn><Btn onClick={save} loading={saving}>Save</Btn></>}>
        {d && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" required value={d.name} onChange={(name) => upd({ name })} max={60} error={errors.name} />
              <TextField label="Role" required value={d.role} onChange={(role) => upd({ role })} max={60} error={errors.role} placeholder="Head Barista" />
            </div>
            <TextField label="Short bio" multiline rows={2} value={d.bio} onChange={(bio) => upd({ bio })} max={300} />
            <ImageField label="Photo" value={d.photo} onChange={(photo) => upd({ photo })} aspect="aspect-[3/4]" hint="Portrait photos work best." />
            <div className="space-y-4 rounded-xl border border-blue/25 bg-blue-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><span className="rounded-md bg-white px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wider text-blue">МК</span> Македонски <span className="font-normal text-slate">— optional, English is shown if empty</span></p>
              <TextField label="Улога (МК)" value={d.mk.role} onChange={(role) => upd({ mk: { ...d.mk, role } })} max={60} placeholder={d.role} />
              <TextField label="Кратка биографија (МК)" multiline rows={2} value={d.mk.bio} onChange={(bio) => upd({ mk: { ...d.mk, bio } })} max={300} placeholder={d.bio} />
            </div>
            <Toggle label="Visible on website" checked={d.visible} onChange={(visible) => upd({ visible })} />
          </div>
        )}
      </Modal>
    </>
  );
}
