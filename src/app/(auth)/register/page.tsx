import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm, AuthShowcase } from "@/components/auth/AuthForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSafeNextPath } from "@/lib/auth-routes";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect(getSafeNextPath(params.next));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-[linear-gradient(180deg,var(--background)_0%,var(--surface)_100%)] px-6 py-10">
        <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(420px,1.12fr)]">
          <div className="flex justify-center lg:justify-end">
            <Suspense>
              <AuthForm mode="register" />
            </Suspense>
          </div>
          <AuthShowcase />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
