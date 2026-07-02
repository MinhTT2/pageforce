import Link from "next/link";
import { CreatePageButton } from "@/components/dashboard/CreatePageButton";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="text-lg font-semibold text-zinc-950">
            Pageforce
          </Link>
          <LogoutButton />
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-950">Dashboard</h1>
            <p className="mt-2 text-zinc-500">Create and publish landing pages from blocks.</p>
          </div>
          <CreatePageButton />
        </div>
        <div className="mt-8">
          <Link
            href="/dashboard/pages"
            className="inline-flex h-10 items-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50"
          >
            View pages
          </Link>
        </div>
      </section>
    </main>
  );
}
