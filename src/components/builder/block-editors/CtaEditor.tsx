import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { CtaBlock, PageBlock } from "@/types/blocks";
import { Field, Panel } from "../fields/Field";

export function CtaEditor({
  block,
  onChange,
}: {
  block: CtaBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="CTA">
      <Field label="Headline">
        <Input
          value={block.props.headline}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, headline: event.target.value } })
          }
        />
      </Field>
      <Field label="Supporting text">
        <Textarea
          value={block.props.supportingText}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, supportingText: event.target.value } })
          }
        />
      </Field>
      <Field label="Primary label">
        <Input
          value={block.props.primaryLabel}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, primaryLabel: event.target.value } })
          }
        />
      </Field>
      <Field label="Primary URL">
        <Input
          value={block.props.primaryUrl}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, primaryUrl: event.target.value } })
          }
        />
      </Field>
      <Field label="Secondary label">
        <Input
          value={block.props.secondaryLabel}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, secondaryLabel: event.target.value } })
          }
        />
      </Field>
      <Field label="Secondary URL">
        <Input
          value={block.props.secondaryUrl}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, secondaryUrl: event.target.value } })
          }
        />
      </Field>
    </Panel>
  );
}
