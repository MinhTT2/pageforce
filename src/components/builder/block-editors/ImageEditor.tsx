import { Input } from "@/components/ui/Input";
import type { ImageBlock, PageBlock } from "@/types/blocks";
import { ImageUrlField } from "../fields/ImageUrlField";
import { Field, Panel } from "../fields/Field";

export function ImageEditor({
  block,
  pageId,
  onChange,
}: {
  block: ImageBlock;
  pageId: string;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Image">
      <ImageUrlField
        pageId={pageId}
        value={block.props.src}
        onChange={(src) => onChange({ ...block, props: { ...block.props, src } })}
      />
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
