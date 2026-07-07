import { describe, expect, it } from "vitest";
import { resolveSiteHref } from "./site-hrefs";

describe("resolveSiteHref", () => {
  it("keeps safe anchors, queries, and absolute URLs", () => {
    expect(resolveSiteHref("#contact", "demo")).toBe("#contact");
    expect(resolveSiteHref("?plan=pro", "demo")).toBe("?plan=pro");
    expect(resolveSiteHref("https://example.com/demo", "demo")).toBe("https://example.com/demo");
    expect(resolveSiteHref("http://example.com/demo", "demo")).toBe("http://example.com/demo");
    expect(resolveSiteHref("mailto:hello@example.com", "demo")).toBe("mailto:hello@example.com");
  });

  it("scopes site-relative paths without rewriting app routes", () => {
    expect(resolveSiteHref("/", "demo")).toBe("/s/demo");
    expect(resolveSiteHref("/pricing", "demo")).toBe("/s/demo/pricing");
    expect(resolveSiteHref("/dashboard", "demo")).toBe("/dashboard");
  });

  it("falls back for unsafe schemes and protocol-relative URLs", () => {
    expect(resolveSiteHref("javascript:alert(1)", "demo")).toBe("#");
    expect(resolveSiteHref("data:text/html,<script>alert(1)</script>", "demo")).toBe("#");
    expect(resolveSiteHref("//evil.example/path", "demo")).toBe("#");
  });

  it("keeps only safe unscoped hrefs when no site slug is available", () => {
    expect(resolveSiteHref("/pricing")).toBe("/pricing");
    expect(resolveSiteHref("pricing")).toBe("#");
    expect(resolveSiteHref("javascript:alert(1)")).toBe("#");
  });
});
