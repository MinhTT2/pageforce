import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { BlockAlign, BlockStyle, DesignTokens, PageBlock } from "@/types/blocks";
import { ColorField } from "./fields/ColorField";
import { Field } from "./fields/Field";

const paddingOptions = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "Extra large" },
] as const;

const widthOptions = [
  { value: "narrow", label: "Narrow" },
  { value: "normal", label: "Normal" },
  { value: "wide", label: "Wide" },
  { value: "full", label: "Full width" },
] as const;

export function StyleEditor({
  block,
  tokens,
  onChange,
}: {
  block: PageBlock;
  tokens: DesignTokens;
  onChange: (block: PageBlock) => void;
}) {
  const style = block.style ?? {};

  function patchStyle(patch: Partial<BlockStyle>) {
    const next: BlockStyle = { ...style, ...patch };

    for (const key of Object.keys(next) as Array<keyof BlockStyle>) {
      if (next[key] === undefined) {
        delete next[key];
      }
    }

    onChange({ ...block, style: Object.keys(next).length ? next : undefined });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-3 text-sm leading-6 text-muted-foreground">
        Overrides for this block only. Unset values inherit the page design.
      </div>
      <ColorField
        label="Background"
        value={style.backgroundColor}
        fallback={tokens.backgroundColor}
        onChange={(value) => patchStyle({ backgroundColor: value })}
        allowClear
      />
      <ColorField
        label="Text"
        value={style.textColor}
        fallback={tokens.textColor}
        onChange={(value) => patchStyle({ textColor: value })}
        allowClear
      />
      <ColorField
        label="Accent"
        value={style.accentColor}
        fallback={tokens.primaryColor}
        onChange={(value) => patchStyle({ accentColor: value })}
        allowClear
      />
      <div className="space-y-2">
        <span className="text-sm font-medium text-card-foreground">
          Alignment
          {!style.align ? (
            <span className="ml-2 text-xs font-normal text-muted-foreground">Default</span>
          ) : null}
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          spacing={0}
          value={style.align ?? ""}
          onValueChange={(value) =>
            patchStyle({ align: value ? (value as BlockAlign) : undefined })
          }
        >
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeft size={15} />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenter size={15} />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRight size={15} />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <Field label="Vertical padding">
        <Select
          value={style.paddingY ?? ""}
          onChange={(event) =>
            patchStyle({
              paddingY: event.target.value
                ? (event.target.value as BlockStyle["paddingY"])
                : undefined,
            })
          }
        >
          <option value="">Default</option>
          {paddingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Content width">
        <Select
          value={style.width ?? ""}
          onChange={(event) =>
            patchStyle({
              width: event.target.value ? (event.target.value as BlockStyle["width"]) : undefined,
            })
          }
        >
          <option value="">Default</option>
          {widthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      {block.style ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onChange({ ...block, style: undefined })}
        >
          Reset all to page design
        </Button>
      ) : null}
    </div>
  );
}
