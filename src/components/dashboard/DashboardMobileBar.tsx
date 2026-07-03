import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";

export function DashboardMobileBar() {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:hidden">
      <BrandLogo size="sm" href="/dashboard" />
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">Pages</Link>
        </Button>
        <LogoutButton variant="ghost" size="sm" />
      </div>
    </div>
  );
}
