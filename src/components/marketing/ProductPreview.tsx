import Image from "next/image";
import { ArrowUpRight, Palette, Send, Sparkles } from "lucide-react";

export function ProductPreview() {
  return (
    <div className="pf-landing-lift relative mt-14 overflow-hidden rounded-xl bg-[linear-gradient(135deg,var(--info)_0%,color-mix(in_oklab,var(--success),var(--info)_72%)_100%)] px-5 pb-8 pt-14 shadow-xl shadow-primary/10 sm:px-10 lg:mt-16 lg:px-16 lg:pb-12">
      <div className="pf-soft-float pointer-events-none absolute left-5 top-8 hidden w-44 rounded-lg bg-card/90 p-3 text-left shadow-xl ring-1 ring-border lg:block">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Palette className="size-4 text-primary" />
          Site design theme
        </div>
        <div className="mt-3 rounded-md bg-background p-3">
          <p className="text-sm font-semibold text-foreground">Studio site</p>
          <p className="text-xs text-muted-foreground">Clean multipage theme</p>
          <div className="mt-3 grid grid-cols-4 overflow-hidden rounded-sm">
            <span className="h-4 bg-[#f26d45]" />
            <span className="h-4 bg-[#153f34]" />
            <span className="h-4 bg-[#8dc2ff]" />
            <span className="h-4 bg-[#f3f0df]" />
          </div>
        </div>
      </div>

      <div className="pf-soft-float-delay pointer-events-none absolute right-6 top-24 hidden w-36 rounded-lg bg-card p-3 text-left shadow-xl ring-1 ring-border md:block">
        <p className="text-xs text-muted-foreground">New leads</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold text-foreground">248</p>
          <span className="flex items-center text-xs font-medium text-success">
            <ArrowUpRight className="size-3.5" />
            31%
          </span>
        </div>
        <div className="mt-3 flex h-12 items-end gap-1">
          {[38, 58, 44, 70, 64, 88, 76].map((height, index) => (
            <span
              key={height}
              className="pf-chart-bar w-full rounded-sm bg-primary/70"
              style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }}
            />
          ))}
        </div>
      </div>

      <div className="pf-preview-card mx-auto max-w-3xl overflow-hidden rounded-xl bg-card text-left shadow-2xl ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive" />
            <span className="size-2.5 rounded-full bg-warning" />
            <span className="size-2.5 rounded-full bg-success" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">/s/nova</p>
        </div>
        <div className="grid lg:grid-cols-[1fr_0.82fr]">
          <div className="px-6 py-10 sm:px-10 sm:py-12">
            <p className="text-xs font-semibold uppercase text-primary">Multipage website</p>
            <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight text-card-foreground">
              A polished site for every service, offer, and launch
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Build Home, Pricing, About, and Contact pages from the same block system, then share
              the public site URL.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Home", "Pricing", "About", "Contact"].map((page) => (
                <span
                  key={page}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {page}
                </span>
              ))}
            </div>
            <div className="mt-6 flex max-w-md overflow-hidden rounded-full border border-border bg-background p-1">
              <div className="min-w-0 flex-1 px-4 py-2 text-sm text-muted-foreground">
                Email address
              </div>
              <div className="pf-shimmer inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Sign up
                <Send className="size-3.5" />
              </div>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden bg-surface">
            <Image
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop"
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 340px, 100vw"
              className="object-cover"
            />
            <div className="absolute bottom-5 left-5 rounded-lg bg-card/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg ring-1 ring-border">
              Services page
            </div>
            <div className="pf-cursor-path absolute right-14 top-16 rounded-full bg-card px-2.5 py-1.5 text-xs font-semibold text-primary shadow-lg ring-1 ring-border">
              Edit
            </div>
          </div>
        </div>
      </div>

      <div className="pf-live-pulse pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-xl ring-1 ring-border sm:flex">
        <Sparkles className="size-4 text-primary" />
        Saved live to the public page
      </div>
    </div>
  );
}
