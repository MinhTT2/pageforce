import type { BlockStyle, BlockType, PageBlock, PageSchema } from "@/types/blocks";
import { createBlock, defaultPageSettings, tokenPresets } from "@/lib/blocks";

export type PageTemplateKey =
  | "blank"
  | "product-launch"
  | "event"
  | "sales-promo"
  | "saas-growth"
  | "agency-service"
  | "commerce-collection";

export type PageTemplate = {
  key: PageTemplateKey;
  name: string;
  description: string;
  build: () => PageSchema;
};

export type SiteTemplateKey =
  | "blank-site"
  | "saas-site"
  | "agency-site"
  | "commerce-site"
  | "event-site"
  | "launch-site";

export type SiteTemplatePage = {
  title: string;
  schema: () => PageSchema;
};

export type SiteTemplate = {
  key: SiteTemplateKey;
  name: string;
  description: string;
  brandText: string;
  pages: SiteTemplatePage[];
};

export type SiteNavigationPage = {
  title: string;
  slug: string;
  isHome: boolean;
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

export function buildSiteHeaderSchema({
  brandText,
  pages,
  urlForPage,
}: {
  brandText: string;
  pages: SiteNavigationPage[];
  siteSlug?: string;
  urlForPage?: (page: SiteNavigationPage, index: number) => string;
}): PageSchema {
  const links = pages.slice(0, 6).map((page, index) => ({
    label: page.isHome ? "Home" : page.title,
    url: urlForPage?.(page, index) ?? (page.isHome ? "/" : `/${page.slug}`),
  }));

  return buildSchema("clean", [
    buildBlock("header", {
      brandText,
      links,
      ctaLabel: links.length > 1 ? "Contact" : "",
      ctaUrl: links.find((link) => link.label.toLowerCase() === "contact")?.url ?? "#",
      sticky: true,
    }),
  ]);
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

function buildSaasGrowth(): PageSchema {
  return buildSchema("bold", [
    buildBlock("hero", {
      heading: "Turn product signals into revenue",
      subheading:
        "MetricFlow helps growing SaaS teams spot expansion opportunities, prioritize accounts, and launch smarter lifecycle campaigns.",
      buttonText: "Book a demo",
      buttonUrl: "#",
    }),
    buildBlock("carousel", {
      heading: "A command center for every revenue motion",
      autoplay: true,
      items: [
        {
          src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
          alt: "Analytics dashboard on a laptop",
          caption: "Track activation, retention, and expansion signals in one place.",
        },
        {
          src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1600&auto=format&fit=crop",
          alt: "Team reviewing growth metrics",
          caption: "Give sales, success, and marketing the same customer context.",
        },
        {
          src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1600&auto=format&fit=crop",
          alt: "Growth team planning a launch",
          caption: "Launch campaigns from real usage and account health data.",
        },
      ],
    }),
    buildBlock("features", {
      eyebrow: "Growth stack",
      heading: "Built for teams past the first launch",
      description: "Move from scattered reports to a practical growth operating system.",
      items: [
        {
          title: "Account scoring",
          description: "Prioritize expansion and save-risk accounts with clear health signals.",
          icon: "Star",
        },
        {
          title: "Lifecycle plays",
          description: "Trigger onboarding, adoption, and renewal campaigns from product behavior.",
          icon: "Zap",
        },
        {
          title: "Shared dashboards",
          description: "Give every go-to-market team a clean view of what is changing.",
          icon: "Globe",
        },
      ],
    }),
    buildBlock("testimonials", {
      heading: "Revenue teams grow faster with MetricFlow",
      items: [
        {
          quote: "We found our highest-intent expansion accounts in the first afternoon.",
          author: "Maya Chen",
          role: "VP Growth, Orbitlane",
        },
        {
          quote: "MetricFlow made customer signals usable for the whole team, not just analysts.",
          author: "Alex Morgan",
          role: "Head of Revenue, Northstar AI",
        },
      ],
    }),
    buildBlock("pricing", {
      heading: "Plans for every growth stage",
      description: "Start with the essentials, then add more seats and automations as your team grows.",
      plans: [
        {
          name: "Growth",
          price: "$79",
          billingText: "per month",
          features: ["5 seats", "Account scoring", "Core lifecycle dashboards"],
          ctaLabel: "Start Growth",
          ctaUrl: "#",
          highlighted: false,
        },
        {
          name: "Scale",
          price: "$149",
          billingText: "per month",
          features: ["Unlimited seats", "Advanced plays", "Priority onboarding"],
          ctaLabel: "Book a demo",
          ctaUrl: "#",
          highlighted: true,
        },
      ],
    }),
    buildBlock("faq", {
      heading: "Questions from growth teams",
      items: [
        {
          question: "How fast can we launch?",
          answer: "Most teams connect their core data and publish their first dashboard in a day.",
        },
        {
          question: "Do we need an analyst?",
          answer: "No. MetricFlow ships with ready-made account health and lifecycle views.",
        },
        {
          question: "Can we invite sales and success?",
          answer: "Yes. Shared dashboards are designed for cross-functional teams.",
        },
      ],
    }),
    buildBlock("cta", {
      headline: "Ready to turn signals into pipeline?",
      supportingText: "See how MetricFlow can uncover your next expansion motion.",
      primaryLabel: "Book a demo",
      secondaryLabel: "View sample dashboard",
    }),
    buildBlock("footer", {
      brandText: "MetricFlow",
    }),
  ]);
}

function buildAgencyService(): PageSchema {
  return buildSchema("clean", [
    buildBlock("hero", {
      heading: "Brand systems for ambitious service teams",
      subheading:
        "Northline Studio turns positioning, websites, and launch campaigns into a clear growth engine for modern B2B companies.",
      buttonText: "Plan a project",
      buttonUrl: "#",
    }),
    buildBlock("text", {
      content:
        "Your brand should make the sales conversation easier. We shape the story, design the page, and build the campaign assets your team needs to move faster.",
      align: "center",
    }),
    buildBlock("image", {
      src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1600&auto=format&fit=crop",
      alt: "Creative team working together",
    }),
    buildBlock("features", {
      eyebrow: "Services",
      heading: "A focused team for your next launch",
      description: "Strategy, design, and conversion assets without agency sprawl.",
      items: [
        {
          title: "Positioning sprint",
          description: "Clarify your audience, offer, messaging, and proof in one guided sprint.",
          icon: "MessageCircle",
        },
        {
          title: "Landing page system",
          description: "A polished page structure your team can reuse across campaigns.",
          icon: "Sparkles",
        },
        {
          title: "Launch support",
          description: "Campaign copy, creative direction, and optimization after launch.",
          icon: "BadgeCheck",
        },
      ],
    }),
    buildBlock("testimonials", {
      heading: "Trusted by teams with a launch date",
      items: [
        {
          quote: "Northline gave us the sharpest version of our story and a page we were proud to send.",
          author: "Priya Shah",
          role: "Founder, Forma Cloud",
        },
        {
          quote: "The process was calm, clear, and faster than any agency engagement we have run.",
          author: "Evan Brooks",
          role: "COO, Tempo Supply",
        },
      ],
    }),
    buildBlock("leadForm", {
      headline: "Tell us about the project",
      description: "Share the launch window, goals, and current site. We will reply with the best next step.",
      submitLabel: "Request a consult",
    }),
    buildBlock("faq", {
      heading: "How projects work",
      items: [
        {
          question: "What size team do you work with?",
          answer: "Most clients are founder-led or growth-led B2B teams preparing for a launch or repositioning.",
        },
        {
          question: "How long does a project take?",
          answer: "Focused landing page and messaging projects usually run two to four weeks.",
        },
        {
          question: "Can you work with our existing brand?",
          answer: "Yes. We can sharpen an existing system or create a lightweight campaign direction.",
        },
      ],
    }),
    buildBlock("footer", {
      brandText: "Northline Studio",
    }),
  ]);
}

function buildCommerceCollection(): PageSchema {
  return buildSchema("warm", [
    buildBlock("hero", {
      heading: "The edit your workspace has been waiting for",
      subheading:
        "Warm desk essentials, clever storage, and tactile tools for a calmer, better-looking workday.",
      buttonText: "Shop the collection",
      buttonUrl: "#",
    }),
    buildBlock("products", {
      eyebrow: "New collection",
      heading: "Designed for focused days",
      description: "A curated set of office pieces that feel warm, useful, and giftable.",
      items: [
        {
          name: "Walnut Desk Shelf",
          description: "A clean riser for monitors, notebooks, and daily tools.",
          price: "$84",
          originalPrice: "",
          image:
            "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Wooden desk shelf on a tidy workspace",
          badge: "New",
          ctaLabel: "Shop now",
          ctaUrl: "#",
        },
        {
          name: "Task Lamp",
          description: "A soft, adjustable light built for late notes and early starts.",
          price: "$62",
          originalPrice: "$78",
          image:
            "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Modern desk lamp",
          badge: "Save 20%",
          ctaLabel: "Shop now",
          ctaUrl: "#",
        },
        {
          name: "Cable Tray",
          description: "Hide the clutter and keep everyday charging within reach.",
          price: "$28",
          originalPrice: "",
          image:
            "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop",
          imageAlt: "Organized workspace with laptop",
          badge: "",
          ctaLabel: "Shop now",
          ctaUrl: "#",
        },
      ],
    }),
    buildBlock("features", {
      eyebrow: "Why customers love it",
      heading: "Good-looking gear that earns its desk space",
      description: "Every piece balances utility, texture, and a calmer visual rhythm.",
      items: [
        {
          title: "Natural materials",
          description: "Warm wood, matte finishes, and neutral details that pair well.",
          icon: "Sparkles",
        },
        {
          title: "Small-space friendly",
          description: "Designed to make compact desks feel organized instead of crowded.",
          icon: "Check",
        },
        {
          title: "Fast shipping",
          description: "Orders leave our studio within two business days.",
          icon: "BadgeCheck",
        },
      ],
    }),
    buildBlock("testimonials", {
      heading: "From desks that finally feel finished",
      items: [
        {
          quote: "My workspace looks calmer and I can actually find what I need.",
          author: "Nora Ellis",
          role: "Designer",
        },
        {
          quote: "The shelf and lamp instantly made my home office feel intentional.",
          author: "Jon Bell",
          role: "Product Manager",
        },
      ],
    }),
    buildBlock("cta", {
      headline: "Build a desk you want to sit down to",
      supportingText: "Bundle two or more collection pieces and get free shipping this week.",
      primaryLabel: "Shop the edit",
      secondaryLabel: "See best sellers",
    }),
    buildBlock("leadForm", {
      headline: "Get the workspace guide",
      description: "A short checklist for styling a calmer desk with fewer pieces.",
      submitLabel: "Send the guide",
    }),
    buildBlock("footer", {
      brandText: "Hearth Desk Co.",
    }),
  ]);
}

function buildSaasProductPage(): PageSchema {
  return buildSchema("bold", [
    buildBlock("hero", {
      heading: "A clearer workflow for every growth team",
      subheading:
        "See how MetricFlow turns scattered usage signals into account priorities, lifecycle campaigns, and shared revenue visibility.",
      buttonText: "Book a demo",
      buttonUrl: "#",
    }),
    buildBlock("features", {
      eyebrow: "Platform",
      heading: "Everything in one operating view",
      description: "Connect the signals that usually live across analytics, CRM, and support tools.",
      items: [
        {
          title: "Unified customer health",
          description: "Spot expansion and save-risk accounts before pipeline slips.",
          icon: "Star",
        },
        {
          title: "Campaign triggers",
          description: "Launch onboarding, adoption, and renewal plays from live behavior.",
          icon: "Zap",
        },
        {
          title: "Team dashboards",
          description: "Give sales, success, and marketing one shared source of truth.",
          icon: "Globe",
        },
      ],
    }),
    buildBlock("cta", {
      headline: "Tour the platform",
      supportingText: "Walk through the dashboard with a product specialist.",
      primaryLabel: "Schedule demo",
      secondaryLabel: "See pricing",
    }),
    buildBlock("footer", {
      brandText: "MetricFlow",
    }),
  ]);
}

function buildContactPage(theme: keyof typeof tokenPresets, brandText: string): PageSchema {
  return buildSchema(theme, [
    buildBlock("hero", {
      heading: "Let's talk",
      subheading: "Tell us what you are building and we will point you to the best next step.",
      buttonText: "Send a note",
      buttonUrl: "#contact",
    }),
    buildBlock("leadForm", {
      headline: "Start the conversation",
      description: "Share your goals, timeline, and anything useful about the project.",
      submitLabel: "Send request",
    }),
    buildBlock("faq", {
      heading: "Before you reach out",
      items: [
        {
          question: "How quickly will you reply?",
          answer: "Most requests receive a thoughtful reply within one business day.",
        },
        {
          question: "Can we start with a small scope?",
          answer: "Yes. A focused first page or consultation is often the fastest way to begin.",
        },
      ],
    }),
    buildBlock("footer", {
      brandText,
    }),
  ]);
}

function buildAgencyWorkPage(): PageSchema {
  return buildSchema("clean", [
    buildBlock("hero", {
      heading: "Selected launch systems",
      subheading:
        "A look at the positioning, page structures, and campaign assets we create for focused B2B teams.",
      buttonText: "Plan a project",
      buttonUrl: "#",
    }),
    buildBlock("features", {
      eyebrow: "Case studies",
      heading: "Work that clarifies the sale",
      description: "Each engagement turns a fuzzy offer into a page and message system that can ship.",
      items: [
        {
          title: "Forma Cloud",
          description: "Repositioned a technical platform for executive buyers before launch.",
          icon: "Sparkles",
        },
        {
          title: "Tempo Supply",
          description: "Built a campaign page system for a new operations product line.",
          icon: "BadgeCheck",
        },
        {
          title: "Lumen Works",
          description: "Turned founder-led sales notes into reusable service pages.",
          icon: "MessageCircle",
        },
      ],
    }),
    buildBlock("testimonials", {
      heading: "Clients come back when the stakes are high",
      items: [
        {
          quote: "The page gave our team language we could use across sales and marketing.",
          author: "Iris Cole",
          role: "CEO, Lumen Works",
        },
      ],
    }),
    buildBlock("footer", {
      brandText: "Northline Studio",
    }),
  ]);
}

function buildCommerceAboutPage(): PageSchema {
  return buildSchema("warm", [
    buildBlock("hero", {
      heading: "Objects for calmer workdays",
      subheading:
        "Hearth Desk Co. makes warm, useful office pieces for people who care how their space feels.",
      buttonText: "Shop the collection",
      buttonUrl: "#",
    }),
    buildBlock("text", {
      content:
        "We design small-batch desk essentials with natural materials, simple forms, and details that make everyday work feel more intentional.",
      align: "center",
    }),
    buildBlock("image", {
      src: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=1600&auto=format&fit=crop",
      alt: "A warm organized desk",
    }),
    buildBlock("footer", {
      brandText: "Hearth Desk Co.",
    }),
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
  {
    key: "saas-growth",
    name: "SaaS growth",
    description: "Sell a SaaS platform with proof, pricing, and a strong demo CTA.",
    build: buildSaasGrowth,
  },
  {
    key: "agency-service",
    name: "Agency service",
    description: "Present a premium service offer and collect qualified project leads.",
    build: buildAgencyService,
  },
  {
    key: "commerce-collection",
    name: "Commerce collection",
    description: "Showcase products with warm visuals, proof, and a shopping CTA.",
    build: buildCommerceCollection,
  },
];

export const siteTemplates: SiteTemplate[] = [
  {
    key: "blank-site",
    name: "Blank website",
    description: "Start with one empty home page.",
    brandText: "My Site",
    pages: [{ title: "Home", schema: () => buildSchema("clean", []) }],
  },
  {
    key: "saas-site",
    name: "SaaS website",
    description: "Home, product, pricing, and contact pages for a software business.",
    brandText: "MetricFlow",
    pages: [
      { title: "Home", schema: buildSaasGrowth },
      { title: "Product", schema: buildSaasProductPage },
      { title: "Pricing", schema: buildProductLaunch },
      { title: "Contact", schema: () => buildContactPage("bold", "MetricFlow") },
    ],
  },
  {
    key: "agency-site",
    name: "Agency website",
    description: "Home, work, services, and contact pages for a service business.",
    brandText: "Northline Studio",
    pages: [
      { title: "Home", schema: buildAgencyService },
      { title: "Work", schema: buildAgencyWorkPage },
      { title: "Services", schema: buildProductLaunch },
      { title: "Contact", schema: () => buildContactPage("clean", "Northline Studio") },
    ],
  },
  {
    key: "commerce-site",
    name: "Commerce website",
    description: "Home, collection, about, and contact pages for a product brand.",
    brandText: "Hearth Desk Co.",
    pages: [
      { title: "Home", schema: buildCommerceCollection },
      { title: "Collection", schema: buildSalesPromo },
      { title: "About", schema: buildCommerceAboutPage },
      { title: "Contact", schema: () => buildContactPage("warm", "Hearth Desk Co.") },
    ],
  },
  {
    key: "event-site",
    name: "Event website",
    description: "Home, agenda, speakers, and registration pages for an event.",
    brandText: "Launch Live",
    pages: [
      { title: "Home", schema: buildEvent },
      { title: "Agenda", schema: buildProductLaunch },
      { title: "Speakers", schema: buildAgencyWorkPage },
      { title: "Register", schema: buildEvent },
    ],
  },
  {
    key: "launch-site",
    name: "Launch website",
    description: "Home, features, pricing, and signup pages for a new offer.",
    brandText: "Nova",
    pages: [
      { title: "Home", schema: buildProductLaunch },
      { title: "Features", schema: buildSaasProductPage },
      { title: "Pricing", schema: buildSaasGrowth },
      { title: "Signup", schema: buildEvent },
    ],
  },
];

export function getPageTemplate(key: unknown): PageTemplate | undefined {
  return pageTemplates.find((template) => template.key === key);
}

export function resolveTemplateSchema(key: unknown): PageSchema {
  const template = getPageTemplate(key) ?? pageTemplates[0];
  return template.build();
}

export function getSiteTemplate(key: unknown): SiteTemplate | undefined {
  return siteTemplates.find((template) => template.key === key);
}

export function resolveSiteTemplate(key: unknown): SiteTemplate {
  return getSiteTemplate(key) ?? siteTemplates[0];
}
