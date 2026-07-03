import { describe, expect, it } from "vitest";
import { getAuthIntentPath, getSafeNextPath } from "@/lib/auth-routes";

describe("getSafeNextPath", () => {
  it("keeps relative paths with query strings", () => {
    expect(getSafeNextPath("/builder/page-id?tab=blocks")).toBe("/builder/page-id?tab=blocks");
  });

  it("falls back for unsafe external paths", () => {
    expect(getSafeNextPath("https://evil.example/dashboard")).toBe("/dashboard");
    expect(getSafeNextPath("//evil.example/dashboard")).toBe("/dashboard");
    expect(getSafeNextPath(null)).toBe("/dashboard");
  });
});

describe("getAuthIntentPath", () => {
  it("uses the current non-auth path", () => {
    expect(getAuthIntentPath("/?ref=hero")).toBe("/?ref=hero");
  });

  it("uses the nested next path on auth routes", () => {
    expect(getAuthIntentPath("/login?next=%2Fdashboard%2Fpages")).toBe("/dashboard/pages");
  });

  it("falls back when auth route next is unsafe", () => {
    expect(getAuthIntentPath("/register?next=https%3A%2F%2Fevil.example")).toBe("/dashboard");
  });
});
