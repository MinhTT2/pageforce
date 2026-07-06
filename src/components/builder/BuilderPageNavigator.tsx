"use client";

import { ChevronDown, FileText, LoaderCircle, Search, X } from "lucide-react";
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
    <aside className="min-h-0 overflow-auto border-r border-border bg-card">
      <div className="flex min-h-14 items-center justify-between gap-2 border-b border-border px-4">
        <h2 className="text-base font-semibold text-card-foreground">Pages</h2>
        <Button variant="ghost" size="icon" aria-label="Close pages" onClick={onClose} className="size-8">
          <X className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label="Search pages"
              className="h-9 rounded-md bg-background pl-9 text-sm"
            />
          </div>
          <CreatePageDialog
            siteId={siteId}
            label="New page"
            iconOnly
            onCreated={(page) => onSelectPage(page.id)}
          />
        </div>

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
    <section className="border-b border-border pb-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </div>

      {pages.length ? (
        <div className="grid gap-1">
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
                  "flex min-h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium text-card-foreground transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:opacity-70",
                  isCurrent && "bg-primary/10 text-primary",
                )}
              >
                {isSwitching ? (
                  <LoaderCircle className="size-3.5 shrink-0 animate-spin" />
                ) : (
                  <FileText className="size-3.5 shrink-0" />
                )}
                <span className="min-w-0 flex-1 truncate">{page.isHome ? "Home" : page.title}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-surface px-3 py-4 text-sm text-muted-foreground">
          No pages found.
        </p>
      )}
    </section>
  );
}
