"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeletePageButton({ pageId }: { pageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function deletePage() {
    const confirmed = window.confirm("Delete this page?");

    if (!confirmed) {
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/pages/${pageId}`, {
      method: "DELETE",
    });
    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <Button variant="destructive" onClick={deletePage} disabled={loading} className="h-9 px-3">
      <Trash2 size={15} />
      {loading ? "Deleting..." : "Delete"}
    </Button>
  );
}
