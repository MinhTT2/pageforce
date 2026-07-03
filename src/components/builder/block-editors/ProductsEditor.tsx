import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { PageBlock, ProductsBlock } from "@/types/blocks";
import { ArrayItemEditor } from "../fields/ArrayItemEditor";
import { Field, Panel } from "../fields/Field";
import { ImageUrlField } from "../fields/ImageUrlField";

export function ProductsEditor({
  block,
  onChange,
}: {
  block: ProductsBlock;
  onChange: (block: PageBlock) => void;
}) {
  return (
    <div className="grid gap-3">
      <Panel title="Content" description="Introduce the product grid before the cards.">
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
      </Panel>
      <Panel title="Products" description="Use direct image URLs and purchase links for each card.">
        <ArrayItemEditor
          label="Product"
          items={block.props.items}
          createItem={() => ({
            name: "New product",
            description: "",
            price: "$29",
            originalPrice: "",
            image: "",
            imageAlt: "",
            badge: "",
            ctaLabel: "Buy now",
            ctaUrl: "#",
          })}
          onChange={(items) => onChange({ ...block, props: { ...block.props, items } })}
          renderItem={(item, update) => (
            <>
              <Field label="Name">
                <Input
                  value={item.name}
                  onChange={(event) => update({ name: event.target.value })}
                />
              </Field>
              <Field label="Price">
                <Input
                  value={item.price}
                  onChange={(event) => update({ price: event.target.value })}
                />
              </Field>
              <Field label="Original price">
                <Input
                  value={item.originalPrice}
                  onChange={(event) => update({ originalPrice: event.target.value })}
                />
              </Field>
              <Field label="Badge">
                <Input
                  value={item.badge}
                  onChange={(event) => update({ badge: event.target.value })}
                />
              </Field>
              <ImageUrlField value={item.image} onChange={(image) => update({ image })} />
              <Field label="Image alt" description="Describe the image for accessibility.">
                <Input
                  value={item.imageAlt}
                  onChange={(event) => update({ imageAlt: event.target.value })}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={item.description}
                  onChange={(event) => update({ description: event.target.value })}
                />
              </Field>
              <Field label="CTA label">
                <Input
                  value={item.ctaLabel}
                  onChange={(event) => update({ ctaLabel: event.target.value })}
                />
              </Field>
              <Field label="CTA URL" description="Use # for placeholders or paste purchase links.">
                <Input
                  value={item.ctaUrl}
                  onChange={(event) => update({ ctaUrl: event.target.value })}
                />
              </Field>
            </>
          )}
        />
      </Panel>
    </div>
  );
}
