import { Checkbox } from "radix-ui";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import type { HeaderBlock, PageBlock } from "@/types/blocks";
import { cn } from "@/lib/utils";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";

export function HeaderEditor({
  block,
  onChange,
}: {
  block: HeaderBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Header">
      <Field label="Brand text">
        <Input
          value={block.props.brandText}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, brandText: event.target.value } })
          }
        />
      </Field>
      <ArrayItemEditor
        label="Navigation link"
        items={block.props.links}
        createItem={() => ({ label: "New link", url: "#" })}
        onChange={(links) => onChange({ ...block, props: { ...block.props, links } })}
        renderItem={(item, update) => (
          <>
            <Field label="Label">
              <Input value={item.label} onChange={(event) => update({ label: event.target.value })} />
            </Field>
            <Field label="URL">
              <Input value={item.url} onChange={(event) => update({ url: event.target.value })} />
            </Field>
          </>
        )}
      />
      <Field label="CTA label">
        <Input
          value={block.props.ctaLabel}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, ctaLabel: event.target.value } })
          }
        />
      </Field>
      <Field label="CTA URL">
        <Input
          value={block.props.ctaUrl}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, ctaUrl: event.target.value } })
          }
        />
      </Field>
      <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-surface-foreground">
        <Checkbox.Root
          checked={block.props.sticky}
          onCheckedChange={(checked) =>
            onChange({ ...block, props: { ...block.props, sticky: checked === true } })
          }
          className="flex size-4 items-center justify-center rounded border border-border bg-background data-[state=checked]:border-primary data-[state=checked]:bg-primary"
        >
          <Checkbox.Indicator>
            <Check className={cn("size-3 text-primary-foreground")} />
          </Checkbox.Indicator>
        </Checkbox.Root>
        Sticky header
      </label>
    </Panel>
  );
}
