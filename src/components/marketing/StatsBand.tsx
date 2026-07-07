import { ChartNoAxesColumnIncreasing, LayoutTemplate, Send } from "lucide-react";

const pillars = [
  {
    icon: LayoutTemplate,
    title: "Create a site",
    description:
      "Start with a site, then add the pages your business needs without splitting work across tools.",
  },
  {
    icon: Send,
    title: "Add focused pages",
    description:
      "Build home, service, pricing, launch, and contact pages from reusable blocks and shared design tokens.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Publish and improve",
    description:
      "Save changes live, share clean public URLs, and keep refining the site as your offers evolve.",
  },
];

export function StatsBand() {
  return (
    <section className="border-b border-border/70 bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-14 lg:grid-cols-3 lg:py-16">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="border-t border-border pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <pillar.icon className="size-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-foreground">{pillar.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{pillar.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
