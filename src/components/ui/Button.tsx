import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "caramel" | "light" | "outline" | "outline-light";

const variants: Record<Variant, string> = {
  dark: "bg-espresso text-foam hover:bg-mocha",
  caramel: "bg-caramel text-foam hover:bg-caramel-600 shadow-[0_14px_30px_-14px_rgb(194_122_62/0.9)]",
  light: "bg-foam text-espresso hover:bg-white",
  outline: "border border-espresso/20 text-espresso hover:border-espresso/60 hover:bg-espresso/[0.03]",
  "outline-light": "border border-foam/30 text-foam hover:border-foam/70 hover:bg-white/5",
};

export function buttonClass(variant: Variant = "dark", size: "md" | "lg" = "md", className?: string) {
  return cn(
    "group relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-full font-semibold transition-[background-color,border-color,transform,box-shadow] duration-300 active:scale-[0.97]",
    size === "lg" ? "h-14 px-7 text-[1rem]" : "h-11 px-5 text-[0.94rem]",
    variants[variant],
    className,
  );
}

function Arrow() {
  return (
    <span className="relative inline-flex size-[1.05em] overflow-hidden" aria-hidden>
      <ArrowUpRight className="absolute inset-0 size-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full group-hover:translate-x-full" />
      <ArrowUpRight className="absolute inset-0 size-full -translate-x-full translate-y-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0" />
    </span>
  );
}

export function ButtonLink({
  href,
  variant = "dark",
  size = "md",
  arrow = true,
  icon,
  className,
  children,
  ...rest
}: { href: string; variant?: Variant; size?: "md" | "lg"; arrow?: boolean; icon?: ReactNode; className?: string; children: ReactNode } & Omit<ComponentProps<"a">, "href" | "className" | "children">) {
  const cls = buttonClass(variant, size, className);
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && !icon && <Arrow />}
    </>
  );
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={cls} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...rest}>
      {content}
    </a>
  );
}
