import { describe, expect, it, vi } from "vitest";
import { fallbackSlug, slugify } from "./slug";

describe("slug helpers", () => {
  it("normalizes plain text into a URL slug", () => {
    expect(slugify("Launch Faster With Pageforce!")).toBe("launch-faster-with-pageforce");
  });

  it("removes accents and repeated separators", () => {
    expect(slugify("Xin chào --- Pageforce")).toBe("xin-chao-pageforce");
  });

  it("falls back to a timestamped page slug when input has no slug characters", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T08:00:00.000Z"));
    vi.spyOn(Math, "random").mockReturnValue(0.123456);

    expect(fallbackSlug("!!!")).toBe("page-1782979200000-4fzyo8");

    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});
