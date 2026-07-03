import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  Globe2,
  Image as ImageIcon,
  LogIn,
  MousePointerClick,
  Save,
  Type,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getSafeNextPath } from "@/lib/auth-routes";

const features = [
  {
    icon: Blocks,
    title: "Blocks",
    description: "Compose hero, text, image, and button sections without extra setup.",
  },
  {
    icon: Save,
    title: "Save live",
    description: "Update the public page from the builder without a separate publish step.",
  },
  {
    icon: Globe2,
    title: "Share URL",
    description: "Every page gets a clean public URL as soon as it exists.",
  },
];

const useCases = [
  {
    title: "Launch a new offer",
    description: "Pair a sharp hero with product imagery and a single action.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Validate a campaign",
    description: "Ship a page quickly, adjust copy, and share the URL the same day.",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Collect focused clicks",
    description: "Keep visitors on a clean page with only the message that matters.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
  },
];

type HomeProps = {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
    next?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (params.code || params.error || params.error_description) {
    if (user) {
      redirect(getSafeNextPath(params.next));
    }

    const callbackParams = new URLSearchParams();

    if (params.code) {
      callbackParams.set("code", params.code);
    }

    if (params.error) {
      callbackParams.set("error", params.error);
    }

    if (params.error_description) {
      callbackParams.set("error_description", params.error_description);
    }

    callbackParams.set("next", params.next || "/dashboard");
    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/70 bg-[linear-gradient(180deg,var(--background)_0%,var(--surface)_100%)]">
          <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-[0.86fr_1.14fr] lg:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-xs">
                <CheckCircle2 className="size-4 text-primary" />
                Mini Web Builder SaaS
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                Build landing pages that look ready to share.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Pageforce gives teams a focused builder, polished visual blocks, and public URLs
                that update the moment the message is right.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">
                    <LogIn />
                    Log in
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  Live public URLs
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  Visual landing blocks
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  Fast page management
                </span>
              </div>
            </div>

            <ProductPreview />
          </div>
        </section>

        <section className="bg-surface">
          <div className="mx-auto grid max-w-6xl gap-3 px-6 py-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-border bg-card p-4 shadow-xs"
              >
                <feature.icon className="size-5 text-primary" />
                <h2 className="mt-3 text-sm font-semibold text-card-foreground">
                  {feature.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Made for fast page work</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
                  Start with a clear canvas, then make it visual.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Pageforce keeps the workflow simple while giving every page enough visual weight to
                feel credible before you share it.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {useCases.map((useCase) => (
                <article
                  key={useCase.title}
                  className="overflow-hidden rounded-lg border border-border bg-card shadow-xs"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={useCase.image}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground">{useCase.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {useCase.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl shadow-primary/10">
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
              <PreviewBlock icon={Type} label="Hero" active />
              <PreviewBlock icon={Type} label="Text" />
              <PreviewBlock icon={ImageIcon} label="Image" />
              <PreviewBlock icon={MousePointerClick} label="Button" />
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
  icon: typeof Type;
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
