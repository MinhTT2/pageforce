import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { HeroBlock, PageBlock } from "@/types/blocks";
import { Field, Panel } from "../fields/Field";

export function HeroEditor({
  block,
  onChange,
}: {
  block: HeroBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Content">
      <Field label="Heading">
        <Input
          value={block.props.heading}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, heading: event.target.value } })
          }
        />
      </Field>
      <Field label="Subheading">
        <Textarea
          value={block.props.subheading}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, subheading: event.target.value } })
          }
        />
      </Field>
      <Field label="Button text">
        <Input
          value={block.props.buttonText}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, buttonText: event.target.value } })
          }
        />
      </Field>
      <Field label="Button URL">
        <Input
          value={block.props.buttonUrl}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, buttonUrl: event.target.value } })
          }
        />
      </Field>
    </Panel>
  );
}
