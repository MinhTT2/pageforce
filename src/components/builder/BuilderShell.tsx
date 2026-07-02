"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp, Eye, Rocket, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { blockLabels, createBlock } from "@/lib/blocks";
import { slugify } from "@/lib/slug";
import type { BlockType, PageBlock, PageSchema } from "@/types/blocks";
import type { EditablePage } from "@/types/page";

type BuilderShellProps = {
  page: EditablePage;
};

const blockTypes: BlockType[] = ["hero", "text", "image", "button"];

export function BuilderShell({ page }: BuilderShellProps) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState(page.status);
  const [schema, setSchema] = useState<PageSchema>(page.draftSchema);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    page.draftSchema.blocks[0]?.id ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBlock = useMemo(
    () => schema.blocks.find((block) => block.id === selectedBlockId) ?? null,
    [schema.blocks, selectedBlockId],
  );

  function addBlock(type: BlockType) {
    const block = createBlock(type);
    setSchema((current) => ({ ...current, blocks: [...current.blocks, block] }));
    setSelectedBlockId(block.id);
  }

  function updateBlock(block: PageBlock) {
    setSchema((current) => ({
      ...current,
      blocks: current.blocks.map((item) => (item.id === block.id ? block : item)),
    }));
  }

  function deleteBlock(id: string) {
    setSchema((current) => {
      const blocks = current.blocks.filter((block) => block.id !== id);
      setSelectedBlockId(blocks[0]?.id ?? null);
      return { ...current, blocks };
    });
  }

  function moveBlock(id: string, direction: -1 | 1) {
    setSchema((current) => {
      const index = current.blocks.findIndex((block) => block.id === id);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.blocks.length) {
        return current;
      }

      const blocks = [...current.blocks];
      const [block] = blocks.splice(index, 1);
      blocks.splice(nextIndex, 0, block);
      return { ...current, blocks };
    });
  }

  function previewPage() {
    if (status !== "PUBLISHED") {
      setMessage("Publish this page before opening the public preview.");
      return;
    }

    window.open(`/p/${slug}`, "_blank");
  }

  async function savePage() {
    setSaving(true);
    setMessage("");

    const { ok, payload } = await saveDraft();

    setSaving(false);
    if (ok && payload?.status) {
      setStatus(payload.status);
    }
    setMessage(ok ? "Saved" : payload?.error ?? "Could not save page");
  }

  async function publishPage() {
    setPublishing(true);
    setMessage("");

    const draft = await saveDraft();

    if (!draft.ok) {
      setPublishing(false);
      setMessage(draft.payload?.error ?? "Could not save page before publishing");
      return;
    }

    const response = await fetch(`/api/pages/${page.id}/publish`, {
      method: "POST",
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; status?: typeof status }
      | null;

    setPublishing(false);
    if (response.ok && payload?.status) {
      setStatus(payload.status);
    }
    setMessage(response.ok ? "Published" : payload?.error ?? "Could not publish page");
  }

  async function saveDraft() {
    const response = await fetch(`/api/pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, slug, draftSchema: schema }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; status?: typeof status }
      | null;

    return { ok: response.ok, payload };
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100">
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-600 hover:text-zinc-950">
            Dashboard
          </Link>
          <div>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-9 w-64 font-medium"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {message ? <span className="text-sm text-zinc-500">{message}</span> : null}
          <Button variant="secondary" onClick={previewPage}>
            <Eye size={16} />
            {status === "PUBLISHED" ? "Public preview" : "Draft"}
          </Button>
          <Button variant="secondary" onClick={publishPage} disabled={publishing}>
            <Rocket size={16} />
            {publishing ? "Publishing..." : "Publish"}
          </Button>
          <Button onClick={savePage} disabled={saving}>
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </header>
      <main className="grid flex-1 grid-cols-[260px_minmax(0,1fr)_320px] overflow-hidden">
        <aside className="border-r border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-950">Blocks</h2>
          <div className="mt-3 grid gap-2">
            {blockTypes.map((type) => (
              <Button key={type} variant="secondary" onClick={() => addBlock(type)}>
                Add {blockLabels[type]}
              </Button>
            ))}
          </div>
          <div className="mt-8 space-y-3">
            <label className="text-sm font-medium text-zinc-700">Slug</label>
            <Input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} />
            <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
              Status: {status.toLowerCase()}
            </div>
          </div>
        </aside>
        <section className="overflow-auto p-6">
          <div className="mx-auto max-w-5xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
            <BlockRenderer
              schema={schema}
              editable
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />
          </div>
        </section>
        <aside className="overflow-auto border-l border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-zinc-950">Properties</h2>
          {selectedBlock ? (
            <div className="mt-4 space-y-4">
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => moveBlock(selectedBlock.id, -1)}>
                  <ArrowUp size={16} />
                </Button>
                <Button variant="secondary" onClick={() => moveBlock(selectedBlock.id, 1)}>
                  <ArrowDown size={16} />
                </Button>
                <Button variant="destructive" onClick={() => deleteBlock(selectedBlock.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
              <BlockEditor block={selectedBlock} onChange={updateBlock} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Select a block to edit its content.</p>
          )}
        </aside>
      </main>
    </div>
  );
}

function BlockEditor({
  block,
  onChange,
}: {
  block: PageBlock;
  onChange: (block: PageBlock) => void;
}) {
  if (block.type === "hero") {
    return (
      <>
        <Field label="Heading">
          <Input
            value={block.props.heading}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, heading: event.target.value } })
            }
          />
        </Field>
        <Field label="Subheading">
          <Textarea
            value={block.props.subheading}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, subheading: event.target.value } })
            }
          />
        </Field>
        <Field label="Button text">
          <Input
            value={block.props.buttonText}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, buttonText: event.target.value } })
            }
          />
        </Field>
        <Field label="Button URL">
          <Input
            value={block.props.buttonUrl}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, buttonUrl: event.target.value } })
            }
          />
        </Field>
      </>
    );
  }

  if (block.type === "text") {
    return (
      <>
        <Field label="Content">
          <Textarea
            value={block.props.content}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, content: event.target.value } })
            }
          />
        </Field>
        <Field label="Alignment">
          <Select
            value={block.props.align}
            onChange={(event) =>
              onChange({
                ...block,
                props: { ...block.props, align: event.target.value as "left" | "center" | "right" },
              })
            }
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
        </Field>
      </>
    );
  }

  if (block.type === "image") {
    return (
      <>
        <Field label="Image URL">
          <Input
            value={block.props.src}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, src: event.target.value } })
            }
          />
        </Field>
        <Field label="Alt text">
          <Input
            value={block.props.alt}
            onChange={(event) =>
              onChange({ ...block, props: { ...block.props, alt: event.target.value } })
            }
          />
        </Field>
      </>
    );
  }

  return (
    <>
      <Field label="Label">
        <Input
          value={block.props.label}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, label: event.target.value } })
          }
        />
      </Field>
      <Field label="URL">
        <Input
          value={block.props.url}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, url: event.target.value } })
          }
        />
      </Field>
      <Field label="Variant">
        <Select
          value={block.props.variant}
          onChange={(event) =>
            onChange({
              ...block,
              props: { ...block.props, variant: event.target.value as "primary" | "secondary" },
            })
          }
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
        </Select>
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}
