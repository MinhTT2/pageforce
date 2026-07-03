import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm, AuthShowcase } from "@/components/auth/AuthForm";
import { getSafeNextPath } from "@/lib/auth-routes";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect(getSafeNextPath(params.next));
  }

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(560px,1fr)]">
      <AuthShowcase />
      <section className="flex min-h-screen items-start justify-center bg-white lg:items-stretch">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </section>
    </main>
  );
}
