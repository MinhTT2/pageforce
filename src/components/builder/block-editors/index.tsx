import type { PageBlock } from "@/types/blocks";
import { ButtonEditor } from "./ButtonEditor";
import { CtaEditor } from "./CtaEditor";
import { FaqEditor } from "./FaqEditor";
import { FeaturesEditor } from "./FeaturesEditor";
import { FooterEditor } from "./FooterEditor";
import { HeroEditor } from "./HeroEditor";
import { ImageEditor } from "./ImageEditor";
import { LeadFormEditor } from "./LeadFormEditor";
import { PricingEditor } from "./PricingEditor";
import { TestimonialsEditor } from "./TestimonialsEditor";
import { TextEditor } from "./TextEditor";

export function BlockEditor({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (block: PageBlock) => void;
}) {
  if (block.type === "hero") return <HeroEditor block={block} onChange={onChange} />;
  if (block.type === "text") return <TextEditor block={block} onChange={onChange} />;
  if (block.type === "image") return <ImageEditor block={block} onChange={onChange} />;
  if (block.type === "button") return <ButtonEditor block={block} onChange={onChange} />;
  if (block.type === "features") return <FeaturesEditor block={block} onChange={onChange} />;
  if (block.type === "testimonials") {
    return <TestimonialsEditor block={block} onChange={onChange} />;
  }
  if (block.type === "pricing") return <PricingEditor block={block} onChange={onChange} />;
  if (block.type === "faq") return <FaqEditor block={block} onChange={onChange} />;
  if (block.type === "cta") return <CtaEditor block={block} onChange={onChange} />;
  if (block.type === "leadForm") return <LeadFormEditor block={block} onChange={onChange} />;

  return <FooterEditor block={block} onChange={onChange} />;
}
