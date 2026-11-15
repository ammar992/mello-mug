"use client";

import { useRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Adds a soft glow that follows the pointer (desktop). Style via the `.spotlight` class + `--spot` colour. */
export function Spotlight({ className, children, color, ...rest }: HTMLAttributes<HTMLDivElement> & { color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      {...rest}
      className={cn("spotlight", className)}
      style={color ? { ...rest.style, ["--spot" as string]: color } : rest.style}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--sx", `${e.clientX - r.left}px`);
        el.style.setProperty("--sy", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
