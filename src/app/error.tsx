"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,var(--background)_0%,var(--surface)_100%)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-5">
        <BrandLogo size="sm" />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-card-foreground">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            An unexpected error occurred. Try again, or head back to the homepage.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
          {error.digest ? (
            <p className="mt-5 font-mono text-xs text-muted-foreground">
              Error digest: {error.digest}
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
