import { blockGroups, blockOptions } from "@/components/builder/block-meta";
import { blockLabels } from "@/lib/blocks";

export function BlocksShowcase() {
  const blockTypes = blockGroups.flatMap((group) => group.blocks);

  return (
    <section className="border-y border-border/70 bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Every section you need</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            11 blocks, one coherent page
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Mix structure, conversion, and trust sections. Design tokens keep colors, fonts, and
            spacing consistent across all of them.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {blockTypes.map((type) => {
            const option = blockOptions[type];

            return (
              <div
                key={type}
                className="rounded-lg border border-border bg-card p-4 shadow-xs transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <option.icon className="size-4.5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-card-foreground">
                  {blockLabels[type]}
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {option.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
