import type { MediaDoc } from "@/lib/models/Media";

export type MediaDTO = {
  id: string;
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  originalName: string;
  createdAt: string;
};

export function toMediaDTO(d: MediaDoc & { _id: unknown }): MediaDTO {
  return {
    id: String(d._id),
    url: d.url,
    publicId: d.publicId,
    width: d.width ?? 0,
    height: d.height ?? 0,
    bytes: d.bytes ?? 0,
    format: d.format ?? "",
    originalName: d.originalName ?? "",
    createdAt: new Date(d.createdAt).toISOString(),
  };
}
