import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-[linear-gradient(135deg,var(--primary)_0%,color-mix(in_oklab,var(--primary),var(--accent)_35%)_100%)]">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-6 py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl">
          Your next landing page could be live in an hour.
        </h2>
        <p className="mx-auto max-w-xl text-base leading-7 text-primary-foreground/80">
          Start from a template, adjust the message, and share the URL — free to try, no credit
          card.
        </p>
        <div className="flex justify-center">
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">
              Start building
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
