import { Select } from "@/components/ui/Select";
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
import { Field, Panel } from "./fields/Field";

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
      <Panel title="Presets" description="Apply a complete page-wide token set.">
        <div className="grid gap-2">
          {(Object.keys(tokenPresets) as PageTheme[]).map((preset) => (
            <button
              key={preset}
              type="button"
              className="group grid gap-2 rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary/50 hover:bg-muted/50 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
              onClick={() => onChange(tokenPresets[preset])}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{presetLabels[preset]}</span>
                <span className="flex overflow-hidden rounded-full border border-border">
                  <span
                    className="size-4"
                    style={{ backgroundColor: tokenPresets[preset].primaryColor }}
                  />
                  <span
                    className="size-4"
                    style={{ backgroundColor: tokenPresets[preset].backgroundColor }}
                  />
                  <span
                    className="size-4"
                    style={{ backgroundColor: tokenPresets[preset].textColor }}
                  />
                </span>
              </span>
              <span className="h-1.5 rounded-full bg-muted transition group-hover:bg-primary/20">
                <span
                  className="block h-full w-1/2 rounded-full"
                  style={{ backgroundColor: tokenPresets[preset].primaryColor }}
                />
              </span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Colors">
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
      </Panel>
      <Panel title="Typography">
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
      </Panel>
      <Panel title="Shape and spacing">
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
      </Panel>
    </div>
  );
}
