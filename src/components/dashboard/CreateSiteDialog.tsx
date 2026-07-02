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

type CreateSiteDialogProps = {
  defaultOpen?: boolean;
};

type CreatePageResponse = {
  id?: string;
  error?: string;
};

export function CreateSiteDialog({ defaultOpen = false }: CreateSiteDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createSite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "Untitled page").trim() || "Untitled page";

    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const page = (await response.json().catch(() => ({}))) as CreatePageResponse;

    setLoading(false);

    if (!response.ok || !page.id) {
      setError(page.error || "Could not create your website. Please try again.");
      return;
    }

    setOpen(false);
    router.push(`/builder/${page.id}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create website
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <form onSubmit={createSite} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Create your website</DialogTitle>
            <DialogDescription>
              Name your first landing page. You can edit the title and slug later.
            </DialogDescription>
          </DialogHeader>

          <Field label="Website name" error={error}>
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
              {loading ? "Creating..." : "Create website"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
