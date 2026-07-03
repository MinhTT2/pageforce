import Image from "next/image";
import { Globe2, type LucideIcon } from "lucide-react";
import { blockOptions } from "@/components/builder/block-meta";
import { Button } from "@/components/ui/button";

export function ProductPreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-xl shadow-primary/10">
      <div className="overflow-hidden rounded-md border border-border bg-panel">
        <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Launch page</p>
            <p className="text-xs text-muted-foreground">/p/launch-page</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm">
              <Globe2 />
              Open page
            </Button>
          </div>
        </div>

        <div className="grid min-h-[470px] grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-background p-3 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Blocks
            </p>
            <div className="mt-3 grid gap-2">
              <PreviewBlock icon={blockOptions.hero.icon} label="Hero" active />
              <PreviewBlock icon={blockOptions.features.icon} label="Features" />
              <PreviewBlock icon={blockOptions.pricing.icon} label="Pricing" />
              <PreviewBlock icon={blockOptions.leadForm.icon} label="Lead form" />
            </div>
          </aside>

          <div className="bg-canvas p-4">
            <div className="mx-auto max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-7 text-center">
                <p className="text-xs font-medium uppercase tracking-normal text-primary">
                  New product
                </p>
                <h3 className="mx-auto mt-3 max-w-sm text-3xl font-semibold leading-tight text-card-foreground">
                  Launch faster with Pageforce
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  Create a clean landing page from simple blocks, save changes, and share the URL
                  when the message feels right.
                </p>
                <div className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                  Start building
                </div>
              </div>
              <div className="grid gap-3 p-4">
                <div className="relative aspect-[16/8] overflow-hidden rounded-lg border border-border bg-muted">
                  <Image
                    src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1400&auto=format&fit=crop"
                    alt=""
                    fill
                    unoptimized
                    sizes="520px"
                    className="object-cover"
                  />
                </div>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <div className="h-3 w-24 rounded-lg bg-primary/25" />
                  <div className="mt-3 h-2 w-full rounded-lg bg-muted" />
                  <div className="mt-2 h-2 w-4/5 rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewBlock({
  icon: Icon,
  label,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={
        active
          ? "flex items-center gap-2 rounded-lg border border-primary/20 bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
          : "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground"
      }
    >
      <Icon className="size-4" />
      {label}
    </div>
  );
}
