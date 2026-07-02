import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";

type SiteHeaderProps = {
  authenticated?: boolean;
};

export function SiteHeader({ authenticated = false }: SiteHeaderProps) {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <BrandLogo tagline="Landing builder" />

        {authenticated ? (
          <nav
            className="flex flex-wrap items-center justify-end gap-2"
            aria-label="Main navigation"
          >
            <LogoutButton />
          </nav>
        ) : (
          <nav
            className="flex flex-wrap items-center justify-end gap-2"
            aria-label="Main navigation"
          >
            <Button asChild variant="ghost">
              <Link href="/login">
                <LogIn />
                Log in
              </Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                <UserPlus />
                Register
              </Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
