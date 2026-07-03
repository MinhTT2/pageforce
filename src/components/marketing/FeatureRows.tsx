import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

type FeatureRow = {
  eyebrow: string;
  heading: string;
  description: string;
  bullets: string[];
  image?: string;
};

const rows: FeatureRow[] = [
  {
    eyebrow: "Compose visually",
    heading: "Build from blocks, not from scratch",
    description:
      "Drag hero, features, pricing, testimonials, FAQ, and lead-form sections onto the canvas. Every block ships with sensible defaults, so the page looks credible before you touch a single setting.",
    bullets: [
      "Drag-and-drop with a keyboard-accessible handle",
      "Per-block style overrides when you need them",
      "Page-wide design tokens keep everything consistent",
    ],
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
  },
  {
    eyebrow: "Save live",
    heading: "No publish step, no staging dance",
    description:
      "Saving in the builder updates the public page immediately. Adjust the headline, hit save, refresh the shared link — your visitors always see the latest message.",
    bullets: ["Changes go live the moment you save", "Ship a page and iterate the same day"],
  },
  {
    eyebrow: "Share & capture",
    heading: "A clean URL that collects leads for you",
    description:
      "Every page gets a public URL as soon as it exists. Drop in a lead-form block and submissions land in your dashboard — no external form tool required.",
    bullets: [
      "Public pages need no login to view",
      "Lead submissions tracked per page",
      "SEO title and description per page",
    ],
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
  },
];

export function FeatureRows() {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-16 lg:gap-20 lg:py-20">
        {rows.map((row, index) => (
          <div key={row.eyebrow} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
              <p className="text-sm font-medium text-primary">{row.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                {row.heading}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{row.description}</p>
              <ul className="mt-5 grid gap-2.5">
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
              {row.image ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-md">
                  <Image
                    src={row.image}
                    alt=""
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <SaveLiveVisual />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SaveLiveVisual() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-md">
      <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
        <div className="h-2.5 w-28 rounded-full bg-muted-foreground/25" />
        <div className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
          Save
        </div>
      </div>
      <div className="mt-3 grid gap-2 rounded-lg border border-border bg-background p-4">
        <div className="h-3 w-36 rounded-full bg-primary/25" />
        <div className="h-2 w-full rounded-full bg-muted" />
        <div className="h-2 w-4/5 rounded-full bg-muted" />
        <div className="mt-2 h-8 w-28 rounded-md bg-primary/15" />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm font-medium text-success">
        <span className="size-2 rounded-full bg-success" />
        Live at /p/launch-page
      </div>
    </div>
  );
}
