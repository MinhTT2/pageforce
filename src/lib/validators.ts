import { z } from "zod";

const heroBlockSchema = z.object({
  id: z.string(),
  type: z.literal("hero"),
  props: z.object({
    heading: z.string(),
    subheading: z.string(),
    buttonText: z.string(),
    buttonUrl: z.string(),
  }),
});

const textBlockSchema = z.object({
  id: z.string(),
  type: z.literal("text"),
  props: z.object({
    content: z.string(),
    align: z.enum(["left", "center", "right"]),
  }),
});

const imageBlockSchema = z.object({
  id: z.string(),
  type: z.literal("image"),
  props: z.object({
    src: z.string(),
    alt: z.string(),
  }),
});

const buttonBlockSchema = z.object({
  id: z.string(),
  type: z.literal("button"),
  props: z.object({
    label: z.string(),
    url: z.string(),
    variant: z.enum(["primary", "secondary"]),
  }),
});

export const pageSchemaValidator = z.object({
  version: z.literal(1),
  blocks: z.array(
    z.discriminatedUnion("type", [
      heroBlockSchema,
      textBlockSchema,
      imageBlockSchema,
      buttonBlockSchema,
    ]),
  ),
});

export const pagePatchValidator = z.object({
  title: z.string().min(1).max(120).optional(),
  slug: z.string().min(1).max(80).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  schema: pageSchemaValidator.optional(),
});
