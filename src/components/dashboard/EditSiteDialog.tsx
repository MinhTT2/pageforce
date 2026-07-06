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

type EditSiteDialogProps = {
  site: {
    id: string;
    name: string;
    slug: string;
  };
  triggerClassName?: string;
};

type EditSiteResponse = {
  error?: string;
  slug?: string;
};

export function EditSiteDialog({ site, triggerClassName }: EditSiteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(site.name);
  const [slug, setSlug] = useState(site.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function saveSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const requestedSlug = slug.trim();
    const response = await fetch(`/api/sites/${site.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: requestedSlug,
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as EditSiteResponse;

    setLoading(false);

    if (!response.ok) {
      setError(payload.error || "Could not update this site. Please try again.");
      return;
    }

    if (payload.slug && payload.slug !== requestedSlug) {
      setSlug(payload.slug);
      setNotice(`That slug was taken. This site is now published at /s/${payload.slug}.`);
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
        <form onSubmit={saveSite} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Edit site details</DialogTitle>
            <DialogDescription>
              Update the dashboard name and public site slug. Page content stays in the builder.
            </DialogDescription>
          </DialogHeader>

          <Field label="Site name" error={error}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
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
