import Image from "next/image";
import { ArrowRight, Check, ExternalLink, Image as ImageIcon, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Panel,
  PanelContent,
  PanelHeader,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const swatches = [
  ["Background", "bg-background text-foreground"],
  ["Surface", "bg-surface text-surface-foreground"],
  ["Panel", "bg-panel text-panel-foreground"],
  ["Card", "bg-card text-card-foreground"],
  ["Primary", "bg-primary text-primary-foreground"],
  ["Accent", "bg-accent text-accent-foreground"],
  ["Success", "bg-success text-success-foreground"],
  ["Warning", "bg-warning text-warning-foreground"],
  ["Info", "bg-info text-info-foreground"],
  ["Destructive", "bg-destructive text-destructive-foreground"],
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pageforce</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Design System V1</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              SaaS-minimal primitives for dashboard, builder, and page management flows.
            </p>
          </div>
          <Badge variant="success">
            <Check className="size-3" />
            Ready
          </Badge>
        </div>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Tokens</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {swatches.map(([label, className]) => (
              <div
                key={label}
                className={`flex h-24 items-end rounded-lg border border-border p-3 shadow-xs ${className}`}
              >
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Buttons</h2>
          <Panel>
            <PanelContent className="flex flex-wrap items-center gap-3">
              <Button>
                <Save />
                Save
              </Button>
              <Button variant="secondary">
                Open page
                <ArrowRight />
              </Button>
              <Button variant="outline">
                <ExternalLink />
                Preview
              </Button>
              <Button variant="ghost">URL</Button>
              <Button variant="destructive">
                <Trash2 />
                Delete
              </Button>
              <Button size="icon" variant="outline" aria-label="Save page">
                <Save />
              </Button>
            </PanelContent>
          </Panel>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Forms</h2>
          <Panel>
            <PanelContent className="grid gap-5 md:grid-cols-2">
              <Field label="Page title" description="Shown in the dashboard and editor header.">
                <Input defaultValue="Launch page" />
              </Field>
              <Field label="Visibility">
                <Select defaultValue="public">
                  <option value="public">Public</option>
                  <option value="hidden">Hidden</option>
                </Select>
              </Field>
              <Field label="Hero copy" className="md:col-span-2">
                <Textarea defaultValue="Build landing pages from simple JSON-backed blocks." />
              </Field>
              <Field label="Slug" error="Use lowercase letters, numbers, and hyphens only.">
                <Input defaultValue="Launch Page" aria-invalid />
              </Field>
              <Field label="Disabled field">
                <Input defaultValue="Managed by page settings" disabled />
              </Field>
            </PanelContent>
          </Panel>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Badges</h2>
          <Panel>
            <PanelContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Saved</Badge>
              <Badge variant="success">Live</Badge>
              <Badge variant="warning">Needs review</Badge>
              <Badge variant="destructive">Failed</Badge>
              <Badge variant="outline">Outline</Badge>
            </PanelContent>
          </Panel>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Cards And Panels</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Landing page</CardTitle>
                <CardDescription>Updated 2 minutes ago</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  A compact content surface for page lists, summaries, and repeated dashboard items.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Edit</Button>
                <Button size="sm" variant="outline">
                  Public
                </Button>
              </CardFooter>
            </Card>

            <Panel>
              <PanelHeader>
                <h3 className="text-sm font-semibold">Builder panel</h3>
              </PanelHeader>
              <PanelContent className="grid gap-3">
                <div className="rounded-md border border-border bg-surface p-3 text-sm">
                  Hero block
                </div>
                <div className="rounded-md border border-border bg-surface p-3 text-sm">
                  Image block
                </div>
                <div className="rounded-md border border-border bg-surface p-3 text-sm">
                  Button block
                </div>
              </PanelContent>
            </Panel>
          </div>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Visual Surfaces</h2>
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-xs">
              <div className="relative aspect-[16/8] bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=1400&auto=format&fit=crop"
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 620px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-normal text-primary">
                  Landing preview
                </p>
                <h3 className="mt-2 text-lg font-semibold">A real image anchors the page.</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use photos in previews, empty states, and examples so the product feels tangible.
                </p>
              </div>
            </div>
            <Panel className="rounded-lg">
              <PanelHeader>
                <h3 className="text-sm font-semibold">Image fallback</h3>
              </PanelHeader>
              <PanelContent>
                <div className="grid aspect-[16/10] place-items-center rounded-md border border-dashed border-border bg-surface text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="mx-auto size-7" />
                    <p className="mt-3 text-sm font-medium">Add an image URL</p>
                  </div>
                </div>
              </PanelContent>
            </Panel>
          </div>
        </section>
      </section>
    </main>
  );
}
