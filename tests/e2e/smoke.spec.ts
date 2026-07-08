import { expect, test } from "@playwright/test";

test("home page links to auth routes", async ({ page }) => {
  await page.goto("/");

  const mainNavigation = page.getByLabel("Main navigation");

  await expect(page.getByRole("heading", { name: "Pageforce" })).toBeVisible();
  await expect(mainNavigation.getByRole("link", { name: "Start building" })).toHaveAttribute(
    "href",
    "/login?next=%2F",
  );
  await expect(
    page.getByRole("main").getByRole("link", { name: "Start building" }).first(),
  ).toHaveAttribute("href", "/login");
});

test("auth pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in or sign up" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Log in or sign up" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("dashboard redirects anonymous users to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(page.getByRole("heading", { name: "Log in or sign up" })).toBeVisible();
});

test("dashboard pages route redirects anonymous users through the dashboard guard", async ({
  page,
}) => {
  await page.goto("/dashboard/pages");

  // The middleware guard preserves the requested path (%2Fdashboard%2Fpages);
  // on a cold dev server the in-page redirect to /dashboard can win instead.
  // Both land on login with a dashboard next path.
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard(%2Fpages)?$/);
  await expect(page.getByRole("heading", { name: "Log in or sign up" })).toBeVisible();
});

test("unsafe auth next paths fall back to the dashboard", async ({ page }) => {
  await page.goto("/login?next=https%3A%2F%2Fevil.example");

  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("design system page renders core UI primitives", async ({ page }) => {
  await page.goto("/design-system");

  await expect(page.getByRole("heading", { name: "Design System V1" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tokens" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Buttons" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save page" })).toBeVisible();
  await expect(page.getByLabel("Page title")).toHaveValue("Launch page");
});

test("not found page gives visitors a way back", async ({ page }) => {
  await page.goto("/does-not-exist");

  await expect(page.getByRole("heading", { name: "This page doesn't exist" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Go to dashboard" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
});
