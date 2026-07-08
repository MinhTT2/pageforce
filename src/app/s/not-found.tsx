import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

// Static on purpose: /s pages are statically cached, and this boundary is
// rendered as part of their static shell. It must not read cookies/headers
// (the root not-found does, via SiteHeader).
export default function PublicSiteNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Compass className="size-5" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This page does not exist or has not been published yet.
        </p>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">Go to Pageforce</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
