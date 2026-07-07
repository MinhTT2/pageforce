import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-[linear-gradient(135deg,var(--primary)_0%,color-mix(in_oklab,var(--primary),var(--success)_24%)_100%)]">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-16 text-center lg:py-24">
        <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight text-primary-foreground sm:text-5xl">
          Try the Pageforce multipage website builder for free
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-primary-foreground/80 sm:text-lg">
          Start from a template, customize each page, add lead forms, and share the public site URL
          when everything is ready.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="pf-shimmer h-12 rounded-full px-7"
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
            className="h-12 px-1 text-primary-foreground"
          >
            <Link href="/login?next=%2Fdashboard">Open templates</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
