"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Coffee, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { CategoryDTO, CategoryInput, MenuItemDTO, MenuItemInput } from "@/lib/content/schema";
import { ApiError, api } from "@/components/admin/client";
import { useConfirm } from "@/components/admin/Confirm";
import { ListEditor } from "@/components/admin/editor";
import { ImageField } from "@/components/admin/media";
import { Badge, Btn, Card, EmptyState, Modal, PageHeader, SelectField, TextField, Toggle } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const strip = <T extends { id: string; order: number }>(x: T) => {
  const { id: _id, order: _order, ...rest } = x;
  void _id;
  void _order;
  return rest;
};

function move<T>(arr: T[], from: number, to: number) {
  const c = [...arr];
  const [x] = c.splice(from, 1);
  c.splice(to, 0, x);
  return c;
}

/* ── inline price editor ───────────────────────────────── */
function PriceInput({ item, currency, onSave }: { item: MenuItemDTO; currency: string; onSave: (price: number) => Promise<void> }) {
  const [value, setValue] = useState(item.price.toFixed(2));
  const [saving, setSaving] = useState(false);
  const [lastPrice, setLastPrice] = useState(item.price);
  if (lastPrice !== item.price) {
    setLastPrice(item.price);
    setValue(item.price.toFixed(2));
  }
  async function commit() {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) {
      setValue(item.price.toFixed(2));
      toast.error("Enter a valid price");
      return;
    }
    if (Math.abs(n - item.price) < 0.001) return;
    setSaving(true);
    await onSave(Math.round(n * 100) / 100);
    setSaving(false);
  }
  return (
    <label className={cn("flex h-9 items-center rounded-lg border bg-white pl-2.5 text-sm transition focus-within:border-blue", saving ? "border-blue opacity-60" : "border-line")}>
      <span className="text-slate">{currency}</span>
      <input
        aria-label={`Price for ${item.name}`}
        inputMode="decimal"
        className="h-full w-16 bg-transparent px-1 font-semibold outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
    </label>
  );
}

export function MenuManager({ initialCategories, initialItems, currency }: { initialCategories: CategoryDTO[]; initialItems: MenuItemDTO[]; currency: string }) {
  const confirm = useConfirm();
  const [cats, setCats] = useState(initialCategories);
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const [catEdit, setCatEdit] = useState<{ id: string | null; data: CategoryInput } | null>(null);
  const [itemEdit, setItemEdit] = useState<{ id: string | null; data: MenuItemInput } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const catName = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.name])), [cats]);
  const shown = items.filter((i) => (filter === "all" || i.categoryId === filter) && (!q || i.name.toLowerCase().includes(q.toLowerCase())));

  /* categories */
  async function saveCategory() {
    if (!catEdit) return;
    setSaving(true);
    try {
      if (catEdit.id) {
        const { data } = await api<{ data: CategoryDTO }>(`/api/admin/categories/${catEdit.id}`, { method: "PUT", json: catEdit.data });
        setCats((l) => l.map((c) => (c.id === data.id ? data : c)));
      } else {
        const { data } = await api<{ data: CategoryDTO }>("/api/admin/categories", { method: "POST", json: catEdit.data });
        setCats((l) => [...l, data]);
      }
      toast.success("Category saved");
      setCatEdit(null);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) setErrors(e.fieldErrors);
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(c: CategoryDTO) {
    try {
      const { data } = await api<{ data: CategoryDTO }>(`/api/admin/categories/${c.id}`, { method: "PUT", json: { ...strip(c), visible: !c.visible } });
      setCats((l) => l.map((x) => (x.id === data.id ? data : x)));
      toast.success(data.visible ? "Category is visible" : "Category hidden from the website");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function deleteCategory(c: CategoryDTO) {
    if (!(await confirm({ title: `Delete “${c.name}”?`, message: "The category will be removed. Categories that still contain items can't be deleted.", confirmLabel: "Delete", danger: true }))) return;
    try {
      await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
      setCats((l) => l.filter((x) => x.id !== c.id));
      if (filter === c.id) setFilter("all");
      toast.success("Category deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function reorder(kind: "categories" | "menu-items", list: { id: string }[], rollback: () => void) {
    try {
      await api(`/api/admin/${kind}/reorder`, { method: "POST", json: { ids: list.map((x) => x.id) } });
    } catch (e) {
      rollback();
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  }

  /* items */
  async function putItem(it: MenuItemDTO, patch: Partial<MenuItemInput>, msg?: string) {
    try {
      const { data } = await api<{ data: MenuItemDTO }>(`/api/admin/menu-items/${it.id}`, { method: "PUT", json: { ...strip(it), ...patch } });
      setItems((l) => l.map((x) => (x.id === data.id ? data : x)));
      if (msg) toast.success(msg);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function saveItem() {
    if (!itemEdit) return;
    setSaving(true);
    setErrors({});
    try {
      if (itemEdit.id) {
        const { data } = await api<{ data: MenuItemDTO }>(`/api/admin/menu-items/${itemEdit.id}`, { method: "PUT", json: itemEdit.data });
        setItems((l) => l.map((x) => (x.id === data.id ? data : x)));
        toast.success("Menu item updated");
      } else {
        const { data } = await api<{ data: MenuItemDTO }>("/api/admin/menu-items", { method: "POST", json: itemEdit.data });
        setItems((l) => [...l, data]);
        toast.success("Menu item added");
      }
      setItemEdit(null);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) setErrors(e.fieldErrors);
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(it: MenuItemDTO) {
    if (!(await confirm({ title: `Delete “${it.name}”?`, message: "It will be removed from the menu. Tip: hide it instead if it's seasonal.", confirmLabel: "Delete", danger: true }))) return;
    try {
      await api(`/api/admin/menu-items/${it.id}`, { method: "DELETE" });
      setItems((l) => l.filter((x) => x.id !== it.id));
      toast.success("Menu item deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const newItem = (): MenuItemInput => ({
    name: "", description: "", price: 0, categoryId: filter !== "all" ? filter : cats[0]?.id ?? "",
    image: { url: "", publicId: "", alt: "" }, featured: false, bestseller: false, visible: true, tags: [],
    mk: { name: "", description: "", tags: [] },
  });
  const d = itemEdit?.data;
  const upd = (p: Partial<MenuItemInput>) => setItemEdit((e) => (e ? { ...e, data: { ...e.data, ...p } } : e));

  return (
    <>
      <PageHeader
        title="Menu & prices"
        description="Prices save as soon as you leave the price box. Star = featured, sparkle = best seller, eye = visible."
        actions={
          <Btn onClick={() => { setErrors({}); setItemEdit({ id: null, data: newItem() }); }} disabled={!cats.length}>
            <Plus className="size-4" /> Add menu item
          </Btn>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* categories */}
        <Card title="Categories" actions={<Btn size="sm" variant="secondary" onClick={() => { setErrors({}); setCatEdit({ id: null, data: { name: "", description: "", visible: true, mk: { name: "", description: "" } } }); }}><Plus className="size-4" /> Add</Btn>}>
          {cats.length === 0 ? (
            <p className="text-sm text-slate">Add your first category, e.g. “Espresso Bar”.</p>
          ) : (
            <ul className="-mx-2 space-y-1">
              <li>
                <button type="button" onClick={() => setFilter("all")} className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm", filter === "all" ? "bg-blue-50 font-semibold text-blue" : "hover:bg-mist")}>
                  All items <span className="text-xs text-slate">{items.length}</span>
                </button>
              </li>
              {cats.map((c, i) => (
                <li key={c.id} className={cn("group flex items-center rounded-lg", filter === c.id ? "bg-blue-50" : "hover:bg-mist")}>
                  <button type="button" onClick={() => setFilter(c.id)} className={cn("min-w-0 flex-1 truncate px-3 py-2 text-left text-sm", filter === c.id && "font-semibold text-blue", !c.visible && "text-slate line-through")}>
                    {c.name} <span className="ml-1 text-xs text-slate">{items.filter((x) => x.categoryId === c.id).length}</span>
                  </button>
                  <div className="flex shrink-0 pr-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                    <button type="button" disabled={i === 0} onClick={() => { const prev = cats; const next = move(cats, i, i - 1); setCats(next); void reorder("categories", next, () => setCats(prev)); }} className="rounded p-1 text-slate hover:text-navy disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-3.5" /></button>
                    <button type="button" disabled={i === cats.length - 1} onClick={() => { const prev = cats; const next = move(cats, i, i + 1); setCats(next); void reorder("categories", next, () => setCats(prev)); }} className="rounded p-1 text-slate hover:text-navy disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-3.5" /></button>
                    <button type="button" onClick={() => toggleCategory(c)} className="rounded p-1 text-slate hover:text-navy" aria-label={c.visible ? "Hide category" : "Show category"}>{c.visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}</button>
                    <button type="button" onClick={() => { setErrors({}); setCatEdit({ id: c.id, data: strip(c) }); }} className="rounded p-1 text-slate hover:text-navy" aria-label="Rename category"><Pencil className="size-3.5" /></button>
                    <button type="button" onClick={() => deleteCategory(c)} className="rounded p-1 text-slate hover:text-red-600" aria-label="Delete category"><Trash2 className="size-3.5" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* items */}
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden />
            <input className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-blue" placeholder="Search menu items…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search menu items" />
          </div>
          {shown.length === 0 ? (
            <EmptyState title="No menu items here" description={cats.length ? "Add an item or pick another category." : "Create a category first."} />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
              {shown.map((it) => {
                const idx = items.findIndex((x) => x.id === it.id);
                return (
                  <li key={it.id} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-mist">
                      {it.image.url ? <Image src={it.image.url} alt="" fill sizes="56px" className="object-cover" /> : <Coffee className="absolute inset-0 m-auto size-6 text-slate" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate font-semibold text-navy", !it.visible && "text-slate line-through")}>{it.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-slate">{catName[it.categoryId] ?? "—"}</span>
                        {it.featured && <Badge tone="blue">Featured</Badge>}
                        {it.bestseller && <Badge tone="orange">Best seller</Badge>}
                        {!it.visible && <Badge>Hidden</Badge>}
                      </div>
                    </div>
                    <PriceInput item={it} currency={currency} onSave={(price) => putItem(it, { price }, "Price updated")} />
                    <div className="flex shrink-0 items-center">
                      <button type="button" onClick={() => putItem(it, { featured: !it.featured }, it.featured ? "Removed from featured" : "Added to featured")} className={cn("rounded-lg p-2 hover:bg-mist", it.featured ? "text-blue" : "text-slate")} aria-label="Toggle featured" title="Featured"><Star className="size-4" fill={it.featured ? "currentColor" : "none"} /></button>
                      <button type="button" onClick={() => putItem(it, { bestseller: !it.bestseller }, it.bestseller ? "Removed from best sellers" : "Marked as best seller")} className={cn("rounded-lg p-2 hover:bg-mist", it.bestseller ? "text-orange" : "text-slate")} aria-label="Toggle best seller" title="Best seller"><Sparkles className="size-4" /></button>
                      <button type="button" onClick={() => putItem(it, { visible: !it.visible }, it.visible ? "Hidden from menu" : "Visible on menu")} className="rounded-lg p-2 text-slate hover:bg-mist" aria-label="Toggle visibility" title="Visible">{it.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                      {filter === "all" && !q && (
                        <>
                          <button type="button" disabled={idx === 0} onClick={() => { const prev = items; const next = move(items, idx, idx - 1); setItems(next); void reorder("menu-items", next, () => setItems(prev)); }} className="rounded-lg p-2 text-slate hover:bg-mist disabled:opacity-30" aria-label="Move up"><ArrowUp className="size-4" /></button>
                          <button type="button" disabled={idx === items.length - 1} onClick={() => { const prev = items; const next = move(items, idx, idx + 1); setItems(next); void reorder("menu-items", next, () => setItems(prev)); }} className="rounded-lg p-2 text-slate hover:bg-mist disabled:opacity-30" aria-label="Move down"><ArrowDown className="size-4" /></button>
                        </>
                      )}
                      <button type="button" onClick={() => { setErrors({}); setItemEdit({ id: it.id, data: strip(it) }); }} className="rounded-lg p-2 text-slate hover:bg-mist" aria-label="Edit item"><Pencil className="size-4" /></button>
                      <button type="button" onClick={() => deleteItem(it)} className="rounded-lg p-2 text-slate hover:bg-red-50 hover:text-red-600" aria-label="Delete item"><Trash2 className="size-4" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {filter !== "all" && <p className="mt-2 text-xs text-slate">Tip: switch to “All items” to reorder the menu.</p>}
        </div>
      </div>

      {/* category modal */}
      <Modal open={Boolean(catEdit)} onClose={() => !saving && setCatEdit(null)} title={catEdit?.id ? "Edit category" : "Add category"}
        footer={<><Btn variant="secondary" onClick={() => setCatEdit(null)} disabled={saving}>Cancel</Btn><Btn onClick={saveCategory} loading={saving}>Save</Btn></>}>
        {catEdit && (
          <div className="space-y-4">
            <TextField label="Name" required value={catEdit.data.name} onChange={(name) => setCatEdit({ ...catEdit, data: { ...catEdit.data, name } })} max={40} error={errors.name} />
            <TextField label="Short description" value={catEdit.data.description} onChange={(description) => setCatEdit({ ...catEdit, data: { ...catEdit.data, description } })} max={160} />
            <div className="space-y-4 rounded-xl border border-blue/25 bg-blue-50/60 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><span className="rounded-md bg-white px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wider text-blue">МК</span> Македонски <span className="font-normal text-slate">— optional, English is shown if empty</span></p>
              <TextField label="Име (МК)" value={catEdit.data.mk.name} onChange={(name) => setCatEdit({ ...catEdit, data: { ...catEdit.data, mk: { ...catEdit.data.mk, name } } })} max={40} placeholder={catEdit.data.name} />
              <TextField label="Опис (МК)" value={catEdit.data.mk.description} onChange={(description) => setCatEdit({ ...catEdit, data: { ...catEdit.data, mk: { ...catEdit.data.mk, description } } })} max={160} placeholder={catEdit.data.description} />
            </div>
            <Toggle label="Visible on website" checked={catEdit.data.visible} onChange={(visible) => setCatEdit({ ...catEdit, data: { ...catEdit.data, visible } })} />
          </div>
        )}
      </Modal>

      {/* item modal */}
      <Modal open={Boolean(itemEdit)} onClose={() => !saving && setItemEdit(null)} title={itemEdit?.id ? "Edit menu item" : "Add menu item"} size="lg"
        footer={<><Btn variant="secondary" onClick={() => setItemEdit(null)} disabled={saving}>Cancel</Btn><Btn onClick={saveItem} loading={saving}>{itemEdit?.id ? "Save item" : "Add item"}</Btn></>}>
        {d && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
              <TextField label="Name" required value={d.name} onChange={(name) => upd({ name })} max={60} error={errors.name} />
              <TextField label={`Price (${currency})`} required type="number" value={String(d.price)} onChange={(v) => upd({ price: v === "" ? 0 : Number(v) })} error={errors.price} />
            </div>
            <SelectField label="Category" value={d.categoryId} onChange={(categoryId) => upd({ categoryId })} options={cats.map((c) => ({ value: c.id, label: c.name }))} />
            <TextField label="Description" multiline rows={3} value={d.description} onChange={(description) => upd({ description })} max={300} error={errors.description} />
            <ImageField label="Product photo" value={d.image} onChange={(image) => upd({ image })} aspect="aspect-[4/3]" />
            <div>
              <p className="mb-2 text-sm font-medium text-navy">Tags <span className="font-normal text-slate">(e.g. Vegan, Seasonal — max 4)</span></p>
              <ListEditor items={d.tags.map((text) => ({ text }))} onChange={(l) => upd({ tags: l.map((x) => x.text) })} create={() => ({ text: "" })} itemLabel={(x) => x.text} max={4} addLabel="Add tag"
                render={(x, update) => <TextField label="Tag" value={x.text} onChange={(text) => update({ text })} max={24} />} />
            </div>
            <div className="space-y-4 rounded-xl border border-blue/25 bg-blue-50/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-navy"><span className="rounded-md bg-white px-1.5 py-0.5 text-[0.7rem] font-bold tracking-wider text-blue">МК</span> Македонски <span className="font-normal text-slate">— optional, English is shown if empty</span></p>
              <TextField label="Име (МК)" value={d.mk.name} onChange={(name) => upd({ mk: { ...d.mk, name } })} max={60} placeholder={d.name} />
              <TextField label="Опис (МК)" multiline rows={2} value={d.mk.description} onChange={(description) => upd({ mk: { ...d.mk, description } })} max={300} placeholder={d.description} />
              <TextField label="Ознаки (МК) — comma separated" value={d.mk.tags.join(", ")} onChange={(v) => upd({ mk: { ...d.mk, tags: v.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 4) } })} placeholder={d.tags.join(", ")} />
            </div>
            <div className="space-y-4 rounded-xl border border-line p-4">
              <Toggle label="Featured" description="Shown first in the homepage menu." checked={d.featured} onChange={(featured) => upd({ featured })} />
              <Toggle label="Best seller" description="Shown in the Best sellers section with a badge." checked={d.bestseller} onChange={(bestseller) => upd({ bestseller })} />
              <Toggle label="Visible on website" checked={d.visible} onChange={(visible) => upd({ visible })} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
