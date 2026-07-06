"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" size="sm" variant="outline" className="w-full" onClick={copyUrl}>
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy URL"}
    </Button>
  );
}
