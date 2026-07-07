import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MousePointer2,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type FeatureRow = {
  eyebrow: string;
  heading: string;
  description: string;
  bullets: string[];
  image?: string;
  visual?: "live";
};

const rows: FeatureRow[] = [
  {
    eyebrow: "Visual builder",
    heading: "Design every page without waiting on a designer",
    description:
      "Drag sections onto each page, tune site-wide design tokens, and keep every hero, feature list, price card, testimonial, FAQ, and form aligned.",
    bullets: [
      "13 production-minded block types",
      "Site and page patterns that stay visually consistent",
      "Reusable rendering for builder preview and public pages",
    ],
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=1400&auto=format&fit=crop",
  },
  {
    eyebrow: "Multipage workflow",
    heading: "Manage a full public site from one dashboard",
    description:
      "Pageforce saves into the live schema, so every public page updates as soon as the content is ready. No export flow, duplicate site, or stale page link.",
    bullets: [
      "Public pages render only when there is real content",
      "Slug and SEO fields live next to the builder",
      "Dashboard keeps sites, pages, and leads together",
    ],
    visual: "live",
  },
];

export function FeatureRows() {
  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-16 lg:gap-20 lg:py-20">
        <section className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <p className="text-sm font-medium text-primary">Create with Pageforce</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Start with a site structure, then shape each page to its job
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Use templates and block defaults to create a credible site quickly. Then edit each
              page for your story, services, proof, pricing, and contact flow.
            </p>
            <Button
              asChild
              className="pf-shimmer mt-6 shadow-md shadow-primary/15"
              size="lg"
            >
              <Link href="/login">
                Create a site draft
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FeatureTile
              icon={Wand2}
              title="Site start"
              text="Create the first pages and replace the defaults."
            />
            <FeatureTile
              icon={MousePointer2}
              title="Page sections"
              text="Move blocks into the right order per page."
            />
            <FeatureTile
              icon={Sparkles}
              title="Ready to share"
              text="Open the site or a specific public page."
            />
          </div>
        </section>

        {rows.map((row, index) => (
          <section key={row.eyebrow} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              <p className="text-sm font-medium text-primary">{row.eyebrow}</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                {row.heading}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{row.description}</p>
              <ul className="mt-6 grid gap-3">
                {row.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
            <div className={index % 2 === 1 ? "lg:order-1" : undefined}>
              {row.visual === "live" ? <LiveWorkflowVisual /> : <ImageVisual src={row.image} />}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

function ImageVisual({ src }: { src?: string }) {
  if (!src) {
    return null;
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-md">
      <Image
        src={src}
        alt=""
        fill
        unoptimized
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}

function LiveWorkflowVisual() {
  return (
    <div className="pf-preview-card grid aspect-[4/3] content-center overflow-hidden rounded-xl border border-border bg-card p-5 shadow-md">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Builder status</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Website saved</p>
          </div>
          <span className="pf-live-pulse rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            Live
          </span>
        </div>
        <div className="mt-5 grid gap-3 rounded-lg bg-background p-4">
          <div className="h-3 w-32 rounded-full bg-primary/25" />
          <div className="h-2 w-full rounded-full bg-muted" />
          <div className="h-2 w-4/5 rounded-full bg-muted" />
          <div className="pf-shimmer mt-2 h-9 w-36 rounded-full bg-primary" />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Public URL</p>
          <p className="mt-1 truncate text-sm font-semibold text-foreground">/s/nova/pricing</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs text-muted-foreground">Lead form</p>
          <p className="mt-1 text-sm font-semibold text-foreground">Ready to capture</p>
        </div>
      </div>
    </div>
  );
}

function FeatureTile({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="pf-preview-card rounded-lg border border-border bg-card p-5 shadow-xs">
      <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}
