"use client";

import Image from "next/image";
import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api, formatBytes } from "@/components/admin/client";
import { useConfirm } from "@/components/admin/Confirm";
import { UploadDropzone, useMediaLibrary } from "@/components/admin/media";
import { Btn, EmptyState, Modal, Spinner } from "@/components/admin/ui";
import type { MediaDTO } from "@/lib/media";
import { formatDate } from "@/lib/utils";

export function MediaLibrary() {
  const { items, setItems, error, reload } = useMediaLibrary();
  const confirm = useConfirm();
  const [preview, setPreview] = useState<MediaDTO | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function remove(m: MediaDTO) {
    const ok = await confirm({
      title: "Delete this image?",
      message: "It will be permanently removed from Cloudinary. Any page still using it will show an empty image slot until you choose a replacement.",
      confirmLabel: "Delete image",
      danger: true,
    });
    if (!ok) return;
    setDeleting(m.id);
    try {
      await api(`/api/admin/media/${m.id}`, { method: "DELETE" });
      setItems((list) => list?.filter((x) => x.id !== m.id) ?? null);
      setPreview(null);
      toast.success("Image deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-6">
      <UploadDropzone onUploaded={(m) => setItems((list) => [m, ...(list ?? [])])} />

      {error ? (
        <EmptyState title="Couldn’t load images" description={error} action={<Btn variant="secondary" onClick={reload}>Retry</Btn>} />
      ) : !items ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyState title="No images yet" description="Upload your first image above." />
      ) : (
        <>
          <p className="text-sm text-slate">{items.length} image{items.length === 1 ? "" : "s"}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m) => (
              <li key={m.id} className="group overflow-hidden rounded-xl border border-line bg-white">
                <button type="button" onClick={() => setPreview(m)} className="relative block aspect-[4/3] w-full bg-mist" aria-label={`Preview ${m.originalName || m.publicId}`}>
                  <Image src={m.url} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                </button>
                <div className="flex items-center gap-2 p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-navy">{m.originalName || m.publicId.split("/").pop()}</p>
                    <p className="text-[0.7rem] text-slate">{m.width}×{m.height} · {formatBytes(m.bytes)}</p>
                  </div>
                  <button type="button" onClick={() => remove(m)} disabled={deleting === m.id} className="rounded-lg p-1.5 text-slate hover:bg-red-50 hover:text-red-600" aria-label="Delete image">
                    {deleting === m.id ? <Spinner className="size-4" /> : <Trash2 className="size-4" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.originalName || "Image"}
        size="xl"
        footer={
          preview && (
            <>
              <Btn
                variant="secondary"
                onClick={async () => {
                  await navigator.clipboard.writeText(preview.url);
                  toast.success("Image URL copied");
                }}
              >
                <Copy className="size-4" /> Copy URL
              </Btn>
              <Btn variant="danger" loading={deleting === preview.id} onClick={() => remove(preview)}>
                <Trash2 className="size-4" /> Delete
              </Btn>
            </>
          )
        }
      >
        {preview && (
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-mist">
              <Image src={preview.url} alt="" fill sizes="900px" className="object-contain" />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-slate">Dimensions</dt><dd className="font-medium">{preview.width}×{preview.height}</dd></div>
              <div><dt className="text-slate">Size</dt><dd className="font-medium">{formatBytes(preview.bytes)}</dd></div>
              <div><dt className="text-slate">Format</dt><dd className="font-medium uppercase">{preview.format}</dd></div>
              <div><dt className="text-slate">Uploaded</dt><dd className="font-medium">{formatDate(preview.createdAt, false)}</dd></div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
