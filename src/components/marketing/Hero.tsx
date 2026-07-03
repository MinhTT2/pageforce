import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Button } from "@/components/ui/button";

const heroBullets = ["Live public URLs", "Visual landing blocks", "Built-in lead capture"];

export function Hero() {
  return (
    <section className="border-b border-border/70 bg-[linear-gradient(180deg,var(--background)_0%,var(--surface)_100%)]">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[0.86fr_1.14fr] lg:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-xs">
            <CheckCircle2 className="size-4 text-primary" />
            Landing page builder
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Build landing pages that look ready to share.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Pageforce gives teams a focused builder, polished visual blocks, and public URLs that
            update the moment the message is right.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Log in / Sign up
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
            {heroBullets.map((bullet) => (
              <span key={bullet} className="inline-flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                {bullet}
              </span>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}
