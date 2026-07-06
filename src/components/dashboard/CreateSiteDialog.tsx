"use client";

import { FormEvent, MouseEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  File,
  Layers,
  Plus,
  Rocket,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { PageSchemaThumbnail } from "@/components/dashboard/PageSchemaThumbnail";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildSiteHeaderSchema, siteTemplates, type SiteTemplateKey } from "@/lib/templates";
import { cn } from "@/lib/utils";

const templateIcons: Record<SiteTemplateKey, LucideIcon> = {
  "blank-site": File,
  "saas-site": Sparkles,
  "agency-site": BriefcaseBusiness,
  "commerce-site": ShoppingBag,
  "event-site": CalendarDays,
  "launch-site": Rocket,
};

type CreateSiteResponse = {
  error?: string;
  id?: string;
  homePageId?: string;
};

export function CreateSiteDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [siteName, setSiteName] = useState("My Store");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<SiteTemplateKey>("saas-site");
  const [previewing, setPreviewing] = useState(false);
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const templatePreviewPages = useMemo(
    () =>
      new Map(
        siteTemplates.map((template) => [
          template.key,
          template.pages.map((page) => ({
            title: page.title,
            slug: page.title.toLowerCase().replace(/\s+/g, "-"),
            schema: page.schema(),
          })),
        ]),
      ),
    [],
  );
  const selectedTemplate =
    siteTemplates.find((template) => template.key === selectedTemplateKey) ?? siteTemplates[0];
  const selectedPages =
    templatePreviewPages.get(selectedTemplate.key) ??
    selectedTemplate.pages.map((page) => ({
      title: page.title,
      slug: page.title.toLowerCase().replace(/\s+/g, "-"),
      schema: page.schema(),
    }));
  const selectedPreviewPage =
    selectedPages[Math.min(previewPageIndex, selectedPages.length - 1)] ?? selectedPages[0];
  const previewHeaderSchema = buildSiteHeaderSchema({
    brandText: selectedTemplate.brandText,
    pages: selectedPages.map((page, index) => ({
      title: page.title,
      slug: page.slug,
      isHome: index === 0,
    })),
    urlForPage: (_page, index) => `#template-preview-page-${index}`,
  });
  const selectedPreviewSchema = {
    ...selectedPreviewPage.schema,
    blocks: [...previewHeaderSchema.blocks, ...selectedPreviewPage.schema.blocks],
  };

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError("");
      setSiteName("My Store");
      setSelectedTemplateKey("saas-site");
      setPreviewing(false);
      setPreviewPageIndex(0);
    }
  }

  async function createSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const name = siteName.trim() || "Untitled site";
    const response = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, template: selectedTemplateKey }),
    });
    const payload = (await response.json().catch(() => ({}))) as CreateSiteResponse;

    setLoading(false);

    if (!response.ok) {
      setError(payload.error || "Could not create this site. Please try again.");
      return;
    }

    updateOpen(false);
    if (payload.id && payload.homePageId) {
      router.push(`/builder/site/${payload.id}?page=${payload.homePageId}`);
      return;
    }

    router.refresh();
  }

  function navigatePreview(event: MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");

    if (!href?.startsWith("#template-preview-page-")) {
      return;
    }

    const nextIndex = Number(href.replace("#template-preview-page-", ""));
    if (!Number.isInteger(nextIndex) || !selectedPages[nextIndex]) {
      return;
    }

    event.preventDefault();
    setPreviewPageIndex(nextIndex);
  }

  return (
    <Dialog open={open} onOpenChange={updateOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus />
          New site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl">
        <form id="create-site-form" onSubmit={createSite} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create website</DialogTitle>
            <DialogDescription>
              Pick a website structure. Pageforce will create the pages together so the site is
              ready to edit.
            </DialogDescription>
          </DialogHeader>
          <Field label="Site name" error={error}>
            <Input
              name="name"
              value={siteName}
              onChange={(event) => setSiteName(event.target.value)}
              autoFocus
              required
              disabled={loading}
            />
          </Field>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">Template</legend>
            <ScrollArea className="h-[min(58vh,36rem)]">
              <div className="grid gap-3 pr-3 sm:grid-cols-2 lg:grid-cols-3">
                {siteTemplates.map((template) => {
                  const TemplateIcon = templateIcons[template.key];
                  const selected = selectedTemplateKey === template.key;
                  const templatePages = templatePreviewPages.get(template.key);
                  const homeSchema = templatePages?.[0].schema ?? template.pages[0].schema();

                  return (
                    <button
                      key={template.key}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setSelectedTemplateKey(template.key);
                        setPreviewPageIndex(0);
                        setPreviewing(true);
                      }}
                      className={cn(
                        "overflow-hidden rounded-lg border border-border bg-card text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
                        selected && "border-primary ring-2 ring-primary/25",
                      )}
                    >
                      <PageSchemaThumbnail
                        schema={homeSchema}
                        className="border-b"
                        frameClassName="rounded-sm"
                      />
                      <span className="grid gap-3 p-3">
                        <span className="flex items-start gap-2">
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
                            <TemplateIcon className="size-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                              {template.name}
                              {selected ? <Check className="size-4 text-primary" /> : null}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                              {template.description}
                            </span>
                          </span>
                        </span>
                        <span className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-muted-foreground">
                          <Layers className="size-3.5" />
                          {template.pages.length} {template.pages.length === 1 ? "page" : "pages"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </fieldset>

          {previewing ? (
            <div className="fixed inset-0 z-50 grid bg-background/95 p-4 backdrop-blur-sm sm:p-6">
              <div className="mx-auto grid h-full w-full max-w-6xl grid-rows-[auto_1fr_auto] gap-4 overflow-hidden">
                <div className="flex flex-col gap-3 rounded-lg border border-border bg-panel p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-panel-foreground">
                      {selectedTemplate.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={loading}
                      onClick={() => setPreviewing(false)}
                    >
                      <ArrowLeft />
                      Back
                    </Button>
                    <Button type="submit" disabled={loading}>
                      <Plus />
                      {loading ? "Creating..." : "Create site"}
                    </Button>
                  </div>
                </div>

                <div className="min-h-0 overflow-hidden">
                  <ScrollArea
                    className="h-full min-h-0 overflow-hidden rounded-lg border border-border bg-white"
                    onClickCapture={navigatePreview}
                  >
                    {selectedPreviewSchema.blocks.length ? (
                      <BlockRenderer schema={selectedPreviewSchema} />
                    ) : (
                      <PageSchemaThumbnail
                        schema={selectedPreviewSchema}
                        className="aspect-[16/8]"
                        frameClassName="rounded-sm"
                      />
                    )}
                  </ScrollArea>
                </div>

                <div className="rounded-lg border border-border bg-panel p-4">
                  <Field label="Site name" error={error}>
                    <Input
                      name="name"
                      value={siteName}
                      onChange={(event) => setSiteName(event.target.value)}
                      required
                      disabled={loading}
                      form="create-site-form"
                    />
                  </Field>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              <Plus />
              {loading ? "Creating..." : "Create site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
