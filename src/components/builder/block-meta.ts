import {
  BadgeDollarSign,
  CircleHelp,
  Image as ImageIcon,
  LayoutTemplate,
  ListChecks,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PanelBottom,
  Send,
  Type,
  type LucideIcon,
} from "lucide-react";
import type { BlockType } from "@/types/blocks";

export const blockGroups: Array<{
  label: string;
  blocks: BlockType[];
}> = [
  { label: "Structure", blocks: ["hero", "text", "image", "features"] },
  { label: "Conversion", blocks: ["cta", "button", "leadForm", "pricing"] },
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
