import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/button";
import { tokenPresets } from "@/lib/blocks";
import { FONT_OPTIONS } from "@/lib/design";
import type {
  DesignTokens,
  FontKey,
  PageTheme,
  RadiusKey,
  SpacingKey,
} from "@/types/blocks";
import { ColorField } from "./fields/ColorField";
import { Field } from "./fields/Field";

const presetLabels: Record<PageTheme, string> = {
  clean: "Clean",
  bold: "Bold",
  warm: "Warm",
};

const fontKeys = Object.keys(FONT_OPTIONS) as FontKey[];

export function DesignPanel({
  tokens,
  onChange,
}: {
  tokens: DesignTokens;
  onChange: (patch: Partial<DesignTokens>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-3 text-sm leading-6 text-muted-foreground">
        Page-wide design tokens. Every block inherits these unless it sets its own style.
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-card-foreground">Start from a preset</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(tokenPresets) as PageTheme[]).map((preset) => (
            <Button
              key={preset}
              variant="secondary"
              size="sm"
              onClick={() => onChange(tokenPresets[preset])}
            >
              <span
                className="size-3 rounded-full border border-border"
                style={{ backgroundColor: tokenPresets[preset].primaryColor }}
              />
              {presetLabels[preset]}
            </Button>
          ))}
        </div>
      </div>
      <ColorField
        label="Brand color"
        value={tokens.primaryColor}
        fallback={tokens.primaryColor}
        onChange={(value) => value && onChange({ primaryColor: value })}
      />
      <ColorField
        label="Background"
        value={tokens.backgroundColor}
        fallback={tokens.backgroundColor}
        onChange={(value) => value && onChange({ backgroundColor: value })}
      />
      <ColorField
        label="Text"
        value={tokens.textColor}
        fallback={tokens.textColor}
        onChange={(value) => value && onChange({ textColor: value })}
      />
      <Field label="Heading font">
        <Select
          value={tokens.headingFont}
          onChange={(event) => onChange({ headingFont: event.target.value as FontKey })}
        >
          {fontKeys.map((key) => (
            <option key={key} value={key}>
              {FONT_OPTIONS[key].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Body font">
        <Select
          value={tokens.bodyFont}
          onChange={(event) => onChange({ bodyFont: event.target.value as FontKey })}
        >
          {fontKeys.map((key) => (
            <option key={key} value={key}>
              {FONT_OPTIONS[key].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Corner radius">
        <Select
          value={tokens.radius}
          onChange={(event) => onChange({ radius: event.target.value as RadiusKey })}
        >
          <option value="none">Square</option>
          <option value="sm">Subtle</option>
          <option value="md">Rounded</option>
          <option value="lg">Soft</option>
          <option value="full">Pill</option>
        </Select>
      </Field>
      <Field label="Section spacing">
        <Select
          value={tokens.spacing}
          onChange={(event) => onChange({ spacing: event.target.value as SpacingKey })}
        >
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="relaxed">Relaxed</option>
        </Select>
      </Field>
    </div>
  );
}
