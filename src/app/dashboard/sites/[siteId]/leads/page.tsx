import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { listLeadsForSite, toLeadSummary } from "@/lib/leads";
import { prisma } from "@/lib/prisma";

type SiteLeadsProps = {
  params: Promise<{ siteId: string }>;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function SiteLeadsPage({ params }: SiteLeadsProps) {
  const { siteId } = await params;
  const user = await requireUser(`/dashboard/sites/${siteId}/leads`);

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: user.id },
    select: { id: true, name: true, slug: true },
  });

  if (!site) {
    notFound();
  }

  const leads = (await listLeadsForSite(site.id)).map(toLeadSummary);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-8 sm:py-10">
        <div>
          <Button asChild size="sm" variant="ghost" className="-ml-2">
            <Link href="/dashboard">
              <ArrowLeft />
              Dashboard
            </Link>
          </Button>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground">
            Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submissions from lead forms on{" "}
            <span className="font-medium text-foreground">{site.name}</span>.
          </p>
        </div>

        <Panel className="overflow-hidden rounded-lg">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold text-panel-foreground">Submissions</h2>
            <Badge variant="secondary">{leads.length}</Badge>
          </div>

          {leads.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-4 sm:px-5">Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="whitespace-nowrap px-4 text-muted-foreground sm:px-5">
                        {dateFormatter.format(new Date(lead.createdAt))}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {lead.data.name || "-"}
                      </TableCell>
                      <TableCell>
                        {lead.data.email ? (
                          <a
                            href={`mailto:${lead.data.email}`}
                            className="text-primary hover:underline"
                          >
                            {lead.data.email}
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <span className="line-clamp-3 whitespace-pre-line text-muted-foreground">
                          {lead.data.message || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid min-h-60 place-items-center px-6 py-10 text-center">
              <div className="max-w-sm">
                <div className="mx-auto flex size-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Inbox className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-panel-foreground">
                  No submissions yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Add a Lead Form block with built-in capture, then share your public site at{" "}
                  <span className="font-medium text-foreground">/s/{site.slug}</span>.
                </p>
              </div>
            </div>
          )}
        </Panel>
      </section>
    </main>
  );
}
