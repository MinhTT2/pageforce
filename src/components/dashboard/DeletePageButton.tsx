"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
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

export function DeletePageButton({
  pageId,
  title,
  triggerClassName,
  onDeleted,
  disabled = false,
}: {
  pageId: string;
  title: string;
  triggerClassName?: string;
  onDeleted?: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deletePage() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOpen(false);
        if (onDeleted) {
          await onDeleted();
        } else {
          router.refresh();
        }
        return;
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || "Could not delete this page. Please try again.");
    } catch {
      setError("Could not delete this page. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className={triggerClassName} disabled={disabled}>
          <Trash2 />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete page</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-foreground">{title}</span> permanently.
            Visitors will no longer be able to open this page. If it is the homepage, Pageforce will
            choose another page as home.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter showCloseButton>
          <Button variant="destructive" onClick={deletePage} disabled={loading}>
            <Trash2 />
            {loading ? "Deleting..." : "Delete page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
