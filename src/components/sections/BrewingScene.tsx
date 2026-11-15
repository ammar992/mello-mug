"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeContent } from "@/lib/content/schema";
import { cn } from "@/lib/utils";

/* Pile positions for the 14 beans (above the grinder hopper) */
const BEANS = [
  [178, 118, -20], [204, 108, 30], [232, 114, -50], [258, 106, 15], [284, 120, 60],
  [190, 136, 70], [218, 132, -10], [246, 130, 40], [272, 138, -35], [204, 152, 20],
  [232, 150, -60], [260, 154, 10], [218, 168, 45], [246, 168, -25],
] as const;
const GROUNDS = Array.from({ length: 16 }, (_, i) => ({ x: 222 + ((i * 7) % 17), d: (i % 4) * 0.06 }));

const STEPS = 7;

/** camera framing: centre point P at scale s → translate so P sits at screen point (cx, 360) */
const makeFrame = (cx: number, cy = 360) => (px: number, py: number, s: number) => ({ x: cx - s * px, y: cy - s * py, scale: s, svgOrigin: "0 0" });

function Bean({ i }: { i: number }) {
  return (
    <g data-bean={i}>
      <ellipse rx="10.5" ry="14" fill="url(#beanGrad)" />
      <path d="M0 -11 C 4.5 -4, -4.5 4, 0 11" stroke="#1c100a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function BrewingScene({ brewing }: { brewing: HomeContent["brewing"] }) {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      const t = setTimeout(() => setReduced(true), 0);
      return () => clearTimeout(t);
    }
    gsap.registerPlugin(ScrollTrigger);
    // on wide screens keep the action right of the heading / caption card
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    // phones: frame higher so the caption card never covers the action
    const frame = makeFrame(wide ? 640 : 500, wide ? 360 : 300);
    const finalFrame = makeFrame(500);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const cam = q("[data-cam]");
      const beans = q("[data-bean]");

      // initial states
      gsap.set(cam, frame(235, 300, 1.3));
      beans.forEach((b, i) => gsap.set(b, { x: BEANS[i][0], y: -80 - (i % 5) * 40, rotation: BEANS[i][2], opacity: 0 }));
      gsap.set(q("[data-grounds] circle"), { opacity: 0, y: 0 });
      gsap.set(q("[data-hopper-fill]"), { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(q("[data-basket-fill]"), { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(q("[data-portafilter]"), { x: 230, y: 540 });
      gsap.set(q("[data-water] line"), { scaleY: 0, transformOrigin: "50% 0%", opacity: 0 });
      gsap.set(q("[data-stream]"), { scaleY: 0, transformOrigin: "50% 0%" });
      gsap.set(q("[data-cup-fill]"), { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(q("[data-steam] path"), { opacity: 0, y: 20, strokeDasharray: 120, strokeDashoffset: 120 });
      gsap.set(q("[data-needle]"), { rotation: -70, svgOrigin: "560 300" });
      gsap.set(q("[data-burr]"), { rotation: 0, svgOrigin: "230 352" });
      gsap.set(q("[data-final]"), { opacity: 0, scale: 0.7, svgOrigin: "500 390" });
      gsap.set(q("[data-final-steam] path"), { strokeDasharray: 140, strokeDashoffset: 140 });

      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          onUpdate: (self) => setStep(Math.min(STEPS - 1, Math.floor(self.progress * STEPS * 0.9999))),
        },
      });

      // 1 · beans appear
      tl.to(beans, { y: (i) => BEANS[i][1], opacity: 1, rotation: (i) => BEANS[i][2] + 40, duration: 0.7, ease: "bounce.out", stagger: 0.02 }, 0);
      tl.to(cam, { ...frame(235, 260, 1.45), duration: 1 }, 0);

      // 2 · into the grinder
      tl.to(beans, { x: (i) => 205 + (i % 5) * 12, y: (i) => 200 + Math.floor(i / 5) * 14, scale: 0.6, duration: 0.55, stagger: 0.015 }, 1);
      tl.to(beans, { opacity: 0, duration: 0.2 }, 1.55);
      tl.to(q("[data-hopper-fill]"), { scaleY: 1, duration: 0.4 }, 1.4);
      tl.to(q("[data-burr]"), { rotation: 900, duration: 1.4, ease: "none" }, 1.5);
      tl.to(q("[data-grinder-led]"), { fill: "#7ee08a", duration: 0.1 }, 1.5);
      tl.to(cam, { ...frame(235, 380, 1.4), duration: 1 }, 1);

      // 3 · grounds fall, portafilter moves to the machine
      tl.to(q("[data-hopper-fill]"), { scaleY: 0.25, duration: 0.6 }, 2);
      tl.fromTo(q("[data-grounds] circle"), { y: 0, opacity: 1 }, { y: 44, opacity: 0, duration: 0.25, stagger: { each: 0.025, repeat: 1 }, ease: "none" }, 2);
      tl.to(q("[data-basket-fill]"), { scaleY: 1, duration: 0.5 }, 2.05);
      tl.to(q("[data-grinder-led]"), { fill: "#c2ab95", duration: 0.1 }, 2.55);
      tl.to(q("[data-portafilter]"), { x: 650, y: 428, duration: 0.45, ease: "power3.inOut" }, 2.55);
      tl.to(cam, { ...frame(560, 420, 1.15), duration: 0.5 }, 2.5);

      // 4 · hot water
      tl.to(cam, { ...frame(640, 420, 1.45), duration: 0.6 }, 3);
      tl.to(q("[data-needle]"), { rotation: 35, duration: 0.6 }, 3);
      tl.to(q("[data-boiler-glow]"), { opacity: 1, duration: 0.4 }, 3);
      tl.to(q("[data-water] line"), { scaleY: 1, opacity: 0.9, duration: 0.3, stagger: 0.05 }, 3.2);
      tl.to(q("[data-basket-fill]"), { fill: "#2a160c", duration: 0.4 }, 3.4);
      tl.to(q("[data-water] line"), { opacity: 0, duration: 0.2 }, 3.85);

      // 5 · coffee fills the cup
      tl.to(cam, { ...frame(650, 500, 1.55), duration: 0.6 }, 4);
      tl.to(q("[data-stream]"), { scaleY: 1, duration: 0.25, stagger: 0.05 }, 4.05);
      tl.to(q("[data-cup-fill]"), { scaleY: 1, duration: 0.7, ease: "power1.inOut" }, 4.2);
      tl.to(q("[data-crema]"), { opacity: 1, duration: 0.3 }, 4.65);
      tl.to(q("[data-stream]"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.2 }, 4.85);

      // 6 · steam rises
      tl.to(cam, { ...frame(650, 470, 1.8), duration: 1 }, 5);
      tl.to(q("[data-steam] path"), { opacity: 0.85, y: -28, strokeDashoffset: 0, duration: 0.8, stagger: 0.1, ease: "power1.out" }, 5.05);

      // 7 · the final cup
      tl.to(cam, { ...finalFrame(500, 360, 1), opacity: 0.08, duration: 0.6 }, 6);
      tl.to(q("[data-final]"), { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" }, 6.15);
      tl.to(q("[data-final-steam] path"), { strokeDashoffset: 0, duration: 0.5, stagger: 0.08 }, 6.4);
      tl.to({}, { duration: 0.15 }, 6.85);
    }, el);

    return () => ctx.revert();
  }, []);

  const s = brewing.steps[step] ?? brewing.steps[0];
  const done = step === STEPS - 1;

  if (reduced) {
    return (
      <section id="brewing" className="section-y bg-latte">
        <div className="container-x">
          <p className="eyebrow text-caramel">{brewing.eyebrow}</p>
          <h2 className="display-lg mt-4 max-w-[16ch]">{brewing.heading}</h2>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brewing.steps.map((st, i) => (
              <li key={i} className="rounded-[var(--radius-card)] bg-foam p-6">
                <p className="font-display text-3xl text-caramel">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-xl font-semibold">{st.title}</h3>
                {st.description && <p className="mt-2 text-muted">{st.description}</p>}
              </li>
            ))}
          </ol>
          <p className="mt-12 font-display text-3xl">{brewing.finalHeading}</p>
          {brewing.finalMessage && <p className="mt-2 text-muted">{brewing.finalMessage}</p>}
        </div>
      </section>
    );
  }

  return (
    <section ref={root} id="brewing" className="relative h-[560vh] bg-latte md:h-[640vh]" aria-label={brewing.heading}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* warm backdrop */}
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#f7ead7_0%,#ecdfcc_45%,#d9c2a3_100%)]" />
        <div aria-hidden className="grain absolute inset-0" />

        <svg viewBox="0 0 1000 720" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" role="img" aria-label="Coffee being made: beans, grinder, espresso machine and cup">
          <defs>
            <linearGradient id="beanGrad" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#7a4a2c" /><stop offset="1" stopColor="#3b2418" /></linearGradient>
            <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b8875c" /><stop offset="1" stopColor="#8a5f3c" /></linearGradient>
            <linearGradient id="grinderBody" x1="0" x2="1"><stop offset="0" stopColor="#2a1a12" /><stop offset="0.55" stopColor="#4a2e1f" /><stop offset="1" stopColor="#24150e" /></linearGradient>
            <linearGradient id="machineBody" x1="0" x2="1"><stop offset="0" stopColor="#d9cbb8" /><stop offset="0.35" stopColor="#f6efe5" /><stop offset="1" stopColor="#cbbaa4" /></linearGradient>
            <linearGradient id="steel" x1="0" x2="1"><stop offset="0" stopColor="#7d8794" /><stop offset="0.5" stopColor="#e3e7ec" /><stop offset="1" stopColor="#6f7884" /></linearGradient>
            <linearGradient id="coffeeFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6b3f22" /><stop offset="1" stopColor="#2a160c" /></linearGradient>
            <linearGradient id="glassG" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="1" stopColor="#fff" stopOpacity="0.15" /></linearGradient>
            <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffb36b" stopOpacity="0.7" /><stop offset="1" stopColor="#ffb36b" stopOpacity="0" /></radialGradient>
            <clipPath id="hopperClip"><path d="M172 152 H288 L262 258 H198 Z" /></clipPath>
            <clipPath id="cupClip"><path d="M614 508 H686 L680 556 Q650 576 620 556 Z" /></clipPath>
            <clipPath id="basketClip"><rect x="-32" y="-11" width="64" height="12" rx="3" /></clipPath>
          </defs>

          <g data-cam>
            {/* wall shelf + counter */}
            <rect x="-400" y="600" width="1800" height="300" fill="url(#wood)" />
            <rect x="-400" y="600" width="1800" height="10" fill="#d4a679" />
            <ellipse cx="230" cy="602" rx="110" ry="8" fill="#000" opacity="0.18" />
            <ellipse cx="650" cy="602" rx="210" ry="10" fill="#000" opacity="0.18" />

            {/* ── GRINDER ── */}
            <g>
              <path d="M172 152 H288 L262 258 H198 Z" fill="url(#glassG)" stroke="#8a6a50" strokeWidth="3" />
              <g clipPath="url(#hopperClip)">
                <g data-hopper-fill>
                  <rect x="170" y="196" width="120" height="64" fill="#4a2c1b" />
                  {Array.from({ length: 18 }).map((_, i) => (
                    <ellipse key={i} cx={180 + (i % 6) * 18} cy={204 + Math.floor(i / 6) * 18} rx="7" ry="9.5" fill="#6b4025" stroke="#2a160c" strokeWidth="1.2" />
                  ))}
                </g>
              </g>
              <rect x="166" y="146" width="128" height="10" rx="5" fill="#3b2418" />
              <rect x="205" y="258" width="50" height="28" fill="#1c100a" />
              <rect x="165" y="284" width="130" height="188" rx="22" fill="url(#grinderBody)" />
              <circle cx="230" cy="352" r="34" fill="#1c100a" stroke="#6b4a35" strokeWidth="3" />
              <g data-burr>
                {[0, 45, 90, 135].map((a) => (
                  <rect key={a} x="227" y="324" width="6" height="56" rx="3" fill="#c2ab95" transform={`rotate(${a} 230 352)`} />
                ))}
                <circle cx="230" cy="352" r="8" fill="#e2a866" />
              </g>
              <circle data-grinder-led cx="270" cy="300" r="5" fill="#c2ab95" />
              <text x="230" y="430" textAnchor="middle" fontFamily="var(--font-fraunces)" fontSize="16" fill="#e2a866" fontStyle="italic">mellow</text>
              <path d="M220 472 H240 L236 492 H224 Z" fill="#1c100a" />
              <rect x="150" y="572" width="160" height="30" rx="8" fill="#2a1a12" />
              <rect x="210" y="474" width="40" height="98" fill="#2a1a12" opacity="0.0" />
              <g data-grounds>
                {GROUNDS.map((g, i) => (
                  <circle key={i} cx={g.x} cy="494" r="2.6" fill="#5a3825" />
                ))}
              </g>
            </g>

            {/* ── ESPRESSO MACHINE ── */}
            <g>
              <rect x="480" y="208" width="340" height="16" rx="8" fill="url(#steel)" />
              {[530, 575].map((x) => (
                <g key={x}>
                  <rect x={x} y="186" width="34" height="24" rx="4" fill="#f7f0e6" stroke="#cbbaa4" />
                  <path d={`M${x + 34} 192 h6 a6 6 0 0 1 0 12 h-6`} fill="none" stroke="#cbbaa4" strokeWidth="3" />
                </g>
              ))}
              <rect x="470" y="222" width="360" height="380" rx="28" fill="url(#machineBody)" />
              <rect x="470" y="222" width="360" height="380" rx="28" fill="none" stroke="#bda98f" strokeWidth="2" />
              <circle data-boiler-glow cx="650" cy="300" r="120" fill="url(#glow)" opacity="0" />
              {/* gauge */}
              <circle cx="560" cy="300" r="34" fill="#fffaf3" stroke="url(#steel)" strokeWidth="6" />
              {[-70, -35, 0, 35, 70].map((a) => (
                <rect key={a} x="559" y="272" width="2" height="7" fill="#7a6656" transform={`rotate(${a} 560 300)`} />
              ))}
              <rect data-needle x="558.5" y="276" width="3" height="26" rx="1.5" fill="#c27a3e" />
              <circle cx="560" cy="300" r="4" fill="#2a1a12" />
              {/* logo plate */}
              <text x="700" y="312" textAnchor="middle" fontFamily="var(--font-fraunces)" fontSize="26" fill="#5a3825" fontStyle="italic">Mellow</text>
              <rect x="600" y="330" width="200" height="3" rx="1.5" fill="#cbbaa4" />
              {/* group head */}
              <rect x="612" y="350" width="76" height="20" rx="6" fill="url(#steel)" />
              <rect x="622" y="368" width="56" height="24" rx="4" fill="#5d6570" />
              <rect x="630" y="390" width="40" height="5" rx="2" fill="#3f4650" />
              {/* steam wand */}
              <path d="M790 360 v130 q0 16 -12 22" stroke="url(#steel)" strokeWidth="9" fill="none" strokeLinecap="round" />
              <circle cx="790" cy="356" r="10" fill="#5d6570" />
              {/* water shower */}
              <g data-water>
                {[636, 646, 656, 664].map((x) => (
                  <line key={x} x1={x} y1="396" x2={x} y2="420" stroke="#bfe0ff" strokeWidth="3" strokeLinecap="round" />
                ))}
              </g>
              {/* drip tray */}
              <rect x="560" y="572" width="200" height="22" rx="8" fill="url(#steel)" />
              {[580, 600, 620, 640, 660, 680, 700, 720, 740].map((x) => (
                <rect key={x} x={x} y="578" width="10" height="3" rx="1.5" fill="#5d6570" />
              ))}
            </g>

            {/* ── CUP ── */}
            <g>
              <path d="M612 504 H688 L682 558 Q650 580 618 558 Z" fill="#fffaf3" stroke="#e3d4bf" strokeWidth="2" />
              <g clipPath="url(#cupClip)">
                <rect data-cup-fill x="610" y="508" width="80" height="70" fill="url(#coffeeFill)" />
              </g>
              <ellipse data-crema cx="650" cy="510" rx="35" ry="4.5" fill="#c98a52" opacity="0" />
              <path d="M686 516 h8 a12 12 0 0 1 0 24 h-10" fill="none" stroke="#fffaf3" strokeWidth="7" />
              <path d="M686 516 h8 a12 12 0 0 1 0 24 h-10" fill="none" stroke="#e3d4bf" strokeWidth="1.5" />
              <g data-steam>
                {[634, 650, 666].map((x, i) => (
                  <path key={x} d={`M${x} 496 c -10 -14, 10 -26, 0 -42 c -8 -12, 8 -22, 0 -34`} stroke="#fffaf3" strokeWidth={i === 1 ? 5 : 4} fill="none" strokeLinecap="round" />
                ))}
              </g>
            </g>

            {/* ── STREAMS ── */}
            {[642, 658].map((x) => (
              <rect key={x} data-stream x={x - 2} y="440" width="4" height="72" rx="2" fill="#5a3014" />
            ))}

            {/* ── PORTAFILTER (moves grinder → machine) ── */}
            <g data-portafilter>
              <rect x="-132" y="-7" width="96" height="14" rx="7" fill="#3b2418" />
              <rect x="-42" y="-5" width="10" height="10" fill="url(#steel)" />
              <path d="M-38 -14 H38 L32 6 Q0 16 -32 6 Z" fill="url(#steel)" />
              <g clipPath="url(#basketClip)">
                <rect data-basket-fill x="-32" y="-11" width="64" height="12" fill="#6b4025" />
              </g>
              <rect x="-10" y="8" width="6" height="7" rx="2" fill="#5d6570" />
              <rect x="4" y="8" width="6" height="7" rx="2" fill="#5d6570" />
            </g>

            {/* ── BEANS ── */}
            {BEANS.map((_, i) => (
              <Bean key={i} i={i} />
            ))}
          </g>

          {/* ── FINAL CUP ── */}
          <g transform="translate(0 -70)"><g data-final>
            <ellipse cx="500" cy="520" rx="210" ry="34" fill="#000" opacity="0.15" />
            <ellipse cx="500" cy="500" rx="200" ry="40" fill="#fffaf3" stroke="#e3d4bf" strokeWidth="3" />
            <ellipse cx="500" cy="496" rx="150" ry="26" fill="#f1e8dc" />
            <path d="M360 330 H640 Q636 450 560 482 Q500 500 440 482 Q364 450 360 330 Z" fill="#fffaf3" stroke="#e3d4bf" strokeWidth="3" />
            <path d="M636 360 h22 a42 42 0 0 1 0 84 h-36" fill="none" stroke="#fffaf3" strokeWidth="18" />
            <path d="M636 360 h22 a42 42 0 0 1 0 84 h-36" fill="none" stroke="#e3d4bf" strokeWidth="3" />
            <ellipse cx="500" cy="332" rx="140" ry="26" fill="#6b3f22" />
            <ellipse cx="500" cy="332" rx="128" ry="21" fill="#a0632f" />
            <path d="M500 352 C 470 336, 452 316, 470 308 C 484 302, 496 312, 500 320 C 504 312, 516 302, 530 308 C 548 316, 530 336, 500 352 Z" fill="#fff3e2" opacity="0.95" />
            <g data-final-steam>
              {[450, 500, 550].map((x) => (
                <path key={x} d={`M${x} 300 c -18 -24, 18 -44, 0 -70 c -14 -20, 14 -38, 0 -58`} stroke="#fffaf3" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.85" />
              ))}
            </g>
          </g></g>
        </svg>

        {/* heading */}
        <div className="pointer-events-none absolute inset-x-0 top-0 pt-24 md:pt-28">
          <div className="container-x">
            <p className="eyebrow text-caramel">{brewing.eyebrow}</p>
            <h2 className={cn("display-md mt-3 max-w-[14ch] transition-opacity duration-500", done && "opacity-0")}>{brewing.heading}</h2>
          </div>
        </div>

        {/* final message */}
        <div className={cn("pointer-events-none absolute inset-x-0 bottom-[8%] text-center transition-all duration-700", done ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}>
          <p className="display-lg px-5 font-display italic text-espresso">{brewing.finalHeading}</p>
          {brewing.finalMessage && <p className="lead mx-auto mt-3 max-w-md px-5 text-muted">{brewing.finalMessage}</p>}
        </div>

        {/* step caption */}
        <div className={cn("absolute inset-x-3 bottom-4 transition-all duration-500 md:inset-x-auto md:bottom-10 md:left-10 md:w-[380px] lg:left-[max(3rem,calc((100vw-1320px)/2+3rem))]", done ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100")}>
          <div className="glass-warm rounded-3xl p-5 md:p-6">
            <div className="flex items-center justify-between">
              <span className="font-display text-4xl font-medium text-caramel md:text-5xl">
                {String(step + 1).padStart(2, "0")}
                <span className="text-lg text-muted">/{String(STEPS).padStart(2, "0")}</span>
              </span>
              <div className="flex gap-1.5" aria-hidden>
                {Array.from({ length: STEPS }).map((_, i) => (
                  <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === step ? "w-6 bg-caramel" : i < step ? "w-1.5 bg-coffee" : "w-1.5 bg-sand")} />
                ))}
              </div>
            </div>
            <p className="mt-3 font-display text-2xl font-medium" aria-live="polite">{s.title}</p>
            {s.description && <p className="mt-1.5 text-[0.97rem] text-muted">{s.description}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
