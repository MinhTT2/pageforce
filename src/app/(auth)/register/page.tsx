import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
