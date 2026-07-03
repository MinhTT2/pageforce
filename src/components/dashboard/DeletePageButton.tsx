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
}: {
  pageId: string;
  title: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deletePage() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/pages/${pageId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (response.ok) {
      setOpen(false);
      router.refresh();
      return;
    }

    setError("Could not delete this page. Please try again.");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className={triggerClassName}>
          <Trash2 />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete page</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-foreground">{title}</span> permanently.
            Public links for this page will stop working.
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
