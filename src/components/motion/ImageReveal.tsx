"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** subtle vertical parallax while scrolling */
  parallax?: boolean;
  from?: "bottom" | "left" | "right";
};

/** Clip-path reveal with a slow settle-in scale. */
export function ImageReveal({ src, alt, className, sizes = "(min-width: 1024px) 50vw, 100vw", priority, parallax, from = "bottom" }: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const hidden = {
    bottom: "inset(100% 0% 0% 0%)",
    left: "inset(0% 100% 0% 0%)",
    right: "inset(0% 0% 0% 100%)",
  }[from];

  if (!src) return null;

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden bg-mist", className)}
      initial={reduce ? false : { clipPath: hidden }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: [0.77, 0, 0.18, 1] }}
    >
      <motion.div
        className="absolute inset-[-7%_0]"
        style={parallax && !reduce ? { y } : undefined}
        initial={reduce ? false : { scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </motion.div>
    </motion.div>
  );
}
