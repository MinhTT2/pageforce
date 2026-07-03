"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Image as ImageIcon, LayoutDashboard, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { getSafeNextPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const [error, setError] = useState(searchParams.get("error") || "");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email")).trim();
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword") || "");
    const supabase = createClient();
    const origin = window.location.origin;

    if (mode === "register" && password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match.");
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
            },
          });

    setLoading(false);

    if (result.error) {
      setError(getAuthErrorMessage(result.error.message, mode));
      return;
    }

    if (mode === "register" && !result.data.session) {
      setNotice("Check your email to confirm your account, then continue from the email link.");
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function loginWithGoogle() {
    setGoogleLoading(true);
    setError("");
    setNotice("");

    const origin = window.location.origin;
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (oauthError) {
      setError(getAuthErrorMessage(oauthError.message, mode));
      setGoogleLoading(false);
    }
  }

  const isLogin = mode === "login";
  const authLinkHref = isLogin
    ? `/register?next=${encodeURIComponent(nextPath)}`
    : `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-5 rounded-lg border border-border bg-card p-6 shadow-md shadow-primary/5"
    >
      <div>
        <h1 className="text-2xl font-semibold text-card-foreground">
          {isLogin ? "Log in to Pageforce" : "Create your Pageforce account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isLogin ? "Continue building your pages." : "Start with a clean web builder workspace."}
        </p>
      </div>
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading || googleLoading}
          onClick={loginWithGoogle}
        >
          <GoogleIcon />
          {googleLoading ? "Opening Google..." : "Continue with Google"}
        </Button>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-card-foreground">Email</span>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={googleLoading}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-card-foreground">Password</span>
          <Input
            name="password"
            type="password"
            placeholder="Minimum 6 characters"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={6}
            disabled={googleLoading}
          />
        </label>
        {!isLogin ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-card-foreground">Confirm password</span>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
              minLength={6}
              disabled={googleLoading}
            />
          </label>
        ) : null}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {notice ? <p className="text-sm text-success">{notice}</p> : null}
      <Button type="submit" className="w-full" disabled={loading || googleLoading}>
        {loading ? "Please wait..." : isLogin ? "Log in" : "Register"}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isLogin ? "No account yet?" : "Already have an account?"}{" "}
        <Link
          href={authLinkHref}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {isLogin ? "Register" : "Log in"}
        </Link>
      </p>
    </form>
  );
}

export function AuthShowcase() {
  return (
    <aside className="hidden min-h-[560px] overflow-hidden rounded-lg border border-border bg-panel shadow-sm lg:block">
      <div className="relative min-h-[560px]">
        <Image
          src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1400&auto=format&fit=crop"
          alt=""
          fill
          unoptimized
          sizes="520px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 to-card/90" />
        <div className="absolute inset-x-5 bottom-5 rounded-lg border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-primary">
                Pageforce preview
              </p>
              <h2 className="mt-1 text-xl font-semibold text-card-foreground">
                Ship a page in minutes
              </h2>
            </div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            <ShowcaseRow icon={LayoutDashboard} label="Manage every page from one dashboard" />
            <ShowcaseRow icon={ImageIcon} label="Use visual blocks and image sections" />
            <ShowcaseRow icon={CheckCircle2} label="Save live and share the public URL" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function ShowcaseRow({
  icon: Icon,
  label,
}: {
  icon: typeof CheckCircle2;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-surface-foreground">
      <Icon className="size-4 text-primary" />
      <span>{label}</span>
    </div>
  );
}

function getAuthErrorMessage(message: string, mode: AuthFormProps["mode"]) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Email or password is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Please confirm your email before logging in.";
  }

  if (normalized.includes("email rate limit exceeded") || normalized.includes("rate limit")) {
    return "Too many confirmation emails were requested. Try logging in, or wait a minute before registering again.";
  }

  if (normalized.includes("user already registered") || normalized.includes("already been registered")) {
    return "This email already has an account. Log in instead.";
  }

  if (normalized.includes("password")) {
    return mode === "register"
      ? "Use a stronger password with at least 6 characters."
      : "Please check your password and try again.";
  }

  return message || "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.76-.07-1.49-.2-2.18H12v4.13h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.32 2.98-7.49Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.52c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.06v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.88a6 6 0 0 1 0-3.76v-2.6H3.06a10 10 0 0 0 0 8.96l3.35-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.47 0 2.8.5 3.84 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.52l3.35 2.6C7.2 7.76 9.4 6 12 6Z"
      />
    </svg>
  );
}
