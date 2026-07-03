import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { CarouselBlock, PageBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";
import { ImageUrlField } from "../fields/ImageUrlField";

export function CarouselEditor({
  block,
  onChange,
}: {
  block: CarouselBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Carousel">
      <Field label="Heading">
        <Input
          value={block.props.heading}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, heading: event.target.value } })
          }
        />
      </Field>
      <Field label="Autoplay">
        <Select
          value={block.props.autoplay ? "yes" : "no"}
          onChange={(event) =>
            onChange({
              ...block,
              props: { ...block.props, autoplay: event.target.value === "yes" },
            })
          }
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>
      <ArrayItemEditor
        label="Slide"
        items={block.props.items}
        createItem={() => ({ src: "", alt: "Slide image", caption: "" })}
        onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
        renderItem={(item, update) => (
          <>
            <ImageUrlField value={item.src} onChange={(src) => update({ src })} />
            <Field label="Alt text">
              <Input value={item.alt} onChange={(event) => update({ alt: event.target.value })} />
            </Field>
            <Field label="Caption">
              <Input
                value={item.caption}
                onChange={(event) => update({ caption: event.target.value })}
              />
            </Field>
          </>
        )}
      />
    </Panel>
  );
}
