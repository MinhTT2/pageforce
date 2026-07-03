import Link from "next/link";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
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
  const userLabel = user ? getUserLabel(user) : "";
  const userInitial = getUserInitial(userLabel);

  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <BrandLogo tagline="Landing builder" />

        {user ? (
          <nav
            className="flex flex-wrap items-center justify-end gap-2"
            aria-label="Main navigation"
          >
            <Button asChild variant="ghost">
              <Link href="/dashboard">
                <LayoutDashboard />
                Dashboard
              </Link>
            </Button>
            <div className="flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5 sm:max-w-64">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-xs font-semibold text-foreground"
                aria-hidden="true"
              >
                {userInitial}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {userLabel}
              </span>
            </div>
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

type HeaderUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

function getUserLabel(user: HeaderUser) {
  const fullName = getMetadataString(user.user_metadata.full_name);
  const name = getMetadataString(user.user_metadata.name);

  return fullName || name || user.email || "Account";
}

function getMetadataString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getUserInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "U";
}
