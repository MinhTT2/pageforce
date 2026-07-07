import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="border-b border-border/70 bg-background">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 text-center sm:pt-20 lg:pb-16">
        <p className="pf-landing-fade mx-auto inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-xs">
          Multipage sites. Live in minutes.
        </p>
        <h1 className="pf-landing-fade-delay-1 mx-auto mt-6 max-w-4xl text-5xl font-semibold leading-tight text-foreground sm:text-6xl lg:text-7xl">
          Build multipage websites from visual blocks
        </h1>
        <p className="pf-landing-fade-delay-2 mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          Create a site, add pages for every offer or service, publish clean public URLs, and
          collect leads from one focused builder.
        </p>
        <div className="pf-landing-fade-delay-2 mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20"
          >
            <Link href="/login">
              Start building
              <ArrowRight />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="link"
            className="h-12 px-1 text-base text-foreground"
          >
            <Link href="/login?next=%2Fdashboard">Explore templates</Link>
          </Button>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}
