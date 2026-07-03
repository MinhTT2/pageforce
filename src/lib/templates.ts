import type { BlockStyle, BlockType, PageBlock, PageSchema } from "@/types/blocks";
import { createBlock, defaultPageSettings, tokenPresets } from "@/lib/blocks";

export type PageTemplateKey = "blank" | "product-launch" | "event" | "sales-promo";

export type PageTemplate = {
  key: PageTemplateKey;
  name: string;
  description: string;
  build: () => PageSchema;
};

// Feature-item icons must exist in BlockRenderer's iconMap
// (BadgeCheck, Check, Globe, MessageCircle, Sparkles, Star, Zap) —
// unknown names silently fall back to Sparkles.

function buildBlock<T extends BlockType>(
  type: T,
  overrides: Partial<Extract<PageBlock, { type: T }>["props"]> = {},
  style?: BlockStyle,
): PageBlock {
  const block = createBlock(type) as Extract<PageBlock, { type: T }>;
  block.props = { ...block.props, ...overrides };
  if (style) {
    block.style = style;
  }
  return block;
}

function buildSchema(theme: keyof typeof tokenPresets, blocks: PageBlock[]): PageSchema {
  return {
    version: 2,
    blocks,
    settings: {
      ...defaultPageSettings,
      tokens: { ...tokenPresets[theme] },
    },
  };
}

function buildProductLaunch(): PageSchema {
  return buildSchema("bold", [
    buildBlock("hero", {
      heading: "Introducing Nova",
      subheading:
        "The fastest way to turn your idea into a product your customers can try today.",
      buttonText: "Get early access",
      buttonUrl: "#",
    }),
    buildBlock("features", {
      eyebrow: "Why Nova",
      heading: "Built for your first hundred customers",
      description: "Everything you need to launch with confidence, nothing you don't.",
      items: [
        {
          title: "Ready on day one",
          description: "Set up in minutes with sensible defaults instead of endless configuration.",
          icon: "Zap",
        },
        {
          title: "Grows with you",
          description: "Start small and scale without migrations or replatforming.",
          icon: "Star",
        },
        {
          title: "Secure by default",
          description: "Your data stays yours, encrypted in transit and at rest.",
          icon: "BadgeCheck",
        },
      ],
    }),
    buildBlock("testimonials", {
      heading: "Loved by early adopters",
      items: [
        {
          quote: "We replaced three tools with Nova in the first week.",
          author: "Sarah Kim",
          role: "Cofounder, Brightline",
        },
        {
          quote: "The launch went smoother than any release we have shipped before.",
          author: "Daniel Ortiz",
          role: "Product Lead, Fieldnote",
        },
      ],
    }),
    buildBlock("pricing", {
      heading: "Launch pricing",
      description: "Early-access pricing, locked in for your first year.",
    }),
    buildBlock("faq", {
      heading: "Frequently asked questions",
      items: [
        {
          question: "When does early access open?",
          answer:
            "We are onboarding new teams every week. Join the list and we will reach out with your invite.",
        },
        {
          question: "Can I import my existing data?",
          answer: "Yes. Nova imports from CSV and the most common tools out of the box.",
        },
        {
          question: "What happens after the trial?",
          answer: "Pick a plan or export your data anytime. No lock-in.",
        },
      ],
    }),
    buildBlock("cta", {
      headline: "Be first in line",
      supportingText: "Early access spots are limited — grab yours before the public launch.",
      primaryLabel: "Get early access",
      secondaryLabel: "See how it works",
    }),
    buildBlock("footer"),
  ]);
}

function buildEvent(): PageSchema {
  return buildSchema("clean", [
    buildBlock("hero", {
      heading: "Live webinar: Launch pages that convert",
      subheading:
        "Thursday, July 24 at 10:00 AM PT. Free, live, and recorded for everyone who registers.",
      buttonText: "Save my seat",
      buttonUrl: "#",
    }),
    buildBlock("text", {
      content:
        "In one hour, we will walk through a real landing page from blank canvas to published URL — covering structure, copy, and the small details that turn visitors into signups.",
      align: "center",
    }),
    buildBlock("image", { alt: "Webinar preview" }),
    buildBlock("features", {
      eyebrow: "What you'll learn",
      heading: "Three takeaways you can use the same day",
      description: "Practical, no fluff — bring your own page and follow along.",
      items: [
        {
          title: "Structure that sells",
          description: "The block order that consistently converts for launch pages.",
          icon: "Check",
        },
        {
          title: "Copy that clicks",
          description: "Headline and CTA formulas you can adapt in minutes.",
          icon: "Sparkles",
        },
        {
          title: "Live Q&A",
          description: "Bring your page and get direct feedback from the host.",
          icon: "MessageCircle",
        },
      ],
    }),
    buildBlock("leadForm", {
      headline: "Register for the webinar",
      description: "Drop your details and we will send the join link and the recording.",
      submitLabel: "Save my seat",
    }),
    buildBlock("faq", {
      heading: "Event details",
      items: [
        {
          question: "Will there be a recording?",
          answer: "Yes. Everyone who registers receives the recording within 24 hours.",
        },
        {
          question: "Is it really free?",
          answer: "Completely free. No card, no catch.",
        },
        {
          question: "How long is the session?",
          answer: "45 minutes of content plus 15 minutes of live Q&A.",
        },
      ],
    }),
    buildBlock("footer"),
  ]);
}

function buildSalesPromo(): PageSchema {
  return buildSchema("warm", [
    buildBlock("hero", {
      heading: "Summer sale — 30% off everything",
      subheading: "Our biggest discount of the year, for one week only.",
      buttonText: "Shop the sale",
      buttonUrl: "#",
    }),
    buildBlock("image", { alt: "Featured products" }),
    buildBlock("products", {
      eyebrow: "On sale",
      heading: "This week's deals",
      description: "Hand-picked offers with the limited-time discount already applied.",
      items: [
        {
          name: "Starter Launch Kit",
          description: "Everything a new campaign needs to go live with confidence.",
          price: "$13",
          originalPrice: "$19",
          image:
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Launch kit workspace",
          badge: "Sale",
          ctaLabel: "Buy now",
          ctaUrl: "#",
        },
        {
          name: "Growth Bundle",
          description: "More pages, lead-ready sections, and priority launch support.",
          price: "$34",
          originalPrice: "$49",
          image:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Team planning a campaign",
          badge: "-30%",
          ctaLabel: "Buy now",
          ctaUrl: "#",
        },
        {
          name: "Pro Campaign Pack",
          description: "A larger toolkit for teams pushing multiple offers at once.",
          price: "$69",
          originalPrice: "$99",
          image:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Modern office desk",
          badge: "Sale",
          ctaLabel: "Buy now",
          ctaUrl: "#",
        },
      ],
    }),
    buildBlock("features", {
      eyebrow: "Why buy now",
      heading: "Deals worth grabbing",
      description: "Every plan discounted, no code gymnastics required.",
      items: [
        {
          title: "30% off sitewide",
          description: "The discount applies automatically at checkout.",
          icon: "BadgeCheck",
        },
        {
          title: "Free upgrades",
          description: "Buy now and get the next tier free for three months.",
          icon: "Sparkles",
        },
        {
          title: "Risk free",
          description: "30-day money-back guarantee on every purchase.",
          icon: "Check",
        },
      ],
    }),
    buildBlock("pricing", {
      heading: "Sale pricing",
      description: "Prices shown include the limited-time discount.",
      plans: [
        {
          name: "Starter",
          price: "$13",
          billingText: "per month, was $19",
          features: ["One landing page", "Live public URL", "Core builder blocks"],
          ctaLabel: "Start now",
          ctaUrl: "#",
          highlighted: false,
        },
        {
          name: "Growth",
          price: "$34",
          billingText: "per month, was $49",
          features: ["Multiple pages", "Lead-ready sections", "Priority support"],
          ctaLabel: "Choose Growth",
          ctaUrl: "#",
          highlighted: true,
        },
      ],
    }),
    buildBlock("cta", {
      headline: "The sale ends Sunday",
      supportingText: "Lock in the discount before prices go back up.",
      primaryLabel: "Claim the offer",
      secondaryLabel: "Compare plans",
    }),
    buildBlock("leadForm", {
      headline: "Get the discount code by email",
      description:
        "Not ready to buy today? We will send the code so you can use it before the sale ends.",
      submitLabel: "Send me the code",
    }),
    buildBlock("footer"),
  ]);
}

export const pageTemplates: PageTemplate[] = [
  {
    key: "blank",
    name: "Blank",
    description: "Start from an empty canvas.",
    build: () => buildSchema("clean", []),
  },
  {
    key: "product-launch",
    name: "Product launch",
    description: "Announce a product with proof, pricing, and FAQs.",
    build: buildProductLaunch,
  },
  {
    key: "event",
    name: "Event",
    description: "Promote a webinar or event and collect registrations.",
    build: buildEvent,
  },
  {
    key: "sales-promo",
    name: "Sales & promo",
    description: "Push a limited-time offer with pricing and a discount form.",
    build: buildSalesPromo,
  },
];

export function getPageTemplate(key: unknown): PageTemplate | undefined {
  return pageTemplates.find((template) => template.key === key);
}

export function resolveTemplateSchema(key: unknown): PageSchema {
  const template = getPageTemplate(key) ?? pageTemplates[0];
  return template.build();
}
