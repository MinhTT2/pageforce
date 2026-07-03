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
    <div className="grid gap-3">
      <Panel title="Content" description="Tell visitors what they get after submitting.">
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
      </Panel>
      <Panel title="Delivery" description="Built-in capture stores submissions in the dashboard.">
        <Field label="Delivery mode">
          <Select
            value={block.props.deliveryMode}
            onChange={(event) =>
              onChange({
                ...block,
                props: {
                  ...block.props,
                  deliveryMode: event.target.value as "capture" | "mailto" | "actionUrl",
                },
              })
            }
          >
            <option value="capture">Built-in lead capture</option>
            <option value="mailto">Mailto</option>
            <option value="actionUrl">Action URL</option>
          </Select>
        </Field>
        {block.props.deliveryMode === "capture" ? (
          <p className="text-xs leading-5 text-muted-foreground">
            Submissions appear in your dashboard under Leads after the page is saved and opened publicly.
          </p>
        ) : null}
        {block.props.deliveryMode === "mailto" ? (
          <Field label="Mailto email" description="Visitors will open their email app to send the form.">
            <Input
              value={block.props.mailto}
              onChange={(event) =>
                onChange({ ...block, props: { ...block.props, mailto: event.target.value } })
              }
            />
          </Field>
        ) : null}
        {block.props.deliveryMode === "actionUrl" ? (
          <Field label="Action URL" description="Posts the browser form to your external endpoint.">
            <Input
              value={block.props.actionUrl}
              onChange={(event) =>
                onChange({ ...block, props: { ...block.props, actionUrl: event.target.value } })
              }
            />
          </Field>
        ) : null}
      </Panel>
    </div>
  );
}
