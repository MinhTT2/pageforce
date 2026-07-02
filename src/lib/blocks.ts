import type { BlockType, PageBlock, PageSchema } from "@/types/blocks";

export const emptyPageSchema: PageSchema = {
  version: 1,
  blocks: [],
};

export const blockLabels: Record<BlockType, string> = {
  hero: "Hero",
  text: "Text",
  image: "Image",
  button: "Button",
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
  if (
    value &&
    typeof value === "object" &&
    "version" in value &&
    "blocks" in value &&
    Array.isArray((value as PageSchema).blocks)
  ) {
    return value as PageSchema;
  }

  return emptyPageSchema;
}
