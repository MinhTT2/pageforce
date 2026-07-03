const stats = [
  { value: "11", label: "Visual block types, from hero to lead form" },
  { value: "0", label: "Publish steps — saves go live instantly" },
  { value: "1", label: "Clean public URL for every page" },
  { value: "4", label: "Ready-made templates to start from" },
];

export function StatsBand() {
  return (
    <section className="border-b border-border/70 bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-6 py-10 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-4xl font-semibold text-primary">{stat.value}</p>
            <p className="mt-2 max-w-52 text-sm leading-6 text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
