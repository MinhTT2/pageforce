import Link from "next/link";
import { CreatePageButton } from "@/components/dashboard/CreatePageButton";
import { DeletePageButton } from "@/components/dashboard/DeletePageButton";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PagesPage() {
  const user = await requireUser("/dashboard/pages");
  const page = await prisma.page.findUnique({
    where: { userId: user.id },
  });

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-semibold text-foreground">Landing page</h1>
          {!page ? <CreatePageButton /> : null}
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
          {!page ? (
            <p className="p-6 text-sm text-muted-foreground">No landing page yet.</p>
          ) : (
            <div className="divide-y divide-border">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-medium text-card-foreground">{page.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    /p/{page.slug} · {page.status.toLowerCase()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/p/${page.slug}`}>Public</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/builder/${page.id}`}>Edit</Link>
                  </Button>
                  <DeletePageButton pageId={page.id} />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
