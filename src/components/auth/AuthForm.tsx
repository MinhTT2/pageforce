"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, ExternalLink, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { getSafeNextPath } from "@/lib/auth-routes";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm(_props: AuthFormProps) {
  void _props;

  const searchParams = useSearchParams();
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const [error, setError] = useState(searchParams.get("error") || "");
  const [googleLoading, setGoogleLoading] = useState(false);

  async function loginWithGoogle() {
    setGoogleLoading(true);
    setError("");

    const origin = window.location.origin;
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (oauthError) {
      setError(getAuthErrorMessage(oauthError.message));
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full max-w-[560px] flex-col px-6 py-8 sm:px-10 lg:px-12">

      <div className="mt-12 lg:mt-18">
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          Log in or sign up
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Continue with Google to open your dashboard and start building landing pages.
        </p>
      </div>

      <div className="mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={loginWithGoogle}
          disabled={googleLoading}
          className="h-11 w-full rounded-lg"
        >
          <GoogleIcon />
          {googleLoading ? "Opening Google..." : "Continue with Google"}
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}

      <p className="mt-6 text-center text-sm leading-6 text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link href="#" className="font-medium text-primary hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="#" className="font-medium text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <footer className="mt-auto border-t border-border pt-6 text-center text-sm text-muted-foreground">
        <div className="flex flex-wrap justify-center gap-8">
          <span>Copyright (c) 2026 Pageforce</span>
          <Link href="#" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function AuthShowcase() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden border-r border-border bg-[linear-gradient(180deg,var(--surface)_0%,var(--background)_100%)] lg:flex lg:flex-col">
      <div className="p-8 xl:px-12 xl:pt-10 xl:pb-6">
        <BrandLogo size="md" />
      </div>

      <div className="flex flex-1 items-center px-8 pb-8 xl:px-12">
        <div className="w-full max-w-2xl">
          <BuilderMockup />

          <div className="mt-6 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">
              Start building today
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Build landing pages, edit content, and open public URLs from one workspace.
            </p>
            <div className="mt-4 grid gap-2.5 text-sm font-medium text-foreground">
              <Benefit>Manage multiple landing pages from your dashboard</Benefit>
              <Benefit>Edit hero, CTA, pricing, FAQ, and lead form blocks</Benefit>
              <Benefit>Save live and share public URLs instantly</Benefit>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function BuilderMockup() {
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl shadow-primary/5">
      <div className="grid gap-3 rounded-md border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Public page canvas
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">SaaS launch page</p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-muted-foreground">
            <ExternalLink className="size-3.5" />
            /s/nova
          </div>
        </div>

        <div className="rounded-md bg-[linear-gradient(180deg,var(--surface)_0%,var(--card)_100%)] px-5 py-6 text-center">
          <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <div className="mx-auto h-4 w-56 rounded-full bg-foreground/90" />
          <div className="mx-auto mt-3 h-3 w-72 max-w-full rounded-full bg-muted" />
          <div className="mx-auto mt-5 h-9 w-28 rounded-lg bg-primary" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {["Features", "Pricing", "Leads"].map((label) => (
            <div key={label} className="rounded-md border border-border bg-card p-3">
              <div className="h-8 w-8 rounded-md bg-accent" />
              <div className="mt-4 h-3 w-20 rounded-full bg-foreground/80" />
              <div className="mt-2 h-2 w-full rounded-full bg-muted" />
              <p className="sr-only">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Benefit({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <Check className="size-4 shrink-0 stroke-[3] text-success" />
      <span>{children}</span>
    </div>
  );
}

function getAuthErrorMessage(message: string) {
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
    return "Please check your Google account and try again.";
  }

  return message || "Something went wrong. Please try again.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
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
