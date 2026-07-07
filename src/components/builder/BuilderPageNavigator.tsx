"use client";

import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Home,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CreatePageDialog } from "@/components/dashboard/CreatePageDialog";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { EditPageDialog } from "@/components/dashboard/EditPageDialog";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageSummary } from "@/types/page";

export function BuilderPageNavigator({
  siteId,
  pages,
  currentPageId,
  switchingPageId,
  onSelectPage,
  onPagesChange,
  onClose,
}: {
  siteId: string;
  pages: PageSummary[];
  currentPageId: string;
  switchingPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onPagesChange: (pages: PageSummary[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPages = useMemo(
    () =>
      normalizedQuery
        ? pages.filter(
            (page) =>
              page.title.toLowerCase().includes(normalizedQuery) ||
              page.slug.toLowerCase().includes(normalizedQuery),
          )
        : pages,
    [normalizedQuery, pages],
  );
  const currentPage = pages.find((page) => page.id === currentPageId) ?? pages[0];
  const siteLabel = currentPage?.siteName ?? "Current website";
  const sitePath = currentPage ? `/s/${currentPage.siteSlug}` : "";

  async function refreshPages() {
    setRefreshing(true);
    setRefreshError("");

    try {
      const response = await fetch(`/api/pages?siteId=${encodeURIComponent(siteId)}`);
      const payload = (await response.json().catch(() => null)) as PageSummary[] | { error?: string } | null;

      if (!response.ok || !Array.isArray(payload)) {
        setRefreshError(
          !Array.isArray(payload) && payload?.error
            ? payload.error
            : "Could not refresh pages. Try again.",
        );
        return null;
      }

      onPagesChange(payload);
      return payload;
    } catch {
      setRefreshError("Could not refresh pages. Check your connection and try again.");
      return null;
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="border-b border-border bg-card px-3.5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
              Manage pages
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
              <h2 className="text-lg font-semibold leading-6 text-card-foreground">Pages</h2>
              <span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground">
                {pages.length}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {siteLabel}
              {sitePath ? <span className="font-mono"> {sitePath}</span> : null}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close pages"
            onClick={onClose}
            className="size-8"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="border-b border-border bg-card px-3.5 py-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages"
              aria-label="Search pages"
              className="h-9 bg-surface pl-8 text-sm shadow-none"
            />
          </div>
          <CreatePageDialog
            siteId={siteId}
            label="New page"
            iconOnly
            onCreated={async (page) => {
              onPagesChange([page, ...pages.filter((item) => item.id !== page.id)]);
              await refreshPages();
              onSelectPage(page.id);
            }}
          />
        </div>
        {refreshError ? (
          <p className="mt-2 text-xs font-medium text-destructive" role="status">
            {refreshError}
          </p>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            {normalizedQuery ? `${filteredPages.length} matches` : "All pages"}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={refreshing}
            onClick={() => void refreshPages()}
          >
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {filteredPages.length ? (
          <div className="grid gap-2">
            {filteredPages.map((page) => (
              <PageListItem
                key={page.id}
                page={page}
                isCurrent={page.id === currentPageId}
                isSwitching={page.id === switchingPageId}
                switchingDisabled={Boolean(switchingPageId)}
                onSelectPage={onSelectPage}
                onPageSaved={async () => {
                  await refreshPages();
                }}
                onPageDeleted={async () => {
                  onPagesChange(pages.filter((item) => item.id !== page.id));
                  await refreshPages();
                }}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border bg-surface px-3 py-5 text-center text-sm text-muted-foreground">
            {normalizedQuery ? "No pages match this search." : "No pages yet."}
          </p>
        )}
      </div>
    </aside>
  );
}

function PageListItem({
  page,
  isCurrent,
  isSwitching,
  switchingDisabled,
  onSelectPage,
  onPageSaved,
  onPageDeleted,
}: {
  page: PageSummary;
  isCurrent: boolean;
  isSwitching: boolean;
  switchingDisabled: boolean;
  onSelectPage: (pageId: string) => void;
  onPageSaved: () => void | Promise<void>;
  onPageDeleted: () => void | Promise<void>;
}) {
  const updatedAt = formatUpdatedAt(page.updatedAt);

  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-background transition",
        isCurrent && "border-primary/30 bg-primary/5 shadow-xs",
      )}
    >
      <button
        type="button"
        onClick={() => onSelectPage(page.id)}
        disabled={isCurrent || switchingDisabled}
        aria-current={isCurrent ? "page" : undefined}
        className="group flex w-full items-start gap-2.5 rounded-t-lg px-3 py-3 text-left text-sm text-card-foreground transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-80"
      >
        {isSwitching ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-surface text-muted-foreground ring-1 ring-border/70">
            <LoaderCircle className="size-4 animate-spin" />
          </span>
        ) : (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md bg-surface text-muted-foreground ring-1 ring-border/70 transition group-hover:text-surface-foreground",
              isCurrent && "bg-primary/10 text-primary ring-primary/25",
            )}
          >
            {page.isHome ? <Home className="size-4" /> : <FileText className="size-4" />}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="min-w-0 truncate font-semibold">
              {page.isHome ? page.title || "Home" : page.title}
            </span>
            {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
            {page.isHome ? <Badge variant="secondary">Home</Badge> : null}
          </span>
          <span className="mt-1 block truncate font-mono text-[11px] text-muted-foreground">
            {page.publicPath}
          </span>
          <span className="mt-1 block text-[11px] text-muted-foreground">{updatedAt}</span>
        </span>
      </button>

      <div className="flex flex-wrap items-center gap-1 border-t border-border/70 px-3 py-2">
        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
          <Link href={page.publicPath} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-3.5" />
            View
          </Link>
        </Button>
        <EditPageDialog
          page={{ id: page.id, title: page.title, slug: page.slug, publicPath: page.publicPath }}
          triggerClassName="h-7 px-2 text-xs"
          onSaved={isCurrent ? undefined : onPageSaved}
        />
        <DeletePageButton
          pageId={page.id}
          title={page.title}
          triggerClassName="h-7 px-2 text-xs"
          disabled={isCurrent}
          onDeleted={onPageDeleted}
        />
        {isCurrent ? (
          <span className="ml-auto text-[11px] font-medium text-muted-foreground">
            Open page
          </span>
        ) : null}
      </div>
    </article>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Updated recently";
  }

  return `Updated ${new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)}`;
}
