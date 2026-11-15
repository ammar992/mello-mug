"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const CupScene = dynamic(() => import("./CupScene"), { ssr: false });

function canRun3D() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) return false;
  if ((nav.hardwareConcurrency ?? 8) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Static illustration — poster for the 3D scene and the low-power / reduced-motion fallback. */
export function CupIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 360" className={className} role="img" aria-label="A latte in a cream cup on a saucer">
      <ellipse cx="200" cy="318" rx="170" ry="26" fill="#3b2418" opacity="0.18" />
      <ellipse cx="200" cy="300" rx="165" ry="34" fill="#fbf3e8" stroke="#e3d4bf" strokeWidth="3" />
      <path d="M85 140 H315 Q312 250 250 282 Q200 298 150 282 Q88 250 85 140 Z" fill="#fbf3e8" stroke="#e3d4bf" strokeWidth="3" />
      <path d="M93 196 Q200 214 307 196" stroke="#c27a3e" strokeWidth="7" fill="none" />
      <path d="M312 165 h18 a34 34 0 0 1 0 68 h-30" fill="none" stroke="#fbf3e8" strokeWidth="16" />
      <ellipse cx="200" cy="142" rx="115" ry="22" fill="#5a3014" />
      <ellipse cx="200" cy="142" rx="102" ry="17" fill="#8a5129" />
      <path d="M200 160 C 176 148, 160 130, 176 124 C 188 120, 196 128, 200 135 C 204 128, 212 120, 224 124 C 240 130, 224 148, 200 160 Z" fill="#fff3e2" />
      {[160, 200, 240].map((x) => (
        <path key={x} d={`M${x} 110 c -14 -18, 14 -34, 0 -54 c -10 -14, 10 -28, 0 -44`} stroke="#fffaf3" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
      ))}
    </svg>
  );
}

export function HeroCup() {
  const ref = useRef<HTMLDivElement>(null);
  const [use3D, setUse3D] = useState(false);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canRun3D()) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    const start = () => setUse3D(true);
    if (w.requestIdleCallback) w.requestIdleCallback(start);
    else setTimeout(start, 300);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!use3D) return;
    const t = setTimeout(() => setReady(true), 450);
    return () => clearTimeout(t);
  }, [use3D]);

  return (
    <div ref={ref} className="relative size-full">
      <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-700" style={{ opacity: use3D && ready ? 0 : 1 }}>
        <CupIllustration className="w-[78%] drop-shadow-[0_30px_40px_rgb(59_36_24/0.25)]" />
      </div>
      {use3D && (
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
          <CupScene active={visible} />
        </div>
      )}
    </div>
  );
}
