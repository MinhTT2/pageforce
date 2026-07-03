import { Input } from "@/components/ui/Input";
import type { FooterBlock, PageBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";

export function FooterEditor({
  block,
  onChange,
}: {
  block: FooterBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <Panel title="Footer">
      <Field label="Brand text">
        <Input
          value={block.props.brandText}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, brandText: event.target.value } })
          }
        />
      </Field>
      <Field label="Copyright">
        <Input
          value={block.props.copyright}
          onChange={(event) =>
            onChange({ ...block, props: { ...block.props, copyright: event.target.value } })
          }
        />
      </Field>
      <ArrayItemEditor
        label="Link"
        items={block.props.links}
        createItem={() => ({ label: "New link", url: "#" })}
        onChange={(links) => onChange({ ...block, props: { ...block.props, links } })}
        renderItem={(item, update) => (
          <>
            <Field label="Label">
              <Input value={item.label} onChange={(event) => update({ label: event.target.value })} />
            </Field>
            <Field label="URL">
              <Input value={item.url} onChange={(event) => update({ url: event.target.value })} />
            </Field>
          </>
        )}
      />
    </Panel>
  );
}
