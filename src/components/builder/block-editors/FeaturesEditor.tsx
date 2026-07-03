import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { FeaturesBlock, PageBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";

export function FeaturesEditor({
  block,
  onChange,
}: {
  block: FeaturesBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Features">
      <Field label="Eyebrow">
        <Input
          value={block.props.eyebrow}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, eyebrow: event.target.value } })
          }
        />
      </Field>
      <Field label="Heading">
        <Input
          value={block.props.heading}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, heading: event.target.value } })
          }
        />
      </Field>
      <Field label="Description">
        <Textarea
          value={block.props.description}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, description: event.target.value } })
          }
        />
      </Field>
      <ArrayItemEditor
        label="Feature"
        items={block.props.items}
        createItem={() => ({
          title: "New feature",
          description: "Describe the benefit.",
          icon: "Sparkles",
        })}
        onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
        renderItem={(item, update) => (
          <>
            <Field label="Title">
              <Input value={item.title} onChange={(event) => update({ title: event.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea
                value={item.description}
                onChange={(event) => update({ description: event.target.value })}
              />
            </Field>
            <Field label="Icon">
              <Select value={item.icon} onChange={(event) => update({ icon: event.target.value })}>
                <option value="Sparkles">Sparkles</option>
                <option value="Zap">Zap</option>
                <option value="BadgeCheck">BadgeCheck</option>
                <option value="Globe">Globe</option>
                <option value="MessageCircle">MessageCircle</option>
                <option value="Star">Star</option>
              </Select>
            </Field>
          </>
        )}
      />
    </Panel>
  );
}
