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

export function DeleteSiteButton({
  siteId,
  name,
  triggerClassName,
}: {
  siteId: string;
  name: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function deleteSite() {
    setLoading(true);
    setError("");
    const response = await fetch(`/api/sites/${siteId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (response.ok) {
      setOpen(false);
      router.refresh();
      return;
    }

    setError("Could not delete this site. Please try again.");
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
          <DialogTitle>Delete site</DialogTitle>
          <DialogDescription>
            Delete <span className="font-medium text-foreground">{name}</span> permanently. All
            pages and captured leads for this site will be removed.
          </DialogDescription>
        </DialogHeader>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <DialogFooter showCloseButton>
          <Button variant="destructive" onClick={deleteSite} disabled={loading}>
            <Trash2 />
            {loading ? "Deleting..." : "Delete site"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
