import Link from "next/link";
import {
  CheckCircle2,
  Edit,
  Inbox,
  Plus,
  Search,
} from "lucide-react";
import { headers } from "next/headers";
import { CreateSiteDialog } from "@/components/dashboard/CreateSiteDialog";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { EditPageDialog } from "@/components/dashboard/EditPageDialog";
import { PageSchemaThumbnail } from "@/components/dashboard/PageSchemaThumbnail";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { requireUser } from "@/lib/auth";
import { listSitesForUser } from "@/lib/pages";
import { normalizePageSchema } from "@/lib/blocks";

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
  const query = typeof params.q === "string" ? params.q.trim().toLowerCase() : "";
  const allSites = await listSitesForUser(user.id);
  const sites = query
    ? allSites.filter(
        (site) =>
          site.name.toLowerCase().includes(query) ||
          site.slug.toLowerCase().includes(query) ||
          site.pages.some((page) => page.title.toLowerCase().includes(query)),
      )
    : allSites;

  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground">Websites</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage sites, pages, public URLs, and captured leads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form method="get" role="search" className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search sites or pages"
                aria-label="Search sites or pages"
                className="w-60 pl-8"
              />
            </form>
            <CreateSiteDialog />
          </div>
        </div>

        {sites.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sites.map((site) => {
              const homePage = site.pages.find((page) => page.isHome) ?? site.pages[0];
              const siteUrl = `${publicOrigin}/s/${site.slug}`;
              const homeSchema = normalizePageSchema(homePage?.draftSchema);
              const live = Boolean(homePage && homePage.status === "PUBLISHED" && homeSchema.blocks.length);
              return (
                <Panel
                  key={site.id}
                  className="group overflow-hidden rounded-lg transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {homePage ? (
                    <Link
                      href={siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      prefetch={false}
                      aria-label={`Open ${site.name} in a new tab`}
                      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <SiteCardMain
                        homeSchema={homeSchema}
                        name={site.name}
                        siteUrl={siteUrl}
                        live={live}
                      />
                    </Link>
                  ) : (
                    <SiteCardMain
                      homeSchema={homeSchema}
                      name={site.name}
                      siteUrl={siteUrl}
                      live={live}
                    />
                  )}

                  <div className="grid gap-4 p-4 pt-0">
                    {homePage ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild>
                          <Link href={`/builder/site/${site.id}?page=${homePage.id}`}>
                            <Edit />
                             Edit
                          </Link>
                        </Button>
                        <EditPageDialog
                          page={{ id: homePage.id, title: homePage.title, slug: homePage.slug }}
                          triggerClassName="w-full"
                        />
                        <DeletePageButton
                          pageId={homePage.id}
                          title={homePage.title}
                          triggerClassName="w-full"
                        />
                        <Button asChild size="sm" variant="outline" className="w-full">
                          <Link href={`/dashboard/sites/${site.id}/leads`}>
                            <Inbox />
                            Leads
                          </Link>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </Panel>
              );
            })}
          </div>
        ) : (
          <Panel className="grid min-h-80 place-items-center rounded-lg px-6 py-10 text-center">
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                {query ? <Search className="size-5" /> : <Plus className="size-5" />}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-panel-foreground">
                {query ? "No sites found" : "Create your first website"}
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {query
                  ? "Try a different site name, slug, or page title."
                  : "Start from a ready structure, then Pageforce will open the builder for your home page."}
              </p>
              {query ? null : (
                <div className="mt-5 flex justify-center">
                  <CreateSiteDialog />
                </div>
              )}
            </div>
          </Panel>
        )}
      </section>
    </main>
  );
}

function SiteCardMain({
  homeSchema,
  name,
  siteUrl,
  live,
}: {
  homeSchema: Parameters<typeof PageSchemaThumbnail>[0]["schema"];
  name: string;
  siteUrl: string;
  live: boolean;
}) {
  return (
    <>
      <div className="relative">
        <PageSchemaThumbnail
          schema={homeSchema}
          className="aspect-[16/9] border-b bg-surface p-3"
          frameClassName="rounded-sm"
        />
      </div>

      <div className="grid gap-4 p-4">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-panel-foreground">{name}</h2>
              <span className="mt-1 block truncate font-mono text-xs font-semibold text-primary">
                {siteUrl}
              </span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className={live ? "size-3.5 text-success" : "size-3.5 text-warning"} />
              {live ? "Live" : "Draft"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function getRequestOrigin(headerStore: Headers) {
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "localhost:3000";
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
