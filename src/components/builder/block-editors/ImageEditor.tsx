import { Input } from "@/components/ui/Input";
import type { ImageBlock, PageBlock } from "@/types/blocks";
import { Field, Panel } from "../fields/Field";

export function ImageEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Image">
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
    </Panel>
  );
}
