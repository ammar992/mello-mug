import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Infinite horizontal ticker. Content is duplicated for a seamless loop; pauses on hover. */
export function Marquee({ children, duration = 40, className }: { children: ReactNode; duration?: number; className?: string }) {
  return (
    <div className={cn("marquee-host mask-fade-x overflow-hidden", className)}>
      <div className="animate-marquee flex w-max motion-reduce:animate-none" style={{ ["--marquee-duration" as string]: `${duration}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
