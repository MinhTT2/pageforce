import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const outputDir = path.join(process.cwd(), "docs", "assets", "screenshots");

const shots = [
  {
    name: "home-desktop.png",
    path: "/",
    viewport: { width: 1440, height: 1100 },
    fullPage: false,
  },
  {
    name: "home-full-desktop.png",
    path: "/",
    viewport: { width: 1440, height: 1100 },
    fullPage: true,
  },
  {
    name: "home-tablet.png",
    path: "/",
    viewport: { width: 834, height: 1112 },
    fullPage: false,
  },
  {
    name: "home-mobile.png",
    path: "/",
    viewport: { width: 390, height: 844 },
    fullPage: false,
  },
  {
    name: "home-mobile-full.png",
    path: "/",
    viewport: { width: 390, height: 844 },
    fullPage: true,
  },
  {
    name: "login-desktop.png",
    path: "/login",
    viewport: { width: 1440, height: 1000 },
    fullPage: false,
  },
  {
    name: "login-mobile.png",
    path: "/login",
    viewport: { width: 390, height: 844 },
    fullPage: false,
  },
  {
    name: "register-desktop.png",
    path: "/register",
    viewport: { width: 1440, height: 1000 },
    fullPage: false,
  },
  {
    name: "register-mobile.png",
    path: "/register",
    viewport: { width: 390, height: 844 },
    fullPage: false,
  },
  {
    name: "design-system-desktop.png",
    path: "/design-system",
    viewport: { width: 1440, height: 1100 },
    fullPage: false,
  },
  {
    name: "design-system-full-desktop.png",
    path: "/design-system",
    viewport: { width: 1440, height: 1100 },
    fullPage: true,
  },
  {
    name: "design-system-tablet.png",
    path: "/design-system",
    viewport: { width: 834, height: 1112 },
    fullPage: false,
  },
  {
    name: "design-system-mobile.png",
    path: "/design-system",
    viewport: { width: 390, height: 844 },
    fullPage: false,
  },
  {
    name: "not-found-desktop.png",
    path: "/missing-demo-route",
    viewport: { width: 1440, height: 900 },
    fullPage: false,
  },
];

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  colorScheme: "light",
  deviceScaleFactor: 1,
});

try {
  for (const shot of shots) {
    const page = await context.newPage();
    await page.setViewportSize(shot.viewport);

    const url = new URL(shot.path, baseURL).toString();
    console.log(`Capturing ${shot.name} from ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
    await page.addStyleTag({
      content: `
        [aria-label="Open Next.js Dev Tools"],
        nextjs-portal {
          display: none !important;
        }
      `,
    });
    await page.waitForTimeout(800);

    const title = await page.title();
    const bodyText = await page.locator("body").innerText({ timeout: 5_000 }).catch(() => "");

    if (
      shot.path !== "/missing-demo-route" &&
      (/error|not found|unauthorized/i.test(title) || /^404\b/i.test(bodyText.trim()))
    ) {
      throw new Error(`Refusing to capture ${shot.name}; page looks unhealthy: ${title}`);
    }

    await page.screenshot({
      path: path.join(outputDir, shot.name),
      fullPage: shot.fullPage,
      scale: "css",
    });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(`Screenshots written to ${path.relative(process.cwd(), outputDir)}`);
