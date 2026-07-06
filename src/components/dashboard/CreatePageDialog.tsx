"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  Check,
  File,
  Plus,
  Rocket,
  Send,
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
import { pageTemplates, type PageTemplateKey } from "@/lib/templates";
import { cn } from "@/lib/utils";

const templateIcons: Record<PageTemplateKey, LucideIcon> = {
  blank: File,
  "product-launch": Rocket,
  event: CalendarDays,
  "sales-promo": BadgePercent,
  "saas-growth": Sparkles,
  "agency-service": Send,
  "commerce-collection": ShoppingBag,
};

type CreatePageDialogProps = {
  defaultOpen?: boolean;
  label?: string;
};

type CreatePageResponse = {
  error?: string;
  id?: string;
};

export function CreatePageDialog({ defaultOpen = false, label = "New page" }: CreatePageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<PageTemplateKey>("blank");
  const [previewing, setPreviewing] = useState(false);
  const templateSchemas = useMemo(
    () => new Map(pageTemplates.map((template) => [template.key, template.build()])),
    [],
  );
  const selectedTemplate =
    pageTemplates.find((template) => template.key === selectedTemplateKey) ?? pageTemplates[0];
  const selectedSchema = templateSchemas.get(selectedTemplate.key) ?? selectedTemplate.build();

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPreviewing(false);
      setError("");
      setSelectedTemplateKey("blank");
    }
  }

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!previewing) {
      setPreviewing(true);
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "Untitled page").trim() || "Untitled page";

    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, template: selectedTemplateKey }),
    });
    const page = (await response.json().catch(() => ({}))) as CreatePageResponse;

    setLoading(false);

    if (!response.ok) {
      setError(page.error || "Could not create this page. Please try again.");
      return;
    }

    updateOpen(false);
    if (page.id) {
      router.push(`/builder/${page.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={updateOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-4xl", previewing && "sm:max-w-5xl")}>
        <form onSubmit={createPage} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{previewing ? selectedTemplate.name : "Create landing page"}</DialogTitle>
            <DialogDescription>
              {previewing
                ? selectedTemplate.description
                : "Give this page a working name. You can tune the slug from the dashboard or builder."}
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="template" value={selectedTemplateKey} />

          <Field label="Page title" error={error}>
            <Input
              name="title"
              defaultValue="Untitled page"
              autoFocus
              required
              disabled={loading}
            />
          </Field>

          {previewing ? (
            <div className="grid gap-4">
              {selectedSchema.blocks.length ? (
                <ScrollArea className="h-[min(62vh,42rem)] overflow-hidden rounded-lg border border-border bg-white">
                  <BlockRenderer schema={selectedSchema} />
                </ScrollArea>
              ) : (
                <PageSchemaThumbnail
                  schema={selectedSchema}
                  className="aspect-[16/8] rounded-lg border border-border"
                />
              )}
            </div>
          ) : (
            <fieldset className="grid gap-2">
              <legend className="mb-2 text-sm font-medium text-foreground">Template</legend>
              <div className="grid max-h-[min(58vh,38rem)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {pageTemplates.map((template) => {
                  const TemplateIcon = templateIcons[template.key];
                  const templateSchema = templateSchemas.get(template.key) ?? template.build();
                  const selected = selectedTemplateKey === template.key;

                  return (
                    <button
                      key={template.key}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setSelectedTemplateKey(template.key);
                        setPreviewing(true);
                      }}
                      className={cn(
                        "relative overflow-hidden rounded-lg border border-border bg-card text-left transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
                        selected && "border-primary ring-2 ring-primary/25",
                      )}
                    >
                      <PageSchemaThumbnail
                        schema={templateSchema}
                        className="border-b"
                        frameClassName="rounded-sm"
                      />
                      <span className="block p-3">
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
                            <span className="mt-3 inline-flex items-center text-xs font-medium text-primary">
                              Preview template
                            </span>
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <DialogFooter className="items-center">
            {previewing ? (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setPreviewing(false)}
              >
                <ArrowLeft />
                Back
              </Button>
            ) : null}
            {previewing ? (
              <Button type="submit" disabled={loading}>
                <Plus />
                {loading ? "Creating..." : "Create page"}
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Choose a template to preview it.</p>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
