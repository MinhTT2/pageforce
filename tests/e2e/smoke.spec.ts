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

test("unsafe auth next paths fall back to the dashboard", async ({ page }) => {
  await page.goto("/login?next=https%3A%2F%2Fevil.example");

  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});
