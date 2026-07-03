import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PageBlock, TextBlock } from "@/types/blocks";
import { Field, Panel } from "../fields/Field";

export function TextEditor({
  block,
  onChange,
}: {
  block: TextBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Content">
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
    </Panel>
  );
}
