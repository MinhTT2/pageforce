import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Mini Web Builder SaaS
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-zinc-950">
            Pageforce
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
            Build and publish landing pages from simple JSON-backed blocks.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Open dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-md border border-zinc-200 px-5 text-sm font-medium text-zinc-950 hover:bg-zinc-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
