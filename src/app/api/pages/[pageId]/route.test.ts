import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PATCH } from "./route";
import { getCurrentUser } from "@/lib/auth";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  revalidatePath: vi.fn(),
  pageFindFirst: vi.fn(),
  pageDelete: vi.fn(),
  pageUpdate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    page: {
      findFirst: mocks.pageFindFirst,
      delete: mocks.pageDelete,
      update: mocks.pageUpdate,
    },
    $transaction: mocks.transaction,
  },
}));

const currentUser = vi.mocked(getCurrentUser);

beforeEach(() => {
  vi.restoreAllMocks();
  mocks.getCurrentUser.mockReset();
  mocks.revalidatePath.mockReset();
  mocks.pageFindFirst.mockReset();
  mocks.pageDelete.mockReset();
  mocks.pageUpdate.mockReset();
  mocks.transaction.mockReset();
  mocks.transaction.mockImplementation(async (callback) =>
    callback({
      page: {
        delete: mocks.pageDelete,
        findFirst: mocks.pageFindFirst,
        update: mocks.pageUpdate,
      },
    }),
  );
});

function params(pageId = "page-home") {
  return { params: Promise.resolve({ pageId }) };
}

describe("PATCH /api/pages/[pageId]", () => {
  it("returns the updated page from the transaction without a re-fetch", async () => {
    currentUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    const updatedAt = new Date("2026-07-01T00:00:00.000Z");
    mocks.pageFindFirst.mockResolvedValueOnce({
      id: "page-home",
      siteId: "site-1",
      slug: "home",
      isHome: true,
      updatedAt,
      site: { slug: "demo" },
    });
    mocks.pageUpdate.mockResolvedValueOnce({
      id: "page-home",
      siteId: "site-1",
      title: "New title",
      slug: "home",
      isHome: true,
      headerMode: "INHERIT",
      footerMode: "INHERIT",
      status: "DRAFT",
      updatedAt,
      schema: null,
      site: {
        id: "site-1",
        name: "Demo",
        slug: "demo",
        globalHeader: null,
        globalFooter: null,
        updatedAt,
        pages: [],
      },
    });

    const response = await PATCH(
      new Request("http://pageforce.test/api/pages/page-home", {
        method: "PATCH",
        body: JSON.stringify({ title: "New title" }),
      }),
      params(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      id: "page-home",
      title: "New title",
    });
    // Ownership check is the only findFirst; the transaction's update returns
    // the full editable shape.
    expect(mocks.pageFindFirst).toHaveBeenCalledTimes(1);
    expect(mocks.pageUpdate).toHaveBeenCalledTimes(1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/s/demo");
  });
});

describe("DELETE /api/pages/[pageId]", () => {
  it("promotes another page when deleting the current homepage", async () => {
    currentUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    mocks.pageFindFirst
      .mockResolvedValueOnce({
        id: "page-home",
        siteId: "site-1",
        slug: "home",
        isHome: true,
        site: { slug: "demo" },
      })
      .mockResolvedValueOnce({ id: "page-pricing" });

    const response = await DELETE(new Request("http://pageforce.test/api/pages/page-home"), params());

    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(response.status).toBe(200);
    expect(mocks.pageDelete).toHaveBeenCalledWith({ where: { id: "page-home" } });
    expect(mocks.pageFindFirst).toHaveBeenNthCalledWith(2, {
      where: { siteId: "site-1" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });
    expect(mocks.pageUpdate).toHaveBeenCalledWith({
      where: { id: "page-pricing" },
      data: { isHome: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/s/demo");
  });
});
