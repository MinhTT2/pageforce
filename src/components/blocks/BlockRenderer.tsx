import Image from "next/image";
import {
  BadgeCheck,
  Check,
  CircleHelp,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  MousePointerClick,
  Quote,
  Send,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Fragment, memo, type CSSProperties, type ReactNode } from "react";
import type { BlockAlign, BlockWidth, PageBlock, PageSchema } from "@/types/blocks";
import { defaultTokens } from "@/lib/blocks";
import { CarouselViewer } from "@/components/blocks/CarouselViewer";
import { LeadCaptureForm } from "@/components/blocks/LeadCaptureForm";
import { BLOCK_PADDING_Y, BLOCK_WIDTH, blockStyleCssVars, tokenCssVars } from "@/lib/design";
import { cn } from "@/lib/utils";

type BlockRendererProps = {
  schema: PageSchema;
  renderBlockWrapper?: (block: PageBlock, children: ReactNode) => ReactNode;
  emptyActions?: ReactNode;
  renderMode?: "live" | "editor";
  // Only public site routes pass this; its presence is what lets lead forms submit
  // for real instead of rendering the builder's inert preview form.
  pageId?: string;
};

const iconMap: Record<string, LucideIcon> = {
  BadgeCheck,
  Check,
  Globe,
  MessageCircle,
  Sparkles,
  Star,
  Zap,
};

const alignClasses: Record<BlockAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

type SectionDefaults = {
  paddingY: string;
  width: BlockWidth;
  align?: BlockAlign;
};

function resolveSection(block: PageBlock, defaults: SectionDefaults) {
  const style = block.style;

  return {
    paddingClass: style?.paddingY ? BLOCK_PADDING_Y[style.paddingY] : defaults.paddingY,
    widthClass: BLOCK_WIDTH[style?.width ?? defaults.width],
    align: style?.align ?? defaults.align,
    sectionStyle: blockStyleCssVars(style ?? {}) as CSSProperties,
  };
}

// memo keeps builder keystrokes from re-rendering the whole preview; it is a
// no-op when this renders on the server for public site routes.
export const BlockRenderer = memo(function BlockRenderer({
  schema,
  renderBlockWrapper,
  emptyActions,
  renderMode = "live",
  pageId,
}: BlockRendererProps) {
  const tokens = schema.settings?.tokens ?? defaultTokens;

  if (schema.blocks.length === 0) {
    return (
      <div className="grid min-h-80 place-items-center border border-dashed border-border bg-[linear-gradient(135deg,var(--surface)_0%,var(--background)_100%)] px-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Sparkles className="size-5" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Start with a block</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add practical sections to compose a complete website page.
          </p>
          {emptyActions ? <div className="mt-5 flex flex-wrap justify-center gap-2">{emptyActions}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="pf-root transition-colors" style={tokenCssVars(tokens)}>
      {schema.blocks.map((block) => {
        const rendered = <RenderedBlock block={block} renderMode={renderMode} pageId={pageId} />;

        return (
          <Fragment key={block.id}>
            {renderBlockWrapper ? renderBlockWrapper(block, rendered) : rendered}
          </Fragment>
        );
      })}
    </div>
  );
});

// Blocks keep their object identity in the reducer unless edited, and page
// tokens reach blocks via --pf-* CSS variables on the pf-root wrapper.
// `pageId` is constant per render context, so `block` remains the only prop
// that can invalidate the memo.
const RenderedBlock = memo(function RenderedBlock({
  block,
  renderMode,
  pageId,
}: {
  block: PageBlock;
  renderMode: "live" | "editor";
  pageId?: string;
}) {
  if (block.type === "header") {
    const { sectionStyle } = resolveSection(block, {
      paddingY: "py-0",
      width: "wide",
    });

    return (
      <header
        className={cn(
          "pf-border border-b bg-(--pf-bg)/95 px-6 backdrop-blur",
          renderMode === "live" && block.props.sticky && "sticky top-0 z-30",
        )}
        style={sectionStyle}
      >
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 py-3">
          <a href="#" className="pf-heading text-base font-semibold">
            {block.props.brandText}
          </a>
          <nav className="pf-muted flex flex-wrap items-center justify-end gap-4 text-sm" aria-label="Site navigation">
            {block.props.links.map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                href={link.url || "#"}
                className="transition hover:text-(--pf-text)"
              >
                {link.label}
              </a>
            ))}
            {block.props.ctaLabel ? (
              <CtaLink href={block.props.ctaUrl} variant="primary">
                {block.props.ctaLabel}
              </CtaLink>
            ) : null}
          </nav>
        </div>
      </header>
    );
  }

  if (block.type === "hero") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-[calc(var(--pf-section-y)*1.2)]",
      width: "normal",
      align: "center",
    });

    return (
      <section
        className={cn(
          "px-6",
          paddingClass,
          alignClasses[align ?? "center"],
          !block.style?.backgroundColor && "pf-hero-gradient",
        )}
        style={sectionStyle}
      >
        <div className={cn("mx-auto", widthClass)}>
          <h1 className="pf-heading mx-auto max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
            {block.props.heading}
          </h1>
          <p className="pf-muted mx-auto mt-5 max-w-2xl text-lg leading-8">
            {block.props.subheading}
          </p>
          {block.props.buttonText ? (
            <CtaLink href={block.props.buttonUrl} variant="primary" className="mt-8">
              {block.props.buttonText}
            </CtaLink>
          ) : null}
        </div>
      </section>
    );
  }

  if (block.type === "text") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-[calc(var(--pf-section-y)*0.6)]",
      width: "narrow",
    });

    return (
      <section className={cn("px-6", paddingClass)} style={sectionStyle}>
        <p
          className={cn(
            "pf-muted mx-auto text-lg leading-8 sm:text-xl sm:leading-9",
            widthClass,
            alignClasses[align ?? block.props.align],
          )}
        >
          {block.props.content}
        </p>
      </section>
    );
  }

  if (block.type === "image") {
    const { paddingClass, widthClass, sectionStyle } = resolveSection(block, {
      paddingY: "py-[calc(var(--pf-section-y)*0.6)]",
      width: "normal",
    });

    return (
      <section className={cn("px-6", paddingClass)} style={sectionStyle}>
        <div
          className={cn(
            "pf-border pf-soft relative mx-auto aspect-[16/9] overflow-hidden rounded-(--pf-radius) border shadow-sm",
            widthClass,
          )}
        >
          {block.props.src ? (
            <Image
              src={block.props.src}
              alt={block.props.alt}
              fill
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="pf-muted grid h-full place-items-center text-center">
              <div>
                <ImageIcon className="mx-auto size-8" />
                <p className="mt-3 text-sm font-medium">Add an image URL</p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (block.type === "carousel") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "normal",
      align: "center",
    });

    return (
      <section
        className={cn("px-6", paddingClass, alignClasses[align ?? "center"])}
        style={sectionStyle}
      >
        <div className={cn("mx-auto", widthClass)}>
          {block.props.heading ? (
            <h2 className="pf-heading mx-auto mb-8 max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
              {block.props.heading}
            </h2>
          ) : null}
          <CarouselViewer items={block.props.items} autoplay={block.props.autoplay} />
        </div>
      </section>
    );
  }

  if (block.type === "button") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-[calc(var(--pf-section-y)*0.5)]",
      width: "narrow",
      align: "center",
    });

    return (
      <section
        className={cn("px-6", paddingClass, alignClasses[align ?? "center"])}
        style={sectionStyle}
      >
        <div className={cn("mx-auto", widthClass)}>
          <CtaLink href={block.props.url} variant={block.props.variant}>
            {block.props.label}
          </CtaLink>
        </div>
      </section>
    );
  }

  if (block.type === "features") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "wide",
      align: "center",
    });

    return (
      <section className={cn("px-6", paddingClass)} style={sectionStyle}>
        <div className={cn("mx-auto", widthClass)}>
          <SectionHeader
            eyebrow={block.props.eyebrow}
            heading={block.props.heading}
            description={block.props.description}
            align={align ?? "center"}
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.props.items.map((item, index) => {
              const Icon = iconMap[item.icon] ?? Sparkles;
              return (
                <article
                  key={`${item.title}-${index}`}
                  className="pf-border pf-soft rounded-(--pf-radius) border p-5"
                >
                  <div className="pf-btn-primary flex size-10 items-center justify-center rounded-(--pf-radius)">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="pf-heading mt-5 text-base font-semibold">{item.title}</h3>
                  <p className="pf-muted mt-2 text-sm leading-6">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "testimonials") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "wide",
      align: "left",
    });

    return (
      <section className={cn("pf-soft px-6", paddingClass)} style={sectionStyle}>
        <div className={cn("mx-auto", widthClass)}>
          <h2
            className={cn(
              "pf-heading max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl",
              alignClasses[align ?? "left"],
              align === "center" && "mx-auto",
              align === "right" && "ml-auto",
            )}
          >
            {block.props.heading}
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {block.props.items.map((item, index) => (
              <figure
                key={`${item.author}-${index}`}
                className="pf-border rounded-(--pf-radius) border bg-(--pf-bg) p-6"
              >
                <Quote className="pf-accent size-6" />
                <blockquote className="mt-4 text-lg leading-8">{item.quote}</blockquote>
                <figcaption className="pf-muted mt-5 text-sm">
                  <span className="font-semibold text-inherit">{item.author}</span>
                  {item.role ? `, ${item.role}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "pricing") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "wide",
      align: "center",
    });

    return (
      <section className={cn("px-6", paddingClass)} style={sectionStyle}>
        <div className={cn("mx-auto", widthClass)}>
          <SectionHeader
            heading={block.props.heading}
            description={block.props.description}
            align={align ?? "center"}
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {block.props.plans.map((plan, index) => (
              <article
                key={`${plan.name}-${index}`}
                className={cn(
                  "rounded-(--pf-radius) border p-6",
                  plan.highlighted
                    ? "pf-panel-primary border-transparent shadow-xl"
                    : "pf-border bg-(--pf-bg)",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="pf-heading text-lg font-semibold">{plan.name}</h3>
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-4xl font-semibold">{plan.price}</span>
                      <span className="pf-muted pb-1 text-sm">{plan.billingText}</span>
                    </div>
                  </div>
                  {plan.highlighted ? (
                    <span className="pf-btn-inverse rounded-full px-3 py-1 text-xs font-medium">
                      Popular
                    </span>
                  ) : null}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={`${feature}-${featureIndex}`} className="flex gap-3 text-sm leading-6">
                      <Check className="pf-accent mt-0.5 size-4 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <CtaLink href={plan.ctaUrl} variant={plan.highlighted ? "inverse" : "primary"}>
                    {plan.ctaLabel}
                  </CtaLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "products") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "wide",
      align: "center",
    });

    return (
      <section className={cn("px-6", paddingClass)} style={sectionStyle}>
        <div className={cn("mx-auto", widthClass)}>
          <SectionHeader
            eyebrow={block.props.eyebrow}
            heading={block.props.heading}
            description={block.props.description}
            align={align ?? "center"}
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {block.props.items.map((item, index) => (
              <article
                key={`${item.name}-${index}`}
                className="pf-border pf-soft flex flex-col overflow-hidden rounded-(--pf-radius) border text-left"
              >
                <div className="relative aspect-[4/3] bg-(--pf-bg)">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 360px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="pf-muted grid h-full place-items-center text-center">
                      <div>
                        <ImageIcon className="mx-auto size-7" />
                        <p className="mt-2 text-xs font-medium">Add an image URL</p>
                      </div>
                    </div>
                  )}
                  {item.badge ? (
                    <span className="pf-btn-primary absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="pf-heading text-lg font-semibold">{item.name}</h3>
                  <p className="pf-muted mt-2 flex-1 text-sm leading-6">{item.description}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold">{item.price}</span>
                    {item.originalPrice ? (
                      <span className="pf-muted text-sm line-through">{item.originalPrice}</span>
                    ) : null}
                  </div>
                  {item.ctaLabel ? (
                    <div className="mt-5">
                      <CtaLink href={item.ctaUrl} variant="primary">
                        {item.ctaLabel}
                      </CtaLink>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "faq") {
    const { paddingClass, widthClass, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "wide",
    });

    return (
      <section className={cn("pf-soft px-6", paddingClass)} style={sectionStyle}>
        <div className={cn("mx-auto grid gap-8 lg:grid-cols-[0.8fr_1.2fr]", widthClass)}>
          <div>
            <CircleHelp className="pf-accent size-8" />
            <h2 className="pf-heading mt-4 text-3xl font-semibold tracking-normal sm:text-4xl">
              {block.props.heading}
            </h2>
          </div>
          <div className="space-y-3">
            {block.props.items.map((item, index) => (
              <details
                key={`${item.question}-${index}`}
                className="pf-border group rounded-(--pf-radius) border bg-(--pf-bg) p-5"
              >
                <summary className="cursor-pointer list-none text-base font-semibold">
                  {item.question}
                </summary>
                <p className="pf-muted mt-3 text-sm leading-6">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "cta") {
    const { paddingClass, widthClass, align, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "normal",
      align: "center",
    });

    return (
      <section className={cn("px-6", paddingClass)} style={sectionStyle}>
        <div
          className={cn(
            "pf-panel-primary mx-auto rounded-(--pf-radius) px-6 py-12 sm:px-10",
            widthClass,
            alignClasses[align ?? "center"],
          )}
        >
          <h2 className="pf-heading mx-auto max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
            {block.props.headline}
          </h2>
          <p className="pf-muted mx-auto mt-4 max-w-2xl text-base leading-7">
            {block.props.supportingText}
          </p>
          <div
            className={cn(
              "mt-8 flex flex-wrap gap-3",
              (align ?? "center") === "center" && "justify-center",
              align === "right" && "justify-end",
            )}
          >
            {block.props.primaryLabel ? (
              <CtaLink href={block.props.primaryUrl} variant="inverse">
                {block.props.primaryLabel}
              </CtaLink>
            ) : null}
            {block.props.secondaryLabel ? (
              <a
                href={block.props.secondaryUrl || "#"}
                className="pf-btn-secondary inline-flex h-11 items-center justify-center rounded-(--pf-radius) px-5 text-sm font-medium transition hover:opacity-90"
              >
                {block.props.secondaryLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (block.type === "leadForm") {
    const { paddingClass, widthClass, sectionStyle } = resolveSection(block, {
      paddingY: "py-(--pf-section-y)",
      width: "wide",
    });

    return (
      <section className={cn("pf-soft px-6", paddingClass)} style={sectionStyle}>
        <div
          className={cn(
            "pf-border mx-auto grid gap-8 rounded-(--pf-radius) border bg-(--pf-bg) p-6 shadow-sm md:grid-cols-[0.9fr_1.1fr] md:p-8",
            widthClass,
          )}
        >
          <div>
            <Send className="pf-accent size-8" />
            <h2 className="pf-heading mt-4 text-3xl font-semibold tracking-normal">
              {block.props.headline}
            </h2>
            <p className="pf-muted mt-4 text-base leading-7">{block.props.description}</p>
          </div>
          <LeadCaptureForm blockId={block.id} props={block.props} pageId={pageId} />
        </div>
      </section>
    );
  }

  const footerSection = resolveSection(block, {
    paddingY: "py-8",
    width: "wide",
  });

  return (
    <footer
      className={cn("pf-border border-t px-6", footerSection.paddingClass)}
      style={footerSection.sectionStyle}
    >
      <div
        className={cn(
          "mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
          footerSection.widthClass,
        )}
      >
        <div>
          <p className="pf-heading font-semibold">{block.props.brandText}</p>
          <p className="pf-muted mt-1 text-sm">{block.props.copyright}</p>
        </div>
        <nav className="pf-muted flex flex-wrap gap-4 text-sm" aria-label="Footer navigation">
          {block.props.links.map((link, index) => (
            <a
              key={`${link.label}-${index}`}
              href={link.url || "#"}
              className="transition hover:text-(--pf-text)"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
});

function SectionHeader({
  eyebrow,
  heading,
  description,
  align,
}: {
  eyebrow?: string;
  heading: string;
  description: string;
  align: BlockAlign;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        alignClasses[align],
        align === "center" && "mx-auto",
        align === "right" && "ml-auto",
      )}
    >
      {eyebrow ? (
        <p className="pf-accent text-sm font-semibold uppercase tracking-normal">{eyebrow}</p>
      ) : null}
      <h2 className="pf-heading mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
        {heading}
      </h2>
      <p className="pf-muted mt-4 text-base leading-7">{description}</p>
    </div>
  );
}

function CtaLink({
  href,
  variant,
  className,
  children,
}: {
  href: string;
  variant: "primary" | "secondary" | "inverse";
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href || "#"}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-(--pf-radius) px-5 text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:opacity-90",
        variant === "primary" && "pf-btn-primary",
        variant === "secondary" && "pf-btn-secondary",
        variant === "inverse" && "pf-btn-inverse",
        className,
      )}
    >
      {children}
      <MousePointerClick className="size-4" />
    </a>
  );
}
