import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { FaqBlock, PageBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";

export function FaqEditor({
  block,
  onChange,
}: {
  block: FaqBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="FAQ" description="Answer objections that would otherwise stop the click.">
      <Field label="Heading">
        <Input
          value={block.props.heading}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, heading: event.target.value } })
          }
        />
      </Field>
      <ArrayItemEditor
        label="Question"
        items={block.props.items}
        createItem={() => ({ question: "New question?", answer: "Add a clear answer." })}
        onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
        renderItem={(item, update) => (
          <>
            <Field label="Question">
              <Input
                value={item.question}
                onChange={(event) => update({ question: event.target.value })}
              />
            </Field>
            <Field label="Answer">
              <Textarea
                value={item.answer}
                onChange={(event) => update({ answer: event.target.value })}
              />
            </Field>
          </>
        )}
      />
    </Panel>
  );
}
