"use client";

import { FormEvent, useState } from "react";
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

type EditPageDialogProps = {
  page: {
    id: string;
    title: string;
    slug: string;
  };
  triggerClassName?: string;
};

type EditPageResponse = {
  error?: string;
  slug?: string;
};

export function EditPageDialog({ page, triggerClassName }: EditPageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function savePage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const requestedSlug = slug.trim();

    const response = await fetch(`/api/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug: requestedSlug,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as EditPageResponse;

    setLoading(false);

    if (!response.ok) {
      setError(payload.error || "Could not update this page. Please try again.");
      return;
    }

    if (payload.slug && payload.slug !== requestedSlug) {
      setSlug(payload.slug);
      setNotice(`That slug was taken. This page is now published at /p/${payload.slug}.`);
      router.refresh();
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              Update the dashboard title and public slug. Content blocks stay in the builder.
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
