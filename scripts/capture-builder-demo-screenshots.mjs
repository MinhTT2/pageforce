import { mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createChunks } from "@supabase/ssr/dist/main/utils/chunker.js";
import { stringToBase64URL } from "@supabase/ssr/dist/main/utils/base64url.js";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile?.(".env");
process.loadEnvFile?.(".env.local");

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = path.join(process.cwd(), "docs", "assets", "screenshots");

const demoEmail = process.env.DEMO_SUPABASE_EMAIL;
const demoPassword = process.env.DEMO_SUPABASE_PASSWORD;
const siteId = process.env.DEMO_SITE_ID;
const siteSlug = process.env.DEMO_SITE_SLUG;
const homePageId = process.env.DEMO_HOME_PAGE_ID;

const required = {
  PAGEFORCE_ENV: process.env.PAGEFORCE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  DEMO_SUPABASE_EMAIL: demoEmail,
  DEMO_SUPABASE_PASSWORD: demoPassword,
  DEMO_SITE_ID: siteId,
  DEMO_SITE_SLUG: siteSlug,
  DEMO_HOME_PAGE_ID: homePageId,
};

const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

if (process.env.PAGEFORCE_ENV !== "development") {
  throw new Error("Refusing to capture authenticated demo screenshots outside development.");
}

async function addStableStyles(page) {
  await page
    .addStyleTag({
      content: `
        [aria-label="Open Next.js Dev Tools"],
        nextjs-portal {
          display: none !important;
        }

        * {
          caret-color: transparent !important;
        }
      `,
    })
    .catch(() => {});
}

async function settle(page) {
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await addStableStyles(page);
  await page.waitForTimeout(700);
}

async function buildSupabaseCookies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const { data, error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Could not create Supabase demo session.");
  }

  const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const encodedValue = `base64-${stringToBase64URL(JSON.stringify(data.session))}`;

  return createChunks(cookieName, encodedValue).map(({ name, value }) => ({
    name,
    value,
    url: baseURL,
    sameSite: "Lax",
    httpOnly: false,
  }));
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: "light",
  deviceScaleFactor: 1,
});

try {
  await context.addCookies(await buildSupabaseCookies());
  const page = await context.newPage();

  async function capture(name) {
    await page.screenshot({
      path: path.join(outputDir, name),
      fullPage: false,
      scale: "css",
    });
  }

  await page.goto(new URL("/dashboard", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  await capture("dashboard-sites-demo.png");

  await page.goto(new URL(`/builder/site/${siteId}?page=${homePageId}`, baseURL).toString(), {
    waitUntil: "domcontentloaded",
  });
  await settle(page);
  await capture("builder-overview.png");

  await page.getByText("Turn launch traffic into qualified pipeline").first().click();
  await page.waitForTimeout(500);
  await capture("builder-hero-inspector.png");

  await page.getByRole("tab", { name: "Style", exact: true }).click();
  await page.waitForTimeout(500);
  await capture("builder-style-inspector.png");

  await page.getByRole("button", { name: "Pages", exact: true }).first().click();
  await page.waitForTimeout(700);
  await capture("builder-pages-navigator.png");

  await page.getByRole("button", { name: "Page settings", exact: true }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole("tab", { name: /Design/ }).click();
  await page.waitForTimeout(500);
  await capture("builder-design-tokens.png");

  await page.getByRole("button", { name: "Preview as visitor", exact: true }).click();
  await page.waitForTimeout(700);
  await capture("builder-preview-mode.png");

  await page.goto(new URL(`/s/${siteSlug}`, baseURL).toString(), {
    waitUntil: "domcontentloaded",
  });
  await settle(page);
  await capture("public-demo-site.png");
} finally {
  await browser.close();
}

console.log(`Builder screenshots written to ${path.relative(process.cwd(), outputDir)}`);
