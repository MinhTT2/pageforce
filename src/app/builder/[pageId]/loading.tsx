export default function LoadingBuilderPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas text-canvas-foreground">
      <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-surface" />
          <div className="size-8 rounded-lg bg-surface" />
          <div className="size-8 rounded-lg bg-surface" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded-lg bg-surface" />
          <div className="h-8 w-20 rounded-lg bg-surface" />
        </div>
      </div>
      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)_340px]">
        <aside className="hidden border-r border-border bg-card p-5 lg:block">
          <div className="h-8 w-32 rounded-lg bg-surface" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-12 rounded-lg bg-surface" />
            ))}
          </div>
        </aside>
        <section className="overflow-hidden bg-[radial-gradient(circle_at_top,var(--surface)_0%,var(--canvas)_55%)] p-6">
          <div className="mx-auto h-full max-w-5xl rounded-lg border border-border bg-white shadow-lg shadow-primary/5">
            <div className="h-40 border-b border-border bg-surface" />
            <div className="space-y-4 p-8">
              <div className="h-8 w-2/3 rounded-lg bg-surface" />
              <div className="h-4 w-full rounded-lg bg-surface" />
              <div className="h-4 w-4/5 rounded-lg bg-surface" />
            </div>
          </div>
        </section>
        <aside className="hidden border-l border-border bg-card p-4 lg:block">
          <div className="h-6 w-24 rounded-lg bg-surface" />
          <div className="mt-5 grid gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 rounded-lg bg-surface" />
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
