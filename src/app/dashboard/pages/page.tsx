import Link from "next/link";
import { CreatePageButton } from "@/components/dashboard/CreatePageButton";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PagesPage() {
  const user = await requireUser();
  const pages = await prisma.page.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
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
          <h1 className="text-3xl font-semibold text-zinc-950">Pages</h1>
          <CreatePageButton />
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {pages.length === 0 ? (
            <p className="p-6 text-sm text-zinc-500">No pages yet.</p>
          ) : (
            <div className="divide-y divide-zinc-200">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-5">
                  <div>
                    <h2 className="font-medium text-zinc-950">{page.title}</h2>
                    <p className="mt-1 text-sm text-zinc-500">
                      /p/{page.slug} · {page.status.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/p/${page.slug}`}
                      className="inline-flex h-9 items-center rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Public
                    </Link>
                    <Link
                      href={`/builder/${page.id}`}
                      className="inline-flex h-9 items-center rounded-md bg-zinc-950 px-3 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                      Edit
                    </Link>
                    <DeletePageButton pageId={page.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
