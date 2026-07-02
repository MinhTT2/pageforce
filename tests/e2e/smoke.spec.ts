import { expect, test } from "@playwright/test";

test("home page links to the dashboard", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Pageforce" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open dashboard" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
});

test("auth pages render", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in to Pageforce" })).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create your Pageforce account" })).toBeVisible();
});

test("dashboard redirects anonymous users to login", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Log in to Pageforce" })).toBeVisible();
});
