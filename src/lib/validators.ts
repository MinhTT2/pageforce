import { z } from "zod";

// Hex-only guard: these values are rendered into style attributes, so anything
// looser would open a CSS injection hole.
const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

const fontKeySchema = z.enum([
  "geist",
  "inter",
  "space-grotesk",
  "playfair",
  "lora",
  "system",
  "serif",
]);

const designTokensSchema = z
  .object({
    primaryColor: hexColor,
    backgroundColor: hexColor,
    textColor: hexColor,
    headingFont: fontKeySchema,
    bodyFont: fontKeySchema,
    radius: z.enum(["none", "sm", "md", "lg", "full"]),
    spacing: z.enum(["compact", "normal", "relaxed"]),
  })
  .partial();

const blockStyleSchema = z
  .object({
    backgroundColor: hexColor.optional(),
    textColor: hexColor.optional(),
    accentColor: hexColor.optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    paddingY: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
    width: z.enum(["narrow", "normal", "wide", "full"]).optional(),
  })
  .optional();

const blockBase = {
  id: z.string(),
  style: blockStyleSchema,
};

const pageSettingsSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  tokens: designTokensSchema.optional(),
});

const heroBlockSchema = z.object({
  ...blockBase,
  type: z.literal("hero"),
  props: z.object({
    heading: z.string(),
    subheading: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string(),
  }),
});

const textBlockSchema = z.object({
  ...blockBase,
  type: z.literal("text"),
  props: z.object({
    content: z.string(),
    align: z.enum(["left", "center", "right"]),
  }),
});

const imageBlockSchema = z.object({
  ...blockBase,
  type: z.literal("image"),
  props: z.object({
    src: z.string(),
    alt: z.string(),
  }),
});

const buttonBlockSchema = z.object({
  ...blockBase,
  type: z.literal("button"),
  props: z.object({
    label: z.string(),
    url: z.string(),
    variant: z.enum(["primary", "secondary"]),
  }),
});

const featuresBlockSchema = z.object({
  ...blockBase,
  type: z.literal("features"),
  props: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    description: z.string(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z.string(),
        }),
      )
      .min(1),
  }),
});

const testimonialsBlockSchema = z.object({
  ...blockBase,
  type: z.literal("testimonials"),
  props: z.object({
    heading: z.string(),
    items: z
      .array(
        z.object({
          quote: z.string(),
          author: z.string(),
          role: z.string(),
        }),
      )
      .min(1),
  }),
});

const pricingBlockSchema = z.object({
  ...blockBase,
  type: z.literal("pricing"),
  props: z.object({
    heading: z.string(),
    description: z.string(),
    plans: z
      .array(
        z.object({
          name: z.string(),
          price: z.string(),
          billingText: z.string(),
          features: z.array(z.string()).min(1),
          ctaLabel: z.string(),
          ctaUrl: z.string(),
          highlighted: z.boolean(),
        }),
      )
      .min(1),
  }),
});

const faqBlockSchema = z.object({
  ...blockBase,
  type: z.literal("faq"),
  props: z.object({
    heading: z.string(),
    items: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .min(1),
  }),
});

const ctaBlockSchema = z.object({
  ...blockBase,
  type: z.literal("cta"),
  props: z.object({
    headline: z.string(),
    supportingText: z.string(),
    primaryLabel: z.string(),
    primaryUrl: z.string(),
    secondaryLabel: z.string(),
    secondaryUrl: z.string(),
  }),
});

const leadFormBlockSchema = z.object({
  ...blockBase,
  type: z.literal("leadForm"),
  props: z.object({
    headline: z.string(),
    description: z.string(),
    submitLabel: z.string(),
    deliveryMode: z.enum(["capture", "mailto", "actionUrl"]),
    mailto: z.string(),
    actionUrl: z.string(),
  }),
});

const footerBlockSchema = z.object({
  ...blockBase,
  type: z.literal("footer"),
  props: z.object({
    brandText: z.string(),
    copyright: z.string(),
    links: z.array(
      z.object({
        label: z.string(),
        url: z.string(),
      }),
    ),
  }),
});

const blocksSchema = z.array(
  z.discriminatedUnion("type", [
    heroBlockSchema,
    textBlockSchema,
    imageBlockSchema,
    buttonBlockSchema,
    featuresBlockSchema,
    testimonialsBlockSchema,
    pricingBlockSchema,
    faqBlockSchema,
    ctaBlockSchema,
    leadFormBlockSchema,
    footerBlockSchema,
  ]),
);

export const pageSchemaValidator = z.object({
  version: z.literal(2),
  settings: pageSettingsSchema.optional(),
  blocks: blocksSchema,
});

// Legacy v1 schemas (theme-based settings, no per-block style). v1 blocks are a
// structural subset of v2 blocks, so the same union validates them.
export const legacyPageSchemaV1Validator = z.object({
  version: z.literal(1),
  settings: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      theme: z.enum(["clean", "bold", "warm"]).optional(),
    })
    .optional(),
  blocks: blocksSchema,
});

export const pagePatchValidator = z
  .object({
    title: z.string().min(1).max(120).optional(),
    slug: z.string().min(1).max(80).optional(),
    schema: pageSchemaValidator.optional(),
  })
  .strict();

// Public endpoint payload: strict objects double as an abuse limit — no
// arbitrary keys or oversized values can reach the stored Json. `website` is a
// honeypot: it validates as any short string so bots get a normal-looking
// success response, but the API silently drops non-empty submissions.
export const leadSubmissionValidator = z
  .object({
    blockId: z.string().min(1).max(80),
    website: z.string().max(200).optional(),
    data: z
      .object({
        name: z.string().trim().max(200).optional().default(""),
        email: z.string().trim().max(320).optional().default(""),
        message: z.string().trim().max(5000).optional().default(""),
      })
      .strict(),
  })
  .strict()
  .refine((value) => value.data.name || value.data.email || value.data.message, {
    message: "Empty submission",
    path: ["data"],
  });
