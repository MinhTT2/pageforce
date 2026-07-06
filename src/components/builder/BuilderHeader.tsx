import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  FileText,
  LayoutGrid,
  Pencil,
  Redo2,
  Save,
  Settings,
  Undo2,
} from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { SaveStatus } from "@/lib/builder-state";
import { cn } from "@/lib/utils";

export const BuilderHeader = memo(function BuilderHeader({
  dirty,
  savingGlobal,
  saveStatus,
  notice,
  publicSiteUrl,
  isLive,
  previewMode,
  blocksOpen,
  pagesOpen,
  pageSettingsOpen,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onShowBlocks,
  onTogglePages,
  onTogglePageSettings,
  onTogglePreview,
  onSave,
}: {
  dirty: boolean;
  savingGlobal?: boolean;
  saveStatus: SaveStatus;
  notice: string | null;
  publicSiteUrl: string;
  isLive: boolean;
  previewMode: boolean;
  blocksOpen: boolean;
  pagesOpen: boolean;
  pageSettingsOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onShowBlocks: () => void;
  onTogglePages: () => void;
  onTogglePageSettings: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
}) {
  const saving = saveStatus === "saving" || savingGlobal;
  const showPublicUrl = isLive;

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label="Dashboard">
          <Link href="/dashboard">
            <ArrowLeft size={18} />
          </Link>
        </Button>
        <Button
          variant={blocksOpen ? "secondary" : "ghost"}
          size="icon"
          onClick={onShowBlocks}
          aria-pressed={blocksOpen}
          aria-label="Blocks"
          className={cn(blocksOpen && "shadow-md")}
        >
          <LayoutGrid size={18} />
        </Button>
        <Button
          variant={pagesOpen ? "secondary" : "ghost"}
          size="icon"
          onClick={onTogglePages}
          aria-pressed={pagesOpen}
          aria-label="Pages"
          className={cn(pagesOpen && "shadow-md")}
        >
          <FileText size={18} />
        </Button>
        <Button
          variant={pageSettingsOpen ? "secondary" : "ghost"}
          size="icon"
          onClick={onTogglePageSettings}
          aria-pressed={pageSettingsOpen}
          aria-label="Page settings"
          className={cn(pageSettingsOpen && "shadow-md")}
        >
          <Settings size={18} />
        </Button>
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
        {showPublicUrl ? (
          <div className="flex max-w-full items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-2 py-1 text-sm text-success">
            <span className="min-w-0 truncate font-medium">Published: {publicSiteUrl}</span>
            <Button asChild variant="ghost" size="icon-sm" aria-label="Open public website">
              <a href={publicSiteUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} />
              </a>
            </Button>
          </div>
        ) : null}
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
        <Button onClick={onSave} disabled={saving || !dirty}>
          <Save size={16} />
          {saving ? "Saving..." : "Save & publish"}
        </Button>
      </div>
    </header>
  );
});
