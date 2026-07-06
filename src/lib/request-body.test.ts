import { describe, expect, it } from "vitest";
import { readJsonBody } from "./request-body";

describe("readJsonBody", () => {
  it("parses valid JSON bodies", async () => {
    const request = new Request("http://pageforce.test/api/pages", {
      method: "POST",
      body: JSON.stringify({ title: "Launch" }),
    });

    await expect(readJsonBody(request, 1024)).resolves.toEqual({
      ok: true,
      value: { title: "Launch" },
    });
  });

  it("rejects oversized bodies", async () => {
    const request = new Request("http://pageforce.test/api/pages", {
      method: "POST",
      body: JSON.stringify({ title: "x".repeat(32) }),
    });

    await expect(readJsonBody(request, 16)).resolves.toEqual({
      ok: false,
      status: 413,
      error: "Payload too large",
    });
  });
});
