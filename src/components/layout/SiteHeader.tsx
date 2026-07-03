import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { headers } from "next/headers";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { getAuthIntentPath } from "@/lib/auth-routes";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const [user, headerStore] = await Promise.all([getCurrentUser(), headers()]);
  const authIntentPath = getAuthIntentPath(headerStore.get("x-pageforce-current-path"));
  const loginHref = `/login?next=${encodeURIComponent(authIntentPath)}`;
  const registerHref = `/register?next=${encodeURIComponent(authIntentPath)}`;

  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <BrandLogo tagline="Landing builder" />

        {user ? (
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
              <Link href={loginHref}>
                <LogIn />
                Log in
              </Link>
            </Button>
            <Button asChild>
              <Link href={registerHref}>
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
