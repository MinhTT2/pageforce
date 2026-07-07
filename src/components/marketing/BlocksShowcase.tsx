import { blockGroups, blockOptions } from "@/components/builder/block-meta";
import { blockLabels } from "@/lib/blocks";

const templateCards = [
  { title: "Startup site", detail: "Home, product, pricing, FAQ, and contact pages" },
  { title: "Service site", detail: "Services, proof, process, booking, and lead capture" },
  { title: "Creator site", detail: "Portfolio, products, testimonials, and contact flow" },
];

export function BlocksShowcase() {
  const blockTypes = blockGroups.flatMap((group) => group.blocks);

  return (
    <section className="border-y border-border/70 bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Start with flexible templates</p>
            <h2 className="mt-2 max-w-xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Build a complete website from reusable page sections
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:justify-self-end">
            Whether you are presenting a company, selling a service, or launching a product,
            Pageforce gives you the pieces to assemble a useful multipage site without starting
            blank.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {templateCards.map((template) => (
            <div
              key={template.title}
              className="pf-preview-card overflow-hidden rounded-lg border border-border bg-card shadow-xs"
            >
              <div className="grid gap-2 border-b border-border bg-surface p-4">
                <div className="h-2 w-20 rounded-full bg-primary/25" />
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-4/5 rounded-full bg-muted" />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-card-foreground">{template.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium text-primary">Built-in page blocks</p>
          <h3 className="mt-2 text-2xl font-semibold text-foreground">
            13 blocks, one coherent page system
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Mix structure, conversion, trust, and utility sections. Design tokens keep colors,
            fonts, and spacing consistent across all of them.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {blockTypes.map((type) => {
            const option = blockOptions[type];

            return (
              <div
                key={type}
                className="pf-preview-card rounded-lg border border-border bg-card p-4 shadow-xs transition hover:border-primary/30 hover:shadow-sm"
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
