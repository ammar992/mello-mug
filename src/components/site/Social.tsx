import type { SocialKey } from "@/lib/content/schema";

const PATHS: Record<SocialKey, string> = {
  facebook: "M14 8.5V6.8c0-.8.5-1 .9-1H17V2.1L14 2c-3.3 0-4 2.4-4 4v2.5H8V12h2v10h4V12h2.7l.4-3.5H14z",
  instagram: "M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm4.9-8.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 7c0-1.4-.4-2.6-1.4-3.6S18.3 2 17 2H7C5.6 2 4.4 2.4 3.4 3.4S2 5.6 2 7v10c0 1.4.4 2.6 1.4 3.6S5.7 22 7 22h10c1.4 0 2.6-.4 3.6-1.4s1.4-2.2 1.4-3.6V7zm-1.8 10c0 .9-.3 1.6-.9 2.2-.6.6-1.3.9-2.2.9H7c-.9 0-1.6-.3-2.2-.9-.6-.6-.9-1.3-.9-2.2V7c0-.9.3-1.6.9-2.2.6-.6 1.3-.9 2.2-.9h10c.9 0 1.6.3 2.2.9.6.6.9 1.3.9 2.2v10z",
  x: "M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2.2 3h6.2l4.3 5.7L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z",
  youtube: "M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12c0 1.6.2 3.2.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.3-1.6.5-3.2.5-4.8s-.2-3.2-.5-4.8zM9.8 15V9l5.8 3-5.8 3z",
  tiktok: "M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2-2.8V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a7.9 7.9 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7z",
  google: "M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14zM12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10c.8-2.4 3-4.1 5.6-4.1z",
};

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  facebook: "Facebook", instagram: "Instagram", x: "X (Twitter)",
  youtube: "YouTube", tiktok: "TikTok", google: "Google Maps",
};

export function SocialIcon({ name, className }: { name: SocialKey; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className} width="18" height="18">
      <path d={PATHS[name]} />
    </svg>
  );
}
