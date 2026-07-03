export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "carousel"
  | "button"
  | "features"
  | "testimonials"
  | "pricing"
  | "products"
  | "faq"
  | "cta"
  | "leadForm"
  | "footer";

export type PageTheme = "clean" | "bold" | "warm";

export type FontKey =
  | "geist"
  | "inter"
  | "space-grotesk"
  | "playfair"
  | "lora"
  | "system"
  | "serif";

export type RadiusKey = "none" | "sm" | "md" | "lg" | "full";
export type SpacingKey = "compact" | "normal" | "relaxed";

export type DesignTokens = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: FontKey;
  bodyFont: FontKey;
  radius: RadiusKey;
  spacing: SpacingKey;
};

export type BlockAlign = "left" | "center" | "right";
export type BlockPaddingY = "none" | "sm" | "md" | "lg" | "xl";
export type BlockWidth = "narrow" | "normal" | "wide" | "full";

export type BlockStyle = {
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  align?: BlockAlign;
  paddingY?: BlockPaddingY;
  width?: BlockWidth;
};

export type PageSettings = {
  metaTitle: string;
  metaDescription: string;
  tokens: DesignTokens;
};

type BlockBase = {
  id: string;
  style?: BlockStyle;
};

export type HeroBlock = BlockBase & {
  type: "hero";
  props: {
    heading: string;
    subheading: string;
    buttonText: string;
    buttonUrl: string;
  };
};

export type TextBlock = BlockBase & {
  type: "text";
  props: {
    content: string;
    align: "left" | "center" | "right";
  };
};

export type ImageBlock = BlockBase & {
  type: "image";
  props: {
    src: string;
    alt: string;
  };
};

export type CarouselBlock = BlockBase & {
  type: "carousel";
  props: {
    heading: string;
    autoplay: boolean;
    items: Array<{
      src: string;
      alt: string;
      caption: string;
    }>;
  };
};

export type ButtonBlock = BlockBase & {
  type: "button";
  props: {
    label: string;
    url: string;
    variant: "primary" | "secondary";
  };
};

export type FeaturesBlock = BlockBase & {
  type: "features";
  props: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
};

export type TestimonialsBlock = BlockBase & {
  type: "testimonials";
  props: {
    heading: string;
    items: Array<{
      quote: string;
      author: string;
      role: string;
    }>;
  };
};

export type PricingBlock = BlockBase & {
  type: "pricing";
  props: {
    heading: string;
    description: string;
    plans: Array<{
      name: string;
      price: string;
      billingText: string;
      features: string[];
      ctaLabel: string;
      ctaUrl: string;
      highlighted: boolean;
    }>;
  };
};

export type ProductsBlock = BlockBase & {
  type: "products";
  props: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{
      name: string;
      description: string;
      price: string;
      originalPrice: string;
      image: string;
      imageAlt: string;
      badge: string;
      ctaLabel: string;
      ctaUrl: string;
    }>;
  };
};

export type FaqBlock = BlockBase & {
  type: "faq";
  props: {
    heading: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
};

export type CtaBlock = BlockBase & {
  type: "cta";
  props: {
    headline: string;
    supportingText: string;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
  };
};

export type LeadFormBlock = BlockBase & {
  type: "leadForm";
  props: {
    headline: string;
    description: string;
    submitLabel: string;
    deliveryMode: "capture" | "mailto" | "actionUrl";
    mailto: string;
    actionUrl: string;
  };
};

export type FooterBlock = BlockBase & {
  type: "footer";
  props: {
    brandText: string;
    copyright: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  };
};

export type PageBlock =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | CarouselBlock
  | ButtonBlock
  | FeaturesBlock
  | TestimonialsBlock
  | PricingBlock
  | ProductsBlock
  | FaqBlock
  | CtaBlock
  | LeadFormBlock
  | FooterBlock;

export type PageSchema = {
  version: 2;
  blocks: PageBlock[];
  settings?: PageSettings;
};
