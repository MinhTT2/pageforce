import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBlock, emptyPageSchema } from "./blocks";
import {
  createPageForUser,
  createUniqueSlug,
  MAX_SLUG_LENGTH,
  pagePublicationData,
} from "./pages";
import { prisma } from "@/lib/prisma";
import type { PageSchema } from "@/types/blocks";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    page: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const pageFindFirst = vi.mocked(prisma.page.findFirst);
const pageCreate = vi.mocked(prisma.page.create);

function uniqueSlugError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
    meta: { target: ["slug"] },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  pageFindFirst.mockReset();
  pageCreate.mockReset();
});

describe("pagePublicationData", () => {
  it("keeps empty pages as drafts", () => {
    const publication = pagePublicationData(emptyPageSchema);

    expect(publication.status).toBe("DRAFT");
    expect(publication.publishedSchema).toBe(Prisma.DbNull);
    expect(publication.publishedAt).toBeNull();
  });

  it("publishes schemas with at least one block", () => {
    const schema: PageSchema = {
      version: 2,
      blocks: [createBlock("hero")],
      settings: emptyPageSchema.settings,
    };
    const publication = pagePublicationData(schema);

    expect(publication.status).toBe("PUBLISHED");
    expect(publication.publishedSchema).toEqual(schema);
    expect(publication.publishedAt).toBeInstanceOf(Date);
  });
});

describe("createUniqueSlug", () => {
  it("returns the clean base when available", async () => {
    pageFindFirst.mockResolvedValue(null);

    await expect(createUniqueSlug("Launch Page")).resolves.toBe("launch-page");
  });

  it("adds numeric suffixes for existing slugs", async () => {
    pageFindFirst
      .mockResolvedValueOnce({ id: "page-1" })
      .mockResolvedValueOnce({ id: "page-2" })
      .mockResolvedValueOnce(null);

    await expect(createUniqueSlug("launch")).resolves.toBe("launch-3");
  });

  it("does not suffix when the slug belongs to the current page", async () => {
    pageFindFirst.mockResolvedValue(null);

    await expect(createUniqueSlug("launch", "page-1")).resolves.toBe("launch");
    expect(pageFindFirst).toHaveBeenCalledWith({
      where: { slug: "launch", id: { not: "page-1" } },
      select: { id: true },
    });
  });

  it("keeps suffixed slugs within the max length", async () => {
    pageFindFirst.mockResolvedValueOnce({ id: "page-1" }).mockResolvedValueOnce(null);

    const slug = await createUniqueSlug("a".repeat(MAX_SLUG_LENGTH));

    expect(slug).toHaveLength(MAX_SLUG_LENGTH);
    expect(slug.endsWith("-2")).toBe(true);
  });

  it("avoids reserved slugs and falls back for empty inputs", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T08:00:00.000Z"));
    vi.spyOn(Math, "random").mockReturnValue(0.123456);
    pageFindFirst.mockResolvedValue(null);

    await expect(createUniqueSlug("api")).resolves.toBe("api-page");
    await expect(createUniqueSlug("!!!")).resolves.toBe("page-1782979200000-4fzyo8");

    vi.useRealTimers();
  });
});

describe("createPageForUser", () => {
  it("retries with a suffixed slug when Prisma reports a unique conflict", async () => {
    const createdPage = {
      id: "page-1",
      userId: "user-1",
      title: "Launch",
      slug: "launch-2",
      status: "DRAFT" as const,
      draftSchema: emptyPageSchema,
      publishedSchema: null,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    pageFindFirst.mockResolvedValue(null);
    pageCreate.mockRejectedValueOnce(uniqueSlugError()).mockResolvedValueOnce(createdPage);

    await expect(createPageForUser("user-1", "Launch")).resolves.toMatchObject({
      slug: "launch-2",
    });
    expect(pageCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: expect.objectContaining({ slug: "launch" }) }),
    );
    expect(pageCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: expect.objectContaining({ slug: "launch-2" }) }),
    );
  });
});
