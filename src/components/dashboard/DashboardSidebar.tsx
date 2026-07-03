import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { getCurrentUser } from "@/lib/auth";
import { getUserInitial, getUserLabel } from "@/lib/user-label";

export async function DashboardSidebar() {
  const user = await getCurrentUser();
  const userLabel = user ? getUserLabel(user) : "Account";
  const userInitial = getUserInitial(userLabel);

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-panel md:flex">
      <div className="border-b border-border px-4 py-4">
        <BrandLogo size="sm" href="/dashboard" tagline="Workspace" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <DashboardNav />
      </div>

      <div className="grid gap-2 border-t border-border p-3">
        <div className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5">
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground"
            aria-hidden="true"
          >
            {userInitial}
          </span>
          <span className="min-w-0 truncate text-sm font-medium text-panel-foreground">
            {userLabel}
          </span>
        </div>
        <LogoutButton variant="ghost" size="sm" className="w-full justify-start" />
      </div>
    </aside>
  );
}
