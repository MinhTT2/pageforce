import Link from "next/link";
import { CreateSiteDialog } from "@/components/dashboard/CreateSiteDialog";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const page = await prisma.page.findUnique({
    where: { userId: user.id },
  });

  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Create and publish your landing page from blocks.
            </p>
          </div>
          {page ? (
            <Button asChild size="lg">
              <Link href={`/builder/${page.id}`}>Open builder</Link>
            </Button>
          ) : (
            <CreateSiteDialog defaultOpen />
          )}
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
          {page ? (
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-medium text-card-foreground">Your landing page</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  /p/{page.slug} · {page.status.toLowerCase()}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/pages">Manage</Link>
              </Button>
            </div>
          ) : (
            <p className="p-6 text-sm text-muted-foreground">
              Create your first landing page to start.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
