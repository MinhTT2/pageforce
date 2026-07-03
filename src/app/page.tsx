import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  Globe2,
  Image,
  LogIn,
  Rocket,
  Save,
  Type,
} from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    icon: Blocks,
    title: "Blocks",
    description: "Compose hero, text, image, and button sections without extra setup.",
  },
  {
    icon: Save,
    title: "Save drafts",
    description: "Keep edits in draft mode while your published page stays stable.",
  },
  {
    icon: Rocket,
    title: "Publish",
    description: "Ship a clean public page at a shareable slug when it is ready.",
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

  if (params.code || params.error || params.error_description) {
    const user = await getCurrentUser();

    if (user) {
      redirect("/");
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/70 bg-background">
          <div className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-18">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-xs">
                <CheckCircle2 className="size-4 text-primary" />
                Mini Web Builder SaaS
              </div>
              <h1 className="mt-6 text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
                Build a landing page without turning it into a project.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Pageforce gives every user one focused page, simple JSON-backed blocks, and a
                publish flow that keeps drafts separate from the live version.
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
                  Draft-safe publishing
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  One-page MVP workflow
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
            <span className="rounded-lg border border-success/20 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              Published
            </span>
            <Button size="sm">
              <Rocket />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid min-h-[440px] grid-cols-1 md:grid-cols-[170px_minmax(0,1fr)]">
          <aside className="border-b border-border bg-background p-3 md:border-b-0 md:border-r">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Blocks
            </p>
            <div className="mt-3 grid gap-2">
              <PreviewBlock icon={Type} label="Hero" active />
              <PreviewBlock icon={Type} label="Text" />
              <PreviewBlock icon={Image} label="Image" />
              <PreviewBlock icon={Globe2} label="Button" />
            </div>
          </aside>

          <div className="bg-canvas p-4">
            <div className="mx-auto max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-7 text-center">
                <p className="text-xs font-medium uppercase tracking-normal text-primary">
                  New product
                </p>
                <h3 className="mt-3 text-3xl font-semibold leading-tight text-card-foreground">
                  Launch faster with Pageforce
                </h3>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  Create a clean landing page from simple blocks, save it as a draft, and publish
                  when the message feels right.
                </p>
                <div className="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">
                  Start building
                </div>
              </div>
              <div className="grid gap-3 p-4">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <div className="h-3 w-24 rounded-lg bg-primary/25" />
                  <div className="mt-3 h-2 w-full rounded-lg bg-muted" />
                  <div className="mt-2 h-2 w-4/5 rounded-lg bg-muted" />
                </div>
                <div className="aspect-[16/7] rounded-lg border border-border bg-accent/45" />
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
