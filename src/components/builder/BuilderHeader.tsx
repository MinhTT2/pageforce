import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, Eye, Pencil, Redo2, Save, Undo2 } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import type { SaveStatus } from "@/lib/builder-state";
import { cn } from "@/lib/utils";

export const BuilderHeader = memo(function BuilderHeader({
  title,
  dirty,
  saveStatus,
  notice,
  previewMode,
  publicUrl,
  onTitleChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTogglePreview,
  onSave,
}: {
  title: string;
  dirty: boolean;
  saveStatus: SaveStatus;
  notice: string | null;
  previewMode: boolean;
  publicUrl: string;
  onTitleChange: (value: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const saving = saveStatus === "saving";
  const statusLabel = saving ? "Saving..." : saveStatus === "error" ? "Save failed" : dirty ? "Unsaved" : "Saved";
  const isLive = !dirty && saveStatus !== "error";

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft />
            Dashboard
          </Link>
        </Button>
        <div className="min-w-64 max-w-md flex-1">
          <Input
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            className="h-9 font-medium"
            aria-label="Page title"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {notice ? (
          <span
            className={cn(
              "max-w-xs truncate text-sm",
              saveStatus === "error" ? "text-destructive" : "text-warning",
            )}
          >
            {notice}
          </span>
        ) : null}
        <span
          className={cn(
            "rounded-md border px-2.5 py-1 text-sm",
            saveStatus === "error"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : dirty
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-border bg-surface text-muted-foreground",
          )}
        >
          {statusLabel}
        </span>
        <span
          className={cn(
            "rounded-md border px-2.5 py-1 text-sm",
            isLive
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border bg-surface text-muted-foreground",
          )}
        >
          {isLive ? "Live" : "Not live yet"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo (Ctrl+Shift+Z or Ctrl+Y)"
        >
          <Redo2 size={16} />
        </Button>
        <Button
          variant="secondary"
          onClick={onTogglePreview}
          aria-pressed={previewMode}
          aria-label={previewMode ? "Back to editing" : "Preview as visitor"}
        >
          {previewMode ? <Pencil size={16} /> : <Eye size={16} />}
          {previewMode ? "Edit" : "Preview"}
        </Button>
        <Button variant="secondary" onClick={copyUrl} aria-label="Copy public URL">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy URL"}
        </Button>
        <Button asChild variant="secondary" aria-label="Open public page">
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={16} />
            Open
          </a>
        </Button>
        <Button onClick={onSave} disabled={saving || !dirty}>
          <Save size={16} />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </header>
  );
});
