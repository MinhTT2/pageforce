import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { Edit, Inbox, Plus, Search } from "lucide-react";
import { headers } from "next/headers";
import { CreatePageDialog } from "@/components/dashboard/CreatePageDialog";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { EditPageDialog } from "@/components/dashboard/EditPageDialog";
import { PageSchemaThumbnail } from "@/components/dashboard/PageSchemaThumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { requireUser } from "@/lib/auth";
import { normalizePageSchema } from "@/lib/blocks";
import { prisma } from "@/lib/prisma";

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
                    <PageSchemaThumbnail schema={normalizePageSchema(page.draftSchema)} />
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
