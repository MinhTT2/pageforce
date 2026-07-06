"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { slugify } from "@/lib/slug";
import type { PageSummary } from "@/types/page";

type EditPageDialogProps = {
  page: {
    id: string;
    title: string;
    slug: string;
    publicPath?: string;
  };
  triggerClassName?: string;
  onSaved?: (page: PageSummary) => void | Promise<void>;
};

type EditPageResponse = Partial<PageSummary> & {
  error?: string;
};

export function EditPageDialog({ page, triggerClassName, onSaved }: EditPageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const previewPath = useMemo(() => {
    if (!page.publicPath) {
      return slug ? `/${slug}` : "/page";
    }

    if (!page.slug) {
      return page.publicPath;
    }

    const nextSlug = slug || page.slug;
    return page.publicPath.endsWith(`/${page.slug}`)
      ? `${page.publicPath.slice(0, -page.slug.length)}${nextSlug}`
      : page.publicPath;
  }, [page.publicPath, page.slug, slug]);

  function updateOpen(nextOpen: boolean) {
    if (nextOpen) {
      setTitle(page.title);
      setSlug(page.slug);
    } else {
      setError("");
      setNotice("");
    }
    setOpen(nextOpen);
  }

  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const requestedSlug = slug.trim();

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: requestedSlug,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as EditPageResponse;

      if (!response.ok) {
        setError(payload.error || "Could not update this page. Please try again.");
        return;
      }

      if (payload.slug && payload.slug !== requestedSlug) {
        setSlug(payload.slug);
        setNotice(`That slug was taken. This page now uses ${payload.publicPath ?? payload.slug}.`);
      } else {
        updateOpen(false);
      }

      if (payload.id && onSaved) {
        await onSaved(payload as PageSummary);
      } else {
        router.refresh();
      }
    } catch {
      setError("Could not update this page. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={updateOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <Pencil />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={savePage} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit page details</DialogTitle>
            <DialogDescription>
              Update the page name and visitor URL. Content blocks stay in the builder canvas.
            </DialogDescription>
          </DialogHeader>

          <Field label="Page title" error={error}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={120}
              disabled={loading}
            />
          </Field>

          <Field label="Slug">
            <Input
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              required
              maxLength={80}
              disabled={loading}
            />
          </Field>
          <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs leading-5 text-muted-foreground">
            <p>
              Slugs are automatically formatted with lowercase letters, numbers, and hyphens.
            </p>
            <p className="mt-1 truncate font-mono text-foreground">{previewPath}</p>
          </div>
          {notice ? (
            <p className="text-xs leading-5 text-warning" role="status">
              {notice}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              <Pencil />
              {loading ? "Saving..." : "Save details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
