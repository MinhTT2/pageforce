import Link from "next/link";
import { LogIn } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";

// The not-found boundary is embedded in the static shell of cached routes
// (e.g. public /s pages), so it must stay fully static: no SiteHeader here,
// because that reads cookies/headers and would break static rendering.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <BrandLogo tagline="Website builder" />
          <nav className="flex flex-wrap items-center justify-end gap-2" aria-label="Main navigation">
            <Button asChild>
              <Link href="/login?next=%2Fdashboard">
                <LogIn />
                Start building
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,var(--background)_0%,var(--surface)_100%)] px-6 py-16">
        <div className="max-w-md text-center">
          <span className="inline-flex items-center rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            404
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground">
            This page doesn&apos;t exist
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The page you are looking for may have been moved, renamed, or never existed.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/">Back to home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
