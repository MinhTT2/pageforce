export default function LoadingDashboardPage() {
  return (
    <main>
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="h-8 w-40 rounded-lg bg-surface" />
            <div className="mt-2 h-4 w-72 rounded-lg bg-surface" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-60 rounded-lg bg-surface" />
            <div className="h-10 w-28 rounded-lg bg-surface" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="aspect-[16/9] border-b border-border bg-surface" />
              <div className="grid gap-3 p-4">
                <div className="h-5 w-2/3 rounded-lg bg-surface" />
                <div className="h-4 w-full rounded-lg bg-surface" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 rounded-lg bg-surface" />
                  <div className="h-9 rounded-lg bg-surface" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
