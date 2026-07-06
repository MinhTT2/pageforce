"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import type { PageSummary } from "@/types/page";

type CreatePageDialogProps = {
  defaultOpen?: boolean;
  label?: string;
  siteId?: string;
  triggerClassName?: string;
  iconOnly?: boolean;
  onCreated?: (page: PageSummary) => void;
};

type CreatePageResponse = Partial<PageSummary> & {
  error?: string;
};

export function CreatePageDialog({
  defaultOpen = false,
  label = "New page",
  siteId,
  triggerClassName,
  iconOnly = false,
  onCreated,
}: CreatePageDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError("");
    }
  }

  async function createPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "Untitled page").trim() || "Untitled page";

    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, siteId }),
    });
    const page = (await response.json().catch(() => ({}))) as CreatePageResponse;

    setLoading(false);

    if (!response.ok) {
      setError(page.error || "Could not create this page. Please try again.");
      return;
    }

    updateOpen(false);
    if (page.id && onCreated) {
      onCreated(page as PageSummary);
      return;
    }

    if (page.id) {
      router.push(`/builder/${page.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={updateOpen}>
      <DialogTrigger asChild>
        <Button size={iconOnly ? "icon" : "lg"} className={triggerClassName} aria-label={label}>
          <Plus />
          {iconOnly ? null : label}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={createPage} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create page</DialogTitle>
            <DialogDescription>
              Start with an empty canvas in the current website.
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
