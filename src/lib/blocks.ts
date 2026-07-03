import type {
  BlockType,
  DesignTokens,
  PageBlock,
  PageSchema,
  PageSettings,
  PageTheme,
} from "@/types/blocks";
import { legacyPageSchemaV1Validator, pageSchemaValidator } from "@/lib/validators";

export const tokenPresets: Record<PageTheme, DesignTokens> = {
  clean: {
    primaryColor: "#18181b",
    backgroundColor: "#ffffff",
    textColor: "#09090b",
    headingFont: "geist",
    bodyFont: "geist",
    radius: "md",
    spacing: "normal",
  },
  bold: {
    primaryColor: "#2563eb",
    backgroundColor: "#09090b",
    textColor: "#ffffff",
    headingFont: "space-grotesk",
    bodyFont: "geist",
    radius: "md",
    spacing: "normal",
  },
  warm: {
    primaryColor: "#c2410c",
    backgroundColor: "#fffaf2",
    textColor: "#0c0a09",
    headingFont: "lora",
    bodyFont: "geist",
    radius: "lg",
    spacing: "relaxed",
  },
};

export const defaultTokens: DesignTokens = tokenPresets.clean;

export const defaultPageSettings: PageSettings = {
  metaTitle: "",
  metaDescription: "",
  tokens: defaultTokens,
};

export const emptyPageSchema: PageSchema = {
  version: 2,
  blocks: [],
  settings: defaultPageSettings,
};

export const blockLabels: Record<BlockType, string> = {
  hero: "Hero",
  text: "Text",
  image: "Image",
  button: "Button",
  features: "Features",
  testimonials: "Testimonials",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "CTA",
  leadForm: "Lead Form",
  footer: "Footer",
};

export function createBlock(type: BlockType): PageBlock {
  const id = crypto.randomUUID();

  if (type === "hero") {
    return {
      id,
      type,
      props: {
        heading: "Launch faster with Pageforce",
        subheading: "Create a clean landing page from simple blocks.",
        buttonText: "Get started",
        buttonUrl: "#",
      },
    };
  }

  if (type === "text") {
    return {
      id,
      type,
      props: {
        content: "Add a concise section that explains your offer.",
        align: "left",
      },
    };
  }

  if (type === "image") {
    return {
      id,
      type,
      props: {
        src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop",
        alt: "Workspace preview",
      },
    };
  }

  if (type === "features") {
    return {
      id,
      type,
      props: {
        eyebrow: "Why Pageforce",
        heading: "Everything your landing page needs",
        description: "Build a focused page that explains the offer, earns trust, and drives action.",
        items: [
          {
            title: "Fast setup",
            description: "Start from practical sections instead of a blank page.",
            icon: "Zap",
          },
          {
            title: "Clear messaging",
            description: "Shape benefits, proof, pricing, and FAQs in one flow.",
            icon: "MessageCircle",
          },
          {
            title: "Live public page",
            description: "Save once and your public URL updates immediately.",
            icon: "Globe",
          },
        ],
      },
    };
  }

  if (type === "testimonials") {
    return {
      id,
      type,
      props: {
        heading: "Trusted by teams launching faster",
        items: [
          {
            quote: "Pageforce helped us turn a product idea into a usable landing page in one afternoon.",
            author: "Linh Tran",
            role: "Founder, Northstar Labs",
          },
          {
            quote: "The builder keeps the page focused on the offer instead of design busywork.",
            author: "Minh Pham",
            role: "Growth Lead, Atlas Studio",
          },
        ],
      },
    };
  }

  if (type === "pricing") {
    return {
      id,
      type,
      props: {
        heading: "Simple pricing for focused launches",
        description: "Pick a plan that matches the stage of your campaign.",
        plans: [
          {
            name: "Starter",
            price: "$19",
            billingText: "per month",
            features: ["One landing page", "Live public URL", "Core builder blocks"],
            ctaLabel: "Start now",
            ctaUrl: "#",
            highlighted: false,
          },
          {
            name: "Growth",
            price: "$49",
            billingText: "per month",
            features: ["Multiple pages", "Lead-ready sections", "Priority support"],
            ctaLabel: "Choose Growth",
            ctaUrl: "#",
            highlighted: true,
          },
        ],
      },
    };
  }

  if (type === "faq") {
    return {
      id,
      type,
      props: {
        heading: "Questions before you start",
        items: [
          {
            question: "Can I edit the page after publishing?",
            answer: "Yes. Saving in the builder updates the public page immediately.",
          },
          {
            question: "Do I need a developer to launch?",
            answer: "No. The builder stores your page as structured blocks and renders it for you.",
          },
          {
            question: "Can I link buttons to external tools?",
            answer: "Yes. CTAs and forms can point to your checkout, calendar, or contact workflow.",
          },
        ],
      },
    };
  }

  if (type === "cta") {
    return {
      id,
      type,
      props: {
        headline: "Ready to launch your next page?",
        supportingText: "Turn the core of your offer into a clean public landing page today.",
        primaryLabel: "Get started",
        primaryUrl: "#",
        secondaryLabel: "View example",
        secondaryUrl: "#",
      },
    };
  }

  if (type === "leadForm") {
    return {
      id,
      type,
      props: {
        headline: "Talk to us",
        description: "Share a few details and we will follow up with next steps.",
        submitLabel: "Send message",
        deliveryMode: "capture",
        mailto: "hello@example.com",
        actionUrl: "",
      },
    };
  }

  if (type === "footer") {
    return {
      id,
      type,
      props: {
        brandText: "Pageforce",
        copyright: "(c) 2026 Pageforce. All rights reserved.",
        links: [
          { label: "Contact", url: "mailto:hello@example.com" },
          { label: "Privacy", url: "#" },
        ],
      },
    };
  }

  return {
    id,
    type,
    props: {
      label: "Open link",
      url: "#",
      variant: "primary",
    },
  };
}

export function normalizePageSchema(value: unknown): PageSchema {
  const v2 = pageSchemaValidator.safeParse(value);

  if (v2.success) {
    return {
      ...v2.data,
      settings: {
        ...defaultPageSettings,
        ...v2.data.settings,
        tokens: { ...defaultTokens, ...v2.data.settings?.tokens },
      },
    };
  }

  const v1 = legacyPageSchemaV1Validator.safeParse(value);

  if (v1.success) {
    return {
      version: 2,
      blocks: v1.data.blocks,
      settings: {
        metaTitle: v1.data.settings?.metaTitle ?? "",
        metaDescription: v1.data.settings?.metaDescription ?? "",
        tokens: tokenPresets[v1.data.settings?.theme ?? "clean"],
      },
    };
  }

  return emptyPageSchema;
}
