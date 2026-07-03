import Image from "next/image";
import type { PageBlock, PageSchema } from "@/types/blocks";
import { cn } from "@/lib/utils";

type BlockRendererProps = {
  schema: PageSchema;
  editable?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
};

export function BlockRenderer({
  schema,
  editable = false,
  selectedBlockId,
  onSelectBlock,
}: BlockRendererProps) {
  if (schema.blocks.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
        Add a block to start composing this page.
      </div>
    );
  }

  return (
    <div className="bg-white">
      {schema.blocks.map((block) =>
        editable ? (
          <div
            key={block.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectBlock?.(block.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectBlock?.(block.id);
              }
            }}
            className={cn(
              "block w-full cursor-pointer text-left outline-offset-[-2px] hover:outline hover:outline-2 hover:outline-zinc-300 [&_a]:pointer-events-none",
              selectedBlockId === block.id && "outline outline-2 outline-zinc-950",
            )}
          >
            <RenderedBlock block={block} />
          </div>
        ) : (
          <RenderedBlock key={block.id} block={block} />
        ),
      )}
    </div>
  );
}

function RenderedBlock({ block }: { block: PageBlock }) {
  if (block.type === "hero") {
    return (
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-5xl">
          {block.props.heading}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
          {block.props.subheading}
        </p>
        {block.props.buttonText ? (
          <a
            href={block.props.buttonUrl || "#"}
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white"
          >
            {block.props.buttonText}
          </a>
        ) : null}
      </section>
    );
  }

  if (block.type === "text") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-12">
        <p
          className={cn(
            "text-lg leading-8 text-zinc-700",
            block.props.align === "center" && "text-center",
            block.props.align === "right" && "text-right",
          )}
        >
          {block.props.content}
        </p>
      </section>
    );
  }

  if (block.type === "image") {
    return (
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-zinc-100">
          {block.props.src ? (
            <Image src={block.props.src} alt={block.props.alt} fill className="object-cover" />
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-10 text-center">
      <a
        href={block.props.url || "#"}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-medium",
          block.props.variant === "primary"
            ? "bg-zinc-950 text-white"
            : "border border-zinc-200 bg-white text-zinc-950",
        )}
      >
        {block.props.label}
      </a>
    </section>
  );
}
