import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PageBlock, PricingBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";

function lines(value: string) {
  const parsed = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length ? parsed : [""];
}

export function PricingEditor({
  block,
  onChange,
}: {
  block: PricingBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <div className="grid gap-3">
      <Panel title="Content" description="Set the promise before visitors compare plans.">
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
      </Panel>
      <Panel title="Plans" description="Move the recommended plan near the top and mark it highlighted.">
        <ArrayItemEditor
          label="Plan"
          items={block.props.plans}
          createItem={() => ({
            name: "New plan",
            price: "$29",
            billingText: "per month",
            features: ["One landing page", "Live public URL"],
            ctaLabel: "Choose plan",
            ctaUrl: "#",
            highlighted: false,
          })}
          onChange={(plans) => onChange({ ...block, props: { ...block.props, plans } })}
          renderItem={(plan, update) => (
            <>
              <Field label="Name">
                <Input
                  value={plan.name}
                  onChange={(event) => update({ name: event.target.value })}
                />
              </Field>
              <Field label="Price">
                <Input
                  value={plan.price}
                  onChange={(event) => update({ price: event.target.value })}
                />
              </Field>
              <Field label="Billing text">
                <Input
                  value={plan.billingText}
                  onChange={(event) => update({ billingText: event.target.value })}
                />
              </Field>
              <Field label="Features, one per line">
                <Textarea
                  value={plan.features.join("\n")}
                  onChange={(event) => update({ features: lines(event.target.value) })}
                />
              </Field>
              <Field label="CTA label">
                <Input
                  value={plan.ctaLabel}
                  onChange={(event) => update({ ctaLabel: event.target.value })}
                />
              </Field>
              <Field label="CTA URL" description="Use # for placeholders or paste checkout links.">
                <Input
                  value={plan.ctaUrl}
                  onChange={(event) => update({ ctaUrl: event.target.value })}
                />
              </Field>
              <Field label="Highlighted">
                <Select
                  value={plan.highlighted ? "yes" : "no"}
                  onChange={(event) => update({ highlighted: event.target.value === "yes" })}
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Select>
              </Field>
            </>
          )}
        />
      </Panel>
    </div>
  );
}
