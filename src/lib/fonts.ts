import { Inter, Lora, Playfair_Display, Space_Grotesk } from "next/font/google";

// preload: false — next/font still self-hosts the @font-face CSS, but browsers
// only download a family when a page's computed styles actually reference it.

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const pageFontVariables = [
  inter.variable,
  spaceGrotesk.variable,
  playfair.variable,
  lora.variable,
].join(" ");
