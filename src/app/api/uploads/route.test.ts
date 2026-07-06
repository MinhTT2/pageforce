import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  pageFindFirst: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  storageFrom: vi.fn(),
  storageUpload: vi.fn(),
  storageGetPublicUrl: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    page: {
      findFirst: mocks.pageFindFirst,
    },
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createSupabaseServerClient,
}));

const currentUser = vi.mocked(getCurrentUser);
const pageFindFirst = vi.mocked(prisma.page.findFirst);

beforeEach(() => {
  vi.restoreAllMocks();
  mocks.getCurrentUser.mockReset();
  mocks.pageFindFirst.mockReset();
  mocks.createSupabaseServerClient.mockReset();
  mocks.storageFrom.mockReset();
  mocks.storageUpload.mockReset();
  mocks.storageGetPublicUrl.mockReset();

  mocks.storageFrom.mockReturnValue({
    upload: mocks.storageUpload,
    getPublicUrl: mocks.storageGetPublicUrl,
  });
  mocks.createSupabaseServerClient.mockResolvedValue({
    storage: {
      from: mocks.storageFrom,
    },
  });
  mocks.storageUpload.mockResolvedValue({ error: null });
  mocks.storageGetPublicUrl.mockReturnValue({
    data: { publicUrl: "https://pageforce.test/storage/hero.png" },
  });
});

function uploadRequest({ file = new File(["image"], "hero.png", { type: "image/png" }) } = {}) {
  const formData = new FormData();
  formData.append("pageId", "page-1");
  formData.append("file", file);

  return {
    formData: async () => formData,
  } as Request;
}

describe("POST /api/uploads", () => {
  it("rejects unauthenticated uploads", async () => {
    currentUser.mockResolvedValue(null);

    const response = await POST(uploadRequest());

    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(response.status).toBe(401);
  });

  it("rejects uploads for pages the user does not own", async () => {
    currentUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    pageFindFirst.mockResolvedValue(null);

    const response = await POST(uploadRequest());

    await expect(response.json()).resolves.toEqual({ error: "Page not found" });
    expect(response.status).toBe(404);
    expect(pageFindFirst).toHaveBeenCalledWith({
      where: { id: "page-1", userId: "user-1" },
      select: { id: true },
    });
  });

  it("uploads valid images to the page assets bucket", async () => {
    currentUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    pageFindFirst.mockResolvedValue({ id: "page-1" });

    const response = await POST(uploadRequest());

    await expect(response.json()).resolves.toEqual({
      url: "https://pageforce.test/storage/hero.png",
      path: expect.stringMatching(/^users\/user-1\/pages\/page-1\/.+\.png$/),
    });
    expect(response.status).toBe(201);
    expect(mocks.storageFrom).toHaveBeenCalledWith("page-assets");
    expect(mocks.storageUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^users\/user-1\/pages\/page-1\/.+\.png$/),
      expect.any(File),
      {
        cacheControl: "31536000",
        contentType: "image/png",
        upsert: false,
      },
    );
  });

  it("returns a configuration error when the page assets bucket is missing", async () => {
    currentUser.mockResolvedValue({ id: "user-1" } as Awaited<ReturnType<typeof getCurrentUser>>);
    pageFindFirst.mockResolvedValue({ id: "page-1" });
    mocks.storageUpload.mockResolvedValue({
      error: {
        message: "Bucket not found",
        statusCode: "404",
      },
    });

    const response = await POST(uploadRequest());

    await expect(response.json()).resolves.toEqual({
      error:
        'Storage bucket "page-assets" is missing. Create it as a public bucket in Supabase Storage before uploading images.',
    });
    expect(response.status).toBe(503);
    expect(mocks.storageGetPublicUrl).not.toHaveBeenCalled();
  });
});
