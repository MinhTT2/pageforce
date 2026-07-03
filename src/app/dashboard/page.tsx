import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { Edit, ExternalLink, Plus, Sparkles } from "lucide-react";
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
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-surface-foreground">
              <Sparkles className="size-3.5" />
              Landing page workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Manage every landing page, open public URLs, and jump into the builder from one place.
            </p>
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
                    className="relative overflow-hidden rounded-lg border border-border bg-background shadow-xs transition hover:border-foreground/30"
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
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium text-foreground">{page.title}</h3>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
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
            <div className="grid min-h-80 place-items-center px-6 py-12 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Plus className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-panel-foreground">
                  Create your first landing page
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Start with a blank page, add blocks in the builder, then share its public URL.
                </p>
                <div className="mt-5 flex justify-center">
                  <CreatePageDialog defaultOpen label="Create first page" />
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
  updatedAt: Date;
  draftSchema: Prisma.JsonValue;
};

function DashboardPagePreview({ schema }: { schema: PageSchema }) {
  const previewBlocks = schema.blocks.slice(0, 4);

  return (
    <div className="pointer-events-none aspect-[16/10] overflow-hidden border-b border-border bg-canvas">
      {previewBlocks.length ? (
        <div className="pointer-events-none h-full overflow-hidden bg-white">
          {previewBlocks.map((block) => (
            <PreviewBlock key={block.id} block={block} />
          ))}
        </div>
      ) : (
        <div className="grid h-full place-items-center bg-[linear-gradient(135deg,var(--muted)_0,var(--background)_100%)] px-6 text-center">
          <div>
            <div className="mx-auto h-2 w-16 rounded-full bg-muted-foreground/20" />
            <div className="mx-auto mt-3 h-2 w-28 rounded-full bg-muted-foreground/30" />
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
      <section className="px-5 py-6 text-center">
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
            <Image src={block.props.src} alt={block.props.alt || ""} fill className="object-cover" />
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-3 text-center">
      <div
        className={`mx-auto h-6 w-24 rounded-md ${
          block.props.variant === "primary" ? "bg-zinc-950" : "border border-zinc-200 bg-white"
        }`}
      />
    </section>
  );
}

function PageActions({ page, publicUrl }: { page: DashboardPageItem; publicUrl: string }) {
  return (
    <div className="pointer-events-auto relative z-20 flex flex-wrap gap-2">
      <Button asChild size="sm">
        <Link href={`/builder/${page.id}`}>
          <Edit />
          Builder
        </Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href={publicUrl} target="_blank" rel="noreferrer">
          <ExternalLink />
          Public
        </Link>
      </Button>
      <EditPageDialog page={{ id: page.id, title: page.title, slug: page.slug }} />
      <DeletePageButton pageId={page.id} title={page.title} />
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
