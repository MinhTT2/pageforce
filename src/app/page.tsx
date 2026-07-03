import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { BlocksShowcase } from "@/components/marketing/BlocksShowcase";
import { CtaBand } from "@/components/marketing/CtaBand";
import { FeatureRows } from "@/components/marketing/FeatureRows";
import { Hero } from "@/components/marketing/Hero";
import { StatsBand } from "@/components/marketing/StatsBand";
import { Testimonials } from "@/components/marketing/Testimonials";
import { getCurrentUser } from "@/lib/auth";
import { getSafeNextPath } from "@/lib/auth-routes";

type HomeProps = {
  searchParams: Promise<{
    code?: string;
    error?: string;
    error_description?: string;
    next?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (params.code || params.error || params.error_description) {
    if (user) {
      redirect(getSafeNextPath(params.next));
    }

    const callbackParams = new URLSearchParams();

    if (params.code) {
      callbackParams.set("code", params.code);
    }

    if (params.error) {
      callbackParams.set("error", params.error);
    }

    if (params.error_description) {
      callbackParams.set("error_description", params.error_description);
    }

    callbackParams.set("next", params.next || "/dashboard");
    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatsBand />
        <FeatureRows />
        <BlocksShowcase />
        <Testimonials />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  );
}
