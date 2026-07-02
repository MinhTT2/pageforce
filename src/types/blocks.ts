export type BlockType = "hero" | "text" | "image" | "button";

export type HeroBlock = {
  id: string;
  type: "hero";
  props: {
    heading: string;
    subheading: string;
    buttonText: string;
    buttonUrl: string;
  };
};

export type TextBlock = {
  id: string;
  type: "text";
  props: {
    content: string;
    align: "left" | "center" | "right";
  };
};

export type ImageBlock = {
  id: string;
  type: "image";
  props: {
    src: string;
    alt: string;
  };
};

export type ButtonBlock = {
  id: string;
  type: "button";
  props: {
    label: string;
    url: string;
    variant: "primary" | "secondary";
  };
};

export type PageBlock = HeroBlock | TextBlock | ImageBlock | ButtonBlock;

export type PageSchema = {
  version: 1;
  blocks: PageBlock[];
};
