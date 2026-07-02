"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const supabase = createClient();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push(searchParams.get("next") || "/dashboard");
    router.refresh();
  }

  const isLogin = mode === "login";

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">
          {isLogin ? "Log in to Pageforce" : "Create your Pageforce account"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {isLogin ? "Continue building your pages." : "Start with a clean web builder workspace."}
        </p>
      </div>
      <div className="space-y-3">
        <Input name="email" type="email" placeholder="Email" required />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Please wait..." : isLogin ? "Log in" : "Register"}
      </Button>
      <p className="text-sm text-zinc-500">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-medium text-zinc-950 underline-offset-4 hover:underline"
        >
          {isLogin ? "Register" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
