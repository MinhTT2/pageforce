import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "./route";
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
