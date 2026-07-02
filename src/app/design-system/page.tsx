import { ArrowRight, Check, ExternalLink, Save, Trash2 } from "lucide-react";

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
  ["Destructive", "bg-destructive text-white"],
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
              SaaS-minimal primitives for dashboard, builder, publishing, and page management flows.
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
                Publish
                <ArrowRight />
              </Button>
              <Button variant="outline">
                <ExternalLink />
                Preview
              </Button>
              <Button variant="ghost">Draft</Button>
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
              <Field label="Status">
                <Select defaultValue="draft">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </Select>
              </Field>
              <Field label="Hero copy" className="md:col-span-2">
                <Textarea defaultValue="Build and publish landing pages from simple JSON-backed blocks." />
              </Field>
              <Field label="Slug" error="Use lowercase letters, numbers, and hyphens only.">
                <Input defaultValue="Launch Page" aria-invalid />
              </Field>
              <Field label="Disabled field">
                <Input defaultValue="Locked by publish state" disabled />
              </Field>
            </PanelContent>
          </Panel>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold">Badges</h2>
          <Panel>
            <PanelContent className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Draft</Badge>
              <Badge variant="success">Published</Badge>
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
      </section>
    </main>
  );
}
