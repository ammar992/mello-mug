"use client";

import type { MediaDTO } from "@/lib/media";

export class ApiError extends Error {
  constructor(message: string, public status: number, public fieldErrors?: Record<string, string>) {
    super(message);
  }
}

/** Fetch wrapper for admin APIs: JSON in/out, throws ApiError, bounces to login on 401. */
export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...rest.headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.assign(new URL(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`, window.location.origin).href);
    throw new ApiError("Session expired", 401);
  }
  if (!res.ok || body.ok === false) throw new ApiError(body.error || `Request failed (${res.status})`, res.status, body.fieldErrors);
  return body as T;
}

export const MAX_UPLOAD_MB = 10;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/** Signed direct upload: browser → Cloudinary, then register the asset with our API. */
export async function uploadImage(file: File, onProgress?: (pct: number) => void): Promise<MediaDTO> {
  if (!ALLOWED.includes(file.type)) throw new Error("Please choose a JPG, PNG, WebP, AVIF or GIF image.");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`Images must be under ${MAX_UPLOAD_MB} MB.`);

  const { data: sig } = await api<{ data: { signature: string; timestamp: number; folder: string; apiKey: string; cloudName: string } }>(
    "/api/admin/media/sign",
    { method: "POST" },
  );

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", sig.folder);

  const result = await new Promise<{ public_id: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body?.error?.message || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });

  const { data } = await api<{ data: MediaDTO }>("/api/admin/media", {
    method: "POST",
    json: { publicId: result.public_id, originalName: file.name.slice(0, 200) },
  });
  return data;
}

/** Immutable deep set by path, e.g. setIn(obj, ["hero","heading"], "Hi") */
export function setIn<T>(obj: T, path: (string | number)[], value: unknown): T {
  if (!path.length) return value as T;
  const [head, ...rest] = path;
  const src = (obj ?? (typeof head === "number" ? [] : {})) as Record<string | number, unknown>;
  const copy = (Array.isArray(src) ? [...src] : { ...src }) as Record<string | number, unknown>;
  copy[head] = setIn(src[head], rest, value);
  return copy as T;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
