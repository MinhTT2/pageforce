import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import {
  BadgeDollarSign,
  CircleHelp,
  Edit,
  Image as ImageIcon,
  Inbox,
  ListChecks,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PanelBottom,
  Plus,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { headers } from "next/headers";
import { CreatePageDialog } from "@/components/dashboard/CreatePageDialog";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { EditPageDialog } from "@/components/dashboard/EditPageDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { requireUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";
import type { PageBlock, PageSchema } from "@/types/blocks";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [user, headerStore, params] = await Promise.all([
    requireUser("/dashboard"),
    headers(),
    searchParams,
  ]);
  const publicOrigin = getRequestOrigin(headerStore);
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const pages = await prisma.page.findMany({
    where: {
      userId: user.id,
      ...(query ? { title: { contains: query, mode: "insensitive" as const } } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      draftSchema: true,
      _count: { select: { leadSubmissions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  const hasAnyPages = query
    ? (await prisma.page.count({ where: { userId: user.id } })) > 0
    : pages.length > 0;

  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">Pages</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {pages.length} {pages.length === 1 ? "page" : "pages"}
              {query ? ` matching "${query}"` : " in your workspace"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form method="get" role="search" className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search pages"
                aria-label="Search pages"
                className="w-52 pl-8"
              />
            </form>
            <CreatePageDialog />
          </div>
        </div>

        <Panel className="overflow-hidden rounded-lg">
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

                      <PageActions page={page} />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : hasAnyPages ? (
            <div className="grid min-h-60 place-items-center px-6 py-10 text-center">
              <div>
                <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Search className="size-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-panel-foreground">
                  No pages match &ldquo;{query}&rdquo;
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different search, or clear it to see every page.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/dashboard">Clear search</Link>
                </Button>
              </div>
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

type DashboardPageItem = {
  id: string;
  title: string;
  slug: string;
  draftSchema: Prisma.JsonValue;
  _count: { leadSubmissions: number };
};

// Grayscale on purpose — the preview mimics a user page rendered with its own
// pf tokens; do not swap these zinc/white values to app brand tokens.
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

function PageActions({ page }: { page: DashboardPageItem }) {
  return (
    <div className="pointer-events-auto relative z-20 grid grid-cols-3 gap-2">
      <Button asChild size="sm" className="w-full">
        <Link href={`/builder/${page.id}`}>
          <Edit />
          Builder
        </Link>
      </Button>
      <EditPageDialog
        page={{ id: page.id, title: page.title, slug: page.slug }}
        triggerClassName="w-full"
      />
      <DeletePageButton pageId={page.id} title={page.title} triggerClassName="w-full" />
      <Button asChild size="sm" variant="outline" className="col-span-3 w-full">
        <Link href={`/dashboard/pages/${page.id}/leads`}>
          <Inbox />
          Leads
          <Badge variant="secondary">{page._count.leadSubmissions}</Badge>
        </Link>
      </Button>
    </div>
  );
}

function getRequestOrigin(headerStore: Headers) {
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
