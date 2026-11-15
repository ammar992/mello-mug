"use client";

import { motion, useReducedMotion } from "motion/react";
import { createElement, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** class applied to every line after the first (e.g. muted colour) */
  secondaryLineClassName?: string;
  delay?: number;
  /** animate on mount instead of when scrolled into view */
  immediate?: boolean;
  /** highlight the last word of the first line with the accent colour + a drawn underline */
  accent?: boolean;
};

/**
 * Word-by-word masked reveal. Lines are split on "\n".
 * Screen readers get the plain text via aria-label.
 */
export function SplitHeading({ text, as = "h2", className, secondaryLineClassName, delay = 0, immediate, accent }: Props) {
  const reduce = useReducedMotion();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let wordIndex = 0;
  const trigger = immediate
    ? { animate: { y: 0 } }
    : { whileInView: { y: 0 }, viewport: { once: true, margin: "0px 0px -8% 0px" } };

  const children: ReactNode = lines.map((line, li) => (
    <span key={li} className={`block ${li > 0 ? (secondaryLineClassName ?? "") : ""}`}>
      {line.split(/\s+/).map((word, wi, arr) => {
        const i = wordIndex++;
        const isAccent = Boolean(accent) && li === 0 && wi === arr.length - 1;
        return (
          <span key={wi} className={`relative inline-block align-bottom ${isAccent ? "text-orange" : ""}`}>
            <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
              <motion.span
                className="inline-block will-change-transform"
                initial={reduce ? false : { y: "105%" }}
                {...trigger}
                transition={{ duration: 0.9, ease: EASE, delay: delay + i * 0.045 }}
              >
                {word}
              </motion.span>
            </span>
            {isAccent && (
              <svg
                aria-hidden
                viewBox="0 0 300 24"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -bottom-[0.1em] left-0 h-[0.2em] w-[96%] overflow-visible"
              >
                <path
                  d="M4 16 C 70 5, 150 3, 296 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  pathLength={1}
                  style={
                    reduce
                      ? undefined
                      : {
                          strokeDasharray: 1,
                          strokeDashoffset: 1,
                          animation: `draw-line 0.9s cubic-bezier(0.65,0,0.35,1) ${delay + 0.9}s forwards`,
                        }
                  }
                />
              </svg>
            )}
            {" "}
          </span>
        );
      })}
    </span>
  ));

  return createElement(as, { className, "aria-label": lines.join(" ") }, <span aria-hidden>{children}</span>);
}
