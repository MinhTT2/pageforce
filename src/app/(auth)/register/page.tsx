import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </main>
  );
}
