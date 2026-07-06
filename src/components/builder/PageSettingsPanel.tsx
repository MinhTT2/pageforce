import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { PageSettings } from "@/types/blocks";
import { Field } from "./fields/Field";

export function PageSettingsPanel({
  slug,
  publicUrl,
  isLive,
  settings,
  onSlugChange,
  onSettingsChange,
}: {
  slug: string;
  publicUrl: string;
  isLive: boolean;
  settings: PageSettings;
  onSlugChange: (value: string) => void;
  onSettingsChange: (patch: Partial<Omit<PageSettings, "tokens">>) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    if (!isLive) {
      return;
    }

    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-3 text-sm leading-6 text-muted-foreground">
        These settings are saved in the page schema and used by the public page.
      </div>
      <Field label="Slug">
        <Input value={slug} onChange={(event) => onSlugChange(event.target.value)} />
      </Field>
      <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
          Public URL
        </p>
        <p className="mt-1 truncate font-mono text-xs">{publicUrl}</p>
        <p className="mt-2 text-xs">
          {isLive ? "This URL is live." : "Add at least one block and save to make this URL live."}
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" onClick={copyUrl} disabled={!isLive}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
          {isLive ? (
            <Button asChild size="sm" variant="ghost">
              <a href={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={14} />
                Open
              </a>
            </Button>
          ) : (
            <Button size="sm" variant="ghost" disabled>
              <ExternalLink size={14} />
              Open
            </Button>
          )}
        </div>
      </div>
      <Field label="Meta title">
        <Input
          value={settings.metaTitle}
          onChange={(event) => onSettingsChange({ metaTitle: event.target.value })}
        />
      </Field>
      <Field label="Meta description">
        <Textarea
          value={settings.metaDescription}
          onChange={(event) => onSettingsChange({ metaDescription: event.target.value })}
        />
      </Field>
    </div>
  );
}
