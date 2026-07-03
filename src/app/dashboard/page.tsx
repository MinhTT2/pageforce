import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import {
  BadgeDollarSign,
  CircleHelp,
  Edit,
  ExternalLink,
  Image as ImageIcon,
  ListChecks,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PanelBottom,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { headers } from "next/headers";
import { CreatePageDialog } from "@/components/dashboard/CreatePageDialog";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { EditPageDialog } from "@/components/dashboard/EditPageDialog";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";
import type { PageBlock, PageSchema } from "@/types/blocks";

export default async function DashboardPage() {
  const [user, headerStore] = await Promise.all([requireUser("/dashboard"), headers()]);
  const publicOrigin = getRequestOrigin(headerStore);
  const pages = await prisma.page.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      slug: true,
      updatedAt: true,
      draftSchema: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-8 sm:py-10">
        <div className="grid gap-5 overflow-hidden rounded-lg border border-border bg-[linear-gradient(135deg,var(--card)_0%,var(--surface)_100%)] p-5 shadow-xs md:grid-cols-[minmax(0,1fr)_340px] md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-surface-foreground">
              <Sparkles className="size-3.5" />
              Landing page workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Dashboard
            </h1>
          </div>
            <CreatePageDialog />
        </div>

        <Panel className="overflow-hidden rounded-lg">
          <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-panel-foreground">Landing pages</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Create, edit details, delete, or open any page in the builder.
              </p>
            </div>
          </div>

          {pages.length ? (
            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => {
                const publicUrl = `${publicOrigin}/p/${page.slug}`;

                return (
                  <article
                    key={page.id}
                    className="relative overflow-hidden rounded-lg border border-border bg-card shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <Link
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${page.title}`}
                      className="absolute inset-0 z-0"
                    />
                    <DashboardPagePreview schema={normalizePageSchema(page.draftSchema)} />
                    <div className="pointer-events-none relative z-10 grid gap-4 p-4">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-foreground">{page.title}</h3>
                          <p className="mt-1 truncate text-sm font-medium text-primary">
                            {publicUrl}
                          </p>
                        </div>
                      </div>

                      <dl className="grid gap-2 text-sm">
                        <div className="flex justify-between gap-3">
                          <dt className="text-muted-foreground">Updated</dt>
                          <dd className="text-right text-foreground">
                            {formatDateTime(page.updatedAt)}
                          </dd>
                        </div>
                      </dl>

                      <PageActions page={page} publicUrl={publicUrl} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-80 gap-8 px-6 py-10 md:grid-cols-[minmax(0,0.9fr)_minmax(320px,1.1fr)] md:items-center">
              <div className="text-center md:text-left">
                <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground md:mx-0">
                  <Plus className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-panel-foreground">
                  Create your first landing page
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start with a blank page, add a hero, drop in an image block, then share the public
                  URL when it looks ready.
                </p>
                <div className="mt-5 flex justify-center md:justify-start">
                  <CreatePageDialog defaultOpen label="Create first page" />
                </div>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <div className="relative aspect-[16/10] bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop"
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 768px) 520px, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="grid gap-2 p-4">
                  <div className="h-3 w-28 rounded-full bg-primary/25" />
                  <div className="h-2 w-full rounded-full bg-muted" />
                  <div className="h-2 w-4/5 rounded-full bg-muted" />
                </div>
              </div>
            </div>
          )}
        </Panel>
      </section>
    </main>
  );
}

function DashboardStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-border bg-background/70 px-3 py-2">
      <p className="font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

type DashboardPageItem = {
  id: string;
  title: string;
  slug: string;
  updatedAt: Date;
  draftSchema: Prisma.JsonValue;
};

function DashboardPagePreview({ schema }: { schema: PageSchema }) {
  const previewBlocks = schema.blocks.slice(0, 4);

  return (
    <div className="pointer-events-none aspect-[16/10] overflow-hidden border-b border-border bg-canvas p-3">
      {previewBlocks.length ? (
        <div className="pointer-events-none h-full overflow-hidden rounded-md border border-border bg-white shadow-xs">
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
      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#eefafe_100%)] px-5 py-6 text-center">
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
          className={`line-clamp-3 text-[11px] leading-4 text-zinc-600 ${
            block.props.align === "center"
              ? "text-center"
              : block.props.align === "right"
                ? "text-right"
                : "text-left"
          }`}
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

  if (block.type === "button") {
    return (
      <section className="px-5 py-3 text-center">
        <MousePointerClick className="mx-auto mb-2 size-3 text-zinc-400" />
        <div
          className={`mx-auto h-6 w-24 rounded-md ${
            block.props.variant === "primary" ? "bg-zinc-950" : "border border-zinc-200 bg-white"
          }`}
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
    return <MiniPreview icon={Megaphone} title={block.props.headline} detail={block.props.primaryLabel} />;
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
  icon: typeof Sparkles;
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

function PageActions({ page, publicUrl }: { page: DashboardPageItem; publicUrl: string }) {
  return (
    <div className="pointer-events-auto relative z-20 grid grid-cols-2 gap-2">
      <Button asChild size="sm" className="w-full">
        <Link href={`/builder/${page.id}`}>
          <Edit />
          Builder
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href={publicUrl} target="_blank" rel="noreferrer">
          <ExternalLink />
          Public
        </Link>
      </Button>
      <EditPageDialog
        page={{ id: page.id, title: page.title, slug: page.slug }}
        triggerClassName="w-full"
      />
      <DeletePageButton pageId={page.id} title={page.title} triggerClassName="w-full" />
    </div>
  );
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getRequestOrigin(headerStore: Headers) {
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
