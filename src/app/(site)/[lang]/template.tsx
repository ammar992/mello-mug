"use client";

import { motion, useReducedMotion } from "motion/react";

/** Soft cross-fade between pages (opacity only, so sticky/pinned sections keep working). */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
