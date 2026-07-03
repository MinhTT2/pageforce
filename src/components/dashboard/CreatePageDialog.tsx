"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgePercent, CalendarDays, File, Plus, Rocket, type LucideIcon } from "lucide-react";
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
import { pageTemplates, type PageTemplateKey } from "@/lib/templates";

const templateIcons: Record<PageTemplateKey, LucideIcon> = {
  blank: File,
  "product-launch": Rocket,
  event: CalendarDays,
  "sales-promo": BadgePercent,
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

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "Untitled page").trim() || "Untitled page";
    const template = String(formData.get("template") || "blank");

    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, template }),
    });
    const page = (await response.json().catch(() => ({}))) as CreatePageResponse;

    setLoading(false);

    if (!response.ok) {
      setError(page.error || "Could not create this page. Please try again.");
      return;
    }

    setOpen(false);
    if (page.id) {
      router.push(`/builder/${page.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={createPage} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create landing page</DialogTitle>
            <DialogDescription>
              Give this page a working name. You can tune the slug from the dashboard or builder.
            </DialogDescription>
          </DialogHeader>

          <Field label="Page title" error={error}>
            <Input
              name="title"
              defaultValue="Untitled page"
              autoFocus
              required
              disabled={loading}
            />
          </Field>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium text-foreground">Template</legend>
            <div className="grid grid-cols-2 gap-2">
              {pageTemplates.map((template) => {
                const TemplateIcon = templateIcons[template.key];

                return (
                  <label
                    key={template.key}
                    className="cursor-pointer rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 has-checked:border-primary has-checked:ring-2 has-checked:ring-primary/25 has-focus-visible:ring-2 has-focus-visible:ring-ring"
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.key}
                      defaultChecked={template.key === "blank"}
                      disabled={loading}
                      className="sr-only"
                    />
                    <TemplateIcon className="size-4 text-primary" />
                    <span className="mt-2 block text-sm font-medium text-card-foreground">
                      {template.name}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {template.description}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              <Plus />
              {loading ? "Creating..." : "Create page"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
