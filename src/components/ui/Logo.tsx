import { cn } from "@/lib/utils";

export function Logo({ name = "Mellow Mug", tone = "dark", className }: { name?: string; tone?: "dark" | "light"; className?: string }) {
  const fg = tone === "light" ? "#fffaf3" : "#24150e";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden>
        <circle cx="20" cy="20" r="19" fill={tone === "light" ? "#fffaf3" : "#24150e"} />
        <path d="M10 17h17v6a8.5 8.5 0 0 1-17 0z" fill={tone === "light" ? "#24150e" : "#fffaf3"} />
        <path d="M27 19h2a3.6 3.6 0 0 1 0 7.2h-2.6" fill="none" stroke={tone === "light" ? "#24150e" : "#fffaf3"} strokeWidth="2.2" />
        <ellipse cx="18.5" cy="17" rx="8.5" ry="1.9" fill="#c27a3e" />
        <path d="M15 8.5c-1.6 1.6 1.6 2.8 0 4.4M21 7.5c-1.6 1.6 1.6 2.8 0 4.4" stroke="#e2a866" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
      <span className="font-display text-[1.45rem] font-semibold italic leading-none tracking-[-0.02em]" style={{ color: fg, fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
        {name}
      </span>
    </span>
  );
}
