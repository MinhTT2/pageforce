import Image from "next/image";
import {
  BadgeDollarSign,
  CircleHelp,
  GalleryHorizontal,
  Image as ImageIcon,
  ListChecks,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PanelBottom,
  Send,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PageBlock, PageSchema } from "@/types/blocks";
import { cn } from "@/lib/utils";

type PageSchemaThumbnailProps = {
  schema: PageSchema;
  className?: string;
  frameClassName?: string;
};

// Grayscale on purpose - the thumbnail mimics a user page rendered with its own
// pf tokens; do not swap these zinc/white values to app brand tokens.
export function PageSchemaThumbnail({
  schema,
  className,
  frameClassName,
}: PageSchemaThumbnailProps) {
  const previewBlocks = schema.blocks.slice(0, 4);

  return (
    <div
      className={cn(
        "pointer-events-none aspect-[16/10] overflow-hidden border-b border-border bg-canvas p-3",
        className,
      )}
    >
      {previewBlocks.length ? (
        <div
          className={cn(
            "pointer-events-none h-full overflow-hidden rounded-md border border-border bg-white shadow-xs",
            frameClassName,
          )}
        >
          {previewBlocks.map((block) => (
            <PreviewBlock key={block.id} block={block} />
          ))}
        </div>
      ) : (
        <div className="grid h-full place-items-center rounded-md border border-dashed border-border bg-[linear-gradient(135deg,var(--muted)_0,var(--background)_100%)] px-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ImageIcon className="size-5" />
            </div>
            <div className="mx-auto mt-4 h-2 w-20 rounded-full bg-muted-foreground/20" />
            <div className="mx-auto mt-3 h-2 w-32 rounded-full bg-muted-foreground/30" />
            <p className="mt-5 text-xs font-medium text-muted-foreground">Blank page</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewBlock({ block }: { block: PageBlock }) {
  if (block.type === "hero") {
    return (
      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f4f4f5_100%)] px-5 py-6 text-center">
        <h4 className="mx-auto line-clamp-2 max-w-60 text-base font-semibold leading-tight text-zinc-950">
          {block.props.heading}
        </h4>
        {block.props.subheading ? (
          <p className="mx-auto mt-2 line-clamp-2 max-w-64 text-[11px] leading-4 text-zinc-500">
            {block.props.subheading}
          </p>
        ) : null}
        {block.props.buttonText ? (
          <div className="mx-auto mt-3 h-5 w-20 rounded-md bg-zinc-950" />
        ) : null}
      </section>
    );
  }

  if (block.type === "text") {
    return (
      <section className="px-5 py-4">
        <p
          className={cn(
            "line-clamp-3 text-[11px] leading-4 text-zinc-600",
            block.props.align === "center" && "text-center",
            block.props.align === "right" && "text-right",
            block.props.align === "left" && "text-left",
          )}
        >
          {block.props.content}
        </p>
      </section>
    );
  }

  if (block.type === "image") {
    return (
      <section className="px-5 py-3">
        <div className="relative aspect-[16/7] overflow-hidden rounded-md bg-zinc-100">
          {block.props.src ? (
            <Image
              src={block.props.src}
              alt={block.props.alt || ""}
              fill
              sizes="360px"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center bg-zinc-100 text-zinc-400">
              <ImageIcon className="size-4" />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (block.type === "carousel") {
    return (
      <MiniPreview
        icon={GalleryHorizontal}
        title={block.props.heading || "Image carousel"}
        detail={`${block.props.items.length} slides`}
      />
    );
  }

  if (block.type === "button") {
    return (
      <section className="px-5 py-3 text-center">
        <MousePointerClick className="mx-auto mb-2 size-3 text-zinc-400" />
        <div
          className={cn(
            "mx-auto h-6 w-24 rounded-md",
            block.props.variant === "primary" ? "bg-zinc-950" : "border border-zinc-200 bg-white",
          )}
        />
      </section>
    );
  }

  if (block.type === "features") {
    return (
      <MiniPreview
        icon={ListChecks}
        title={block.props.heading}
        detail={`${block.props.items.length} features`}
      />
    );
  }

  if (block.type === "testimonials") {
    return (
      <MiniPreview
        icon={MessageSquareQuote}
        title={block.props.heading}
        detail={`${block.props.items.length} testimonials`}
      />
    );
  }

  if (block.type === "pricing") {
    return (
      <MiniPreview
        icon={BadgeDollarSign}
        title={block.props.heading}
        detail={`${block.props.plans.length} plans`}
      />
    );
  }

  if (block.type === "products") {
    return (
      <MiniPreview
        icon={ShoppingBag}
        title={block.props.heading}
        detail={`${block.props.items.length} products`}
      />
    );
  }

  if (block.type === "faq") {
    return (
      <MiniPreview
        icon={CircleHelp}
        title={block.props.heading}
        detail={`${block.props.items.length} questions`}
      />
    );
  }

  if (block.type === "cta") {
    return (
      <MiniPreview icon={Megaphone} title={block.props.headline} detail={block.props.primaryLabel} />
    );
  }

  if (block.type === "leadForm") {
    return <MiniPreview icon={Send} title={block.props.headline} detail={block.props.submitLabel} />;
  }

  return (
    <MiniPreview
      icon={PanelBottom}
      title={block.props.brandText}
      detail={`${block.props.links.length} links`}
    />
  );
}

function MiniPreview({
  icon: PreviewIcon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <section className="px-5 py-3 text-center">
      <PreviewIcon className="mx-auto size-4 text-zinc-400" />
      <h4 className="mx-auto mt-2 line-clamp-1 max-w-56 text-[11px] font-semibold text-zinc-700">
        {title}
      </h4>
      <p className="mt-1 text-[10px] text-zinc-400">{detail}</p>
    </section>
  );
}
