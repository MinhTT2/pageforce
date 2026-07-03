import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { PageBlock, TestimonialsBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";

export function TestimonialsEditor({
  block,
  onChange,
}: {
  block: TestimonialsBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Testimonials">
      <Field label="Heading">
        <Input
          value={block.props.heading}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, heading: event.target.value } })
          }
        />
      </Field>
      <ArrayItemEditor
        label="Testimonial"
        items={block.props.items}
        createItem={() => ({
          quote: "Add a customer quote.",
          author: "Customer name",
          role: "Role, Company",
        })}
        onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
        renderItem={(item, update) => (
          <>
            <Field label="Quote">
              <Textarea value={item.quote} onChange={(event) => update({ quote: event.target.value })} />
            </Field>
            <Field label="Author">
              <Input value={item.author} onChange={(event) => update({ author: event.target.value })} />
            </Field>
            <Field label="Role/company">
              <Input value={item.role} onChange={(event) => update({ role: event.target.value })} />
            </Field>
          </>
        )}
      />
    </Panel>
  );
}
