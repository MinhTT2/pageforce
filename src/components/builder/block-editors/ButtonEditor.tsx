import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { ButtonBlock, PageBlock } from "@/types/blocks";
import { Field, Panel } from "../fields/Field";

export function ButtonEditor({
  block,
  onChange,
}: {
  block: ButtonBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Button">
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
    </Panel>
  );
}
