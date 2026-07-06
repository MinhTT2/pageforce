"use client";

import { FileText, LoaderCircle, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { CreatePageDialog } from "@/components/dashboard/CreatePageDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PageSummary } from "@/types/page";

export function BuilderPageNavigator({
  siteId,
  pages,
  currentPageId,
  switchingPageId,
  onSelectPage,
  onClose,
}: {
  siteId: string;
  pages: PageSummary[];
  currentPageId: string;
  switchingPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
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
  const mainPages = filteredPages.filter((page) => page.isHome);
  const customPages = filteredPages.filter((page) => !page.isHome);

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-r border-border bg-card">
      <div className="border-b border-border bg-card px-3.5 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
              Manage pages
            </p>
            <h2 className="mt-0.5 text-lg font-semibold leading-6 text-card-foreground">Pages</h2>
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

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-3">
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
            onCreated={(page) => onSelectPage(page.id)}
          />
        </div>

        <div className="mt-4 grid gap-4">
          <PageGroup
            title="Main Pages"
            pages={mainPages}
            currentPageId={currentPageId}
            switchingPageId={switchingPageId}
            onSelectPage={onSelectPage}
          />
          <PageGroup
            title="Custom Pages"
            pages={customPages}
            currentPageId={currentPageId}
            switchingPageId={switchingPageId}
            onSelectPage={onSelectPage}
          />
        </div>
      </div>
    </aside>
  );
}

function PageGroup({
  title,
  pages,
  currentPageId,
  switchingPageId,
  onSelectPage,
}: {
  title: string;
  pages: PageSummary[];
  currentPageId: string;
  switchingPageId: string | null;
  onSelectPage: (pageId: string) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-normal text-muted-foreground">
          {title}
        </h3>
        <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
          {pages.length}
        </span>
      </div>

      {pages.length ? (
        <div className="grid gap-1.5">
          {pages.map((page) => {
            const isCurrent = page.id === currentPageId;
            const isSwitching = page.id === switchingPageId;

            return (
              <button
                key={page.id}
                type="button"
                onClick={() => onSelectPage(page.id)}
                disabled={isCurrent || Boolean(switchingPageId)}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "group flex min-h-11 w-full items-center gap-2 rounded-md border border-transparent px-2.5 py-2 text-left text-sm font-medium text-card-foreground transition hover:border-border hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70",
                  isCurrent && "border-primary/20 bg-primary/10 text-primary",
                )}
              >
                {isSwitching ? (
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-muted-foreground ring-1 ring-border/70">
                    <LoaderCircle className="size-3.5 animate-spin" />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-muted-foreground ring-1 ring-border/70 transition group-hover:text-surface-foreground",
                      isCurrent && "bg-primary/10 text-primary ring-primary/25",
                    )}
                  >
                    <FileText className="size-3.5" />
                  </span>
                )}
                <span className="min-w-0 flex-1 truncate">{page.isHome ? "Home" : page.title}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-surface px-3 py-5 text-center text-sm text-muted-foreground">
          No pages found.
        </p>
      )}
    </section>
  );
}
