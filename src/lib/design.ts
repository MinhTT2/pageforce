import type { CSSProperties } from "react";
import type {
  BlockPaddingY,
  BlockWidth,
  DesignTokens,
  FontKey,
  RadiusKey,
  SpacingKey,
} from "@/types/blocks";

export const FONT_OPTIONS: Record<FontKey, { label: string; stack: string }> = {
  geist: { label: "Geist", stack: "var(--font-geist-sans), system-ui, sans-serif" },
  inter: { label: "Inter", stack: "var(--font-inter), system-ui, sans-serif" },
  "space-grotesk": {
    label: "Space Grotesk",
    stack: "var(--font-space-grotesk), system-ui, sans-serif",
  },
  playfair: { label: "Playfair Display", stack: "var(--font-playfair), Georgia, serif" },
  lora: { label: "Lora", stack: "var(--font-lora), Georgia, serif" },
  system: { label: "System Sans", stack: "system-ui, -apple-system, sans-serif" },
  serif: { label: "System Serif", stack: "Georgia, 'Times New Roman', serif" },
};

const RADIUS_SCALE: Record<RadiusKey, string> = {
  none: "0px",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "1rem",
  full: "1.75rem",
};

const SECTION_Y_SCALE: Record<SpacingKey, string> = {
  compact: "3rem",
  normal: "4.5rem",
  relaxed: "6rem",
};

export const BLOCK_PADDING_Y: Record<BlockPaddingY, string> = {
  none: "py-0",
  sm: "py-8",
  md: "py-12 sm:py-14",
  lg: "py-16 sm:py-20",
  xl: "py-24 sm:py-28",
};

export const BLOCK_WIDTH: Record<BlockWidth, string> = {
  narrow: "max-w-3xl",
  normal: "max-w-5xl",
  wide: "max-w-6xl",
  full: "max-w-none",
};

function contrastForeground(hex: string): string {
  const value = hex.replace("#", "");
  const expanded =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const red = parseInt(expanded.slice(0, 2), 16) / 255;
  const green = parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = parseInt(expanded.slice(4, 6), 16) / 255;
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);

  return luminance > 0.45 ? "#09090b" : "#ffffff";
}

export function tokenCssVars(tokens: DesignTokens): CSSProperties {
  return {
    "--pf-primary": tokens.primaryColor,
    "--pf-primary-fg": contrastForeground(tokens.primaryColor),
    "--pf-bg": tokens.backgroundColor,
    "--pf-text": tokens.textColor,
    "--pf-font-heading": FONT_OPTIONS[tokens.headingFont].stack,
    "--pf-font-body": FONT_OPTIONS[tokens.bodyFont].stack,
    "--pf-radius": RADIUS_SCALE[tokens.radius],
    "--pf-section-y": SECTION_Y_SCALE[tokens.spacing],
  } as CSSProperties;
}

export function blockStyleCssVars(style: {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
}): CSSProperties {
  return {
    ...(style.backgroundColor
      ? { backgroundColor: style.backgroundColor, "--pf-bg": style.backgroundColor }
      : {}),
    ...(style.textColor ? { color: style.textColor, "--pf-text": style.textColor } : {}),
    ...(style.accentColor
      ? {
          "--pf-primary": style.accentColor,
          "--pf-primary-fg": contrastForeground(style.accentColor),
        }
      : {}),
  } as CSSProperties;
}
