import { Fraunces, Lora, Manrope } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Cyrillic companion for the display face (Fraunces has no Cyrillic). Only downloaded when Cyrillic text appears. */
export const lora = Lora({ subsets: ["cyrillic"], variable: "--font-lora", style: ["normal", "italic"], display: "swap" });

export const manrope = Manrope({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-manrope", display: "swap" });

export const fontVars = `${fraunces.variable} ${lora.variable} ${manrope.variable}`;
