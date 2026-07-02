import Link from "next/link";
import { CreatePageButton } from "@/components/dashboard/CreatePageButton";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const page = await prisma.page.findUnique({
    where: { userId: user.id },
  });

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
            <p className="mt-2 text-zinc-500">Create and publish your landing page from blocks.</p>
          </div>
          {page ? (
            <Link
              href={`/builder/${page.id}`}
              className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Open builder
            </Link>
          ) : (
            <CreatePageButton />
          )}
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {page ? (
            <div className="flex items-center justify-between p-5">
              <div>
                <h2 className="font-medium text-zinc-950">Your landing page</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  /p/{page.slug} · {page.status.toLowerCase()}
                </p>
              </div>
              <Link
                href="/dashboard/pages"
                className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Manage
              </Link>
            </div>
          ) : (
            <p className="p-6 text-sm text-zinc-500">Create your first landing page to start.</p>
          )}
        </div>
      </section>
    </main>
  );
}
