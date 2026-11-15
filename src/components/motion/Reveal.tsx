"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { Children, isValidElement, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article";
};

/** Fades + lifts content into view once. Renders final state for reduced-motion users. */
export function Reveal({ children, delay = 0, y = 18, as = "div", ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const Cmp = motion[as] as typeof motion.div;
  return (
    <Cmp
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Cmp>
  );
}

/** Staggers its direct children into view. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
  itemClassName,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol";
}) {
  const reduce = useReducedMotion();
  const Cmp = motion[as] as typeof motion.div;
  const ChildCmp = as === "div" ? motion.div : (motion.li as unknown as typeof motion.div);
  return (
    <Cmp
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <ChildCmp
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
            }}
            className={itemClassName}
          >
            {child}
          </ChildCmp>
        ) : (
          child
        ),
      )}
    </Cmp>
  );
}
