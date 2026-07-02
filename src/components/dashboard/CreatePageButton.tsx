"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreatePageButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function createPage() {
    setLoading(true);
    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled page" }),
    });
    const page = await response.json();
    setLoading(false);

    if (response.ok) {
      router.push(`/builder/${page.id}`);
    }
  }

  return (
    <Button onClick={createPage} disabled={loading}>
      <Plus size={16} />
      {loading ? "Creating..." : "New page"}
    </Button>
  );
}
