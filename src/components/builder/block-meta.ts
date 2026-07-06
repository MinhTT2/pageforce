import {
  BadgeDollarSign,
  CircleHelp,
  GalleryHorizontal,
  PanelTop,
  Image as ImageIcon,
  LayoutTemplate,
  ListChecks,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PanelBottom,
  Send,
  ShoppingBag,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { BlockType } from "@/types/blocks";

export const blockGroups: Array<{
  label: string;
  blocks: BlockType[];
}> = [
  { label: "Structure", blocks: ["header", "hero", "text", "image", "carousel", "features"] },
  { label: "Conversion", blocks: ["cta", "button", "leadForm", "pricing", "products"] },
  { label: "Trust", blocks: ["testimonials", "faq"] },
  { label: "Utility", blocks: ["footer"] },
];

export const blockOptions: Record<
  BlockType,
  {
    icon: LucideIcon;
    description: string;
  }
> = {
  header: {
    icon: PanelTop,
    description: "Brand navigation with links and a CTA.",
  },
  hero: {
    icon: LayoutTemplate,
    description: "Top section with headline and CTA.",
  },
  text: {
    icon: Type,
    description: "Focused copy for the page body.",
  },
  image: {
    icon: ImageIcon,
    description: "Visual section using an image URL.",
  },
  carousel: {
    icon: GalleryHorizontal,
    description: "Image slider with captions and controls.",
  },
  button: {
    icon: MousePointerClick,
    description: "Standalone call-to-action link.",
  },
  features: {
    icon: ListChecks,
    description: "Benefits or capabilities in a scannable grid.",
  },
  testimonials: {
    icon: MessageSquareQuote,
    description: "Customer proof with quotes and attribution.",
  },
  pricing: {
    icon: BadgeDollarSign,
    description: "Plans, prices, feature lists, and CTAs.",
  },
  products: {
    icon: ShoppingBag,
    description: "Product grid with prices, badges, and buy links.",
  },
  faq: {
    icon: CircleHelp,
    description: "Common questions with expandable answers.",
  },
  cta: {
    icon: Megaphone,
    description: "Focused conversion section with two actions.",
  },
  leadForm: {
    icon: Send,
    description: "Name, email, and message form via mailto or external action.",
  },
  footer: {
    icon: PanelBottom,
    description: "Brand footer with links and copyright.",
  },
};
