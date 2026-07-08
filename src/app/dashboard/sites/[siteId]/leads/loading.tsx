export default function LoadingSiteLeadsPage() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:py-10">
        <div>
          <div className="h-8 w-28 rounded-lg bg-surface" />
          <div className="mt-3 h-9 w-32 rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-64 rounded-lg bg-surface" />
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <div className="h-5 w-28 rounded-lg bg-surface" />
            <div className="h-5 w-10 rounded-full bg-surface" />
          </div>
          <div className="grid gap-3 p-4 sm:p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 rounded-lg bg-surface" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
