import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { LeadFormBlock, PageBlock } from "@/types/blocks";
import { Field, Panel } from "../fields/Field";

export function LeadFormEditor({
  block,
  onChange,
}: {
  block: LeadFormBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Lead form">
      <Field label="Headline">
        <Input
          value={block.props.headline}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, headline: event.target.value } })
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
      <Field label="Submit label">
        <Input
          value={block.props.submitLabel}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, submitLabel: event.target.value } })
          }
        />
      </Field>
      <Field label="Delivery mode">
        <Select
          value={block.props.deliveryMode}
          onChange={(event) =>
            onChange({
              ...block,
              props: {
                ...block.props,
                deliveryMode: event.target.value as "mailto" | "actionUrl",
              },
            })
          }
        >
          <option value="mailto">Mailto</option>
          <option value="actionUrl">Action URL</option>
        </Select>
      </Field>
      <Field label="Mailto email">
        <Input
          value={block.props.mailto}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, mailto: event.target.value } })
          }
        />
      </Field>
      <Field label="Action URL">
        <Input
          value={block.props.actionUrl}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, actionUrl: event.target.value } })
          }
        />
      </Field>
    </Panel>
  );
}
