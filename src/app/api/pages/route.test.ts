import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/lib/auth";
import { emptyPageSchema } from "@/lib/blocks";
import { createPageForUser, toPageSummary } from "@/lib/pages";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  createPageForUser: vi.fn(),
  toPageSummary: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/pages", () => ({
  MAX_PAGE_BODY_BYTES: 512 * 1024,
  createPageForUser: mocks.createPageForUser,
  listPagesForUser: vi.fn(),
  toPageSummary: mocks.toPageSummary,
}));

const currentUser = vi.mocked(getCurrentUser);
const createPage = vi.mocked(createPageForUser);
const summarizePage = vi.mocked(toPageSummary);

beforeEach(() => {
  vi.restoreAllMocks();
  mocks.getCurrentUser.mockReset();
  mocks.createPageForUser.mockReset();
  mocks.toPageSummary.mockReset();
});

function postPagesRequest(body: Record<string, unknown>) {
  return new Request("http://pageforce.test/api/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/pages", () => {
  it("creates new pages as blank drafts even when a template is sent", async () => {
    const createdPage = { id: "page-1" };
    const summary = {
      id: "page-1",
      siteId: "site-1",
      siteName: "Demo Site",
      siteSlug: "demo",
      title: "Pricing",
      slug: "pricing",
      publicPath: "/s/demo/pricing",
      isHome: false,
      headerMode: "INHERIT",
      footerMode: "INHERIT",
      status: "DRAFT",
      publishedAt: null,
      updatedAt: "2026-07-06T00:00:00.000Z",
    };

    currentUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    createPage.mockResolvedValue(createdPage as Awaited<ReturnType<typeof createPageForUser>>);
    summarizePage.mockReturnValue(summary);

    const response = await POST(
      postPagesRequest({
        title: "Pricing",
        siteId: "site-1",
        template: "product-launch",
      }),
    );

    await expect(response.json()).resolves.toEqual(summary);
    expect(response.status).toBe(201);
    expect(createPage).toHaveBeenCalledWith("user-1", "Pricing", emptyPageSchema, "site-1");
  });
});
