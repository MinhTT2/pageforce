import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBlock, emptyPageSchema } from "./blocks";
import {
  createPageForUser,
  createSiteFromTemplateForUser,
  createUniqueSlug,
  listDashboardSitesForUser,
  MAX_SLUG_LENGTH,
  pagePublicationData,
  toCreatedSiteSummary,
  toDashboardSite,
  updatePageWithUniqueSlug,
} from "./pages";
import { prisma } from "@/lib/prisma";
import type { PageSchema } from "@/types/blocks";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    site: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    page: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

const siteFindFirst = vi.mocked(prisma.site.findFirst);
const siteCreate = vi.mocked(prisma.site.create);
const siteUpdate = vi.mocked(prisma.site.update);
const pageFindFirst = vi.mocked(prisma.page.findFirst);
const pageCount = vi.mocked(prisma.page.count);
const pageCreate = vi.mocked(prisma.page.create);
const queryRaw = vi.mocked(prisma.$queryRaw);

function uniqueSlugError() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "test",
    meta: { target: ["slug"] },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  siteFindFirst.mockReset();
  siteCreate.mockReset();
  siteUpdate.mockReset();
  pageFindFirst.mockReset();
  pageCount.mockReset();
  pageCreate.mockReset();
});

describe("pagePublicationData", () => {
  it("keeps empty pages as drafts", () => {
    const publication = pagePublicationData(emptyPageSchema);

    expect(publication.status).toBe("DRAFT");
  });

  it("publishes schemas with at least one block", () => {
    const schema: PageSchema = {
      version: 2,
      blocks: [createBlock("hero")],
      settings: emptyPageSchema.settings,
    };
    const publication = pagePublicationData(schema);

    expect(publication.status).toBe("PUBLISHED");
  });
});

describe("listDashboardSitesForUser", () => {
  it("queries sliced home-page schemas per site", async () => {
    queryRaw.mockResolvedValue([]);

    await expect(listDashboardSitesForUser("user-1")).resolves.toEqual([]);

    expect(queryRaw).toHaveBeenCalledTimes(1);
    const sql = (queryRaw.mock.calls[0][0] as unknown as readonly string[]).join("?");
    expect(sql).toContain('pg."isHome" = true');
    expect(sql).toContain("LIMIT 1");
    expect(sql).toContain('s."userId" =');
    expect(sql).toContain("jsonb_array_length");
  });
});

describe("toDashboardSite", () => {
  const baseRow = {
    id: "site-1",
    name: "Demo",
    slug: "demo",
    updatedAt: new Date("2026-07-01T00:00:00Z"),
  };

  it("reassembles the sliced schema and keeps the full block count", () => {
    const heroBlock = createBlock("hero");
    const site = toDashboardSite({
      ...baseRow,
      pageId: "page-1",
      pageTitle: "Home",
      pageSlug: "home",
      pageIsHome: true,
      pageStatus: "PUBLISHED",
      pageUpdatedAt: new Date("2026-07-02T00:00:00Z"),
      blockCount: 9,
      schemaVersion: 2,
      schemaSettings: { metaTitle: "Hello", metaDescription: "" },
      previewBlocks: [heroBlock] as unknown as Prisma.JsonValue,
    });

    expect(site.pages).toHaveLength(1);
    expect(site.pages[0]).toMatchObject({
      id: "page-1",
      status: "PUBLISHED",
      blockCount: 9,
      schema: {
        version: 2,
        settings: { metaTitle: "Hello" },
        blocks: [heroBlock],
      },
    });
  });

  it("omits null schema parts and returns no pages for sites without a home page", () => {
    const withoutPage = toDashboardSite({
      ...baseRow,
      pageId: null,
      pageTitle: null,
      pageSlug: null,
      pageIsHome: null,
      pageStatus: null,
      pageUpdatedAt: null,
      blockCount: null,
      schemaVersion: null,
      schemaSettings: null,
      previewBlocks: null,
    });

    expect(withoutPage.pages).toEqual([]);

    const withEmptySchema = toDashboardSite({
      ...baseRow,
      pageId: "page-1",
      pageTitle: "Home",
      pageSlug: "home",
      pageIsHome: true,
      pageStatus: "DRAFT",
      pageUpdatedAt: new Date("2026-07-02T00:00:00Z"),
      blockCount: null,
      schemaVersion: null,
      schemaSettings: null,
      previewBlocks: null,
    });

    expect(withEmptySchema.pages[0].blockCount).toBe(0);
    expect(withEmptySchema.pages[0].schema).toEqual(emptyPageSchema);
  });
});

describe("createUniqueSlug", () => {
  it("returns the clean base when available", async () => {
    pageFindFirst.mockResolvedValue(null);

    await expect(createUniqueSlug("Launch Page")).resolves.toBe("launch-page");
  });

  it("adds numeric suffixes for existing slugs", async () => {
    pageFindFirst
      .mockResolvedValueOnce({ id: "page-1" } as never)
      .mockResolvedValueOnce({ id: "page-2" } as never)
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
    pageFindFirst.mockResolvedValueOnce({ id: "page-1" } as never).mockResolvedValueOnce(null);

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

describe("updatePageWithUniqueSlug", () => {
  it("uses the provided client for slug checks", async () => {
    const transactionPageFindFirst = vi.fn().mockResolvedValue(null);
    const write = vi.fn().mockResolvedValue({ slug: "launch" });

    await expect(
      updatePageWithUniqueSlug(
        "Launch",
        "page-1",
        "site-1",
        write,
        { page: { findFirst: transactionPageFindFirst } } as never,
      ),
    ).resolves.toEqual({ slug: "launch" });

    expect(transactionPageFindFirst).toHaveBeenCalledWith({
      where: { slug: "launch", siteId: "site-1", id: { not: "page-1" } },
      select: { id: true },
    });
    expect(pageFindFirst).not.toHaveBeenCalled();
    expect(write).toHaveBeenCalledWith("launch");
  });
});

describe("createPageForUser", () => {
  it("retries with a suffixed slug when Prisma reports a unique conflict", async () => {
    const createdPage = {
      id: "page-1",
      siteId: "site-1",
      site: { name: "Demo Site", slug: "demo" },
      title: "Launch",
      slug: "launch-2",
      isHome: false,
      headerMode: "INHERIT" as const,
      footerMode: "INHERIT" as const,
      status: "DRAFT" as const,
      schema: emptyPageSchema,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    siteFindFirst.mockResolvedValue({ id: "site-1" } as never);
    pageCount.mockResolvedValue(1);
    pageFindFirst.mockResolvedValue(null);
    pageCreate.mockRejectedValueOnce(uniqueSlugError()).mockResolvedValueOnce(createdPage as never);

    await expect(createPageForUser("user-1", "Launch")).resolves.toMatchObject({
      slug: "launch-2",
    });
    expect(pageCount).toHaveBeenCalledWith({ where: { siteId: "site-1" } });
    expect(pageCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          siteId: "site-1",
          slug: "launch",
        }),
      }),
    );
    expect(pageCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ data: expect.not.objectContaining({ userId: "user-1" }) }),
    );
    expect(pageCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ data: expect.objectContaining({ slug: "launch-2" }) }),
    );
  });
});

describe("createSiteFromTemplateForUser", () => {
  it("creates the site and each template page in order", async () => {
    const createdSite = {
      id: "site-1",
      userId: "user-1",
      name: "Demo Site",
      slug: "demo-site",
      globalHeader: null,
      globalFooter: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const schema: PageSchema = {
      version: 2,
      blocks: [createBlock("hero")],
      settings: emptyPageSchema.settings,
    };

    siteCreate.mockResolvedValue(createdSite as never);
    siteUpdate.mockResolvedValue(createdSite as never);
    siteFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "site-1" } as never)
      .mockResolvedValueOnce({ id: "site-1" } as never);
    pageFindFirst.mockResolvedValue(null);
    pageCount.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    pageCreate
      .mockResolvedValueOnce({
        id: "page-home",
        siteId: "site-1",
        site: { name: "Demo Site", slug: "demo-site" },
        title: "Home",
        slug: "home",
        isHome: true,
        headerMode: "INHERIT" as const,
        footerMode: "INHERIT" as const,
        status: "PUBLISHED" as const,
        updatedAt: new Date(),
      } as never)
      .mockResolvedValueOnce({
        id: "page-pricing",
        siteId: "site-1",
        site: { name: "Demo Site", slug: "demo-site" },
        title: "Pricing",
        slug: "pricing",
        isHome: false,
        headerMode: "INHERIT" as const,
        footerMode: "INHERIT" as const,
        status: "DRAFT" as const,
        updatedAt: new Date(),
      } as never);

    await expect(
      createSiteFromTemplateForUser("user-1", "Demo Site", [
        { title: "Home", schema },
        { title: "Pricing", schema: emptyPageSchema },
      ], {
        buildGlobalHeader: (site, pages) => ({
          version: 2,
          blocks: [
            {
              id: "header-1",
              type: "header",
              props: {
                brandText: site.slug,
                links: pages.map((page) => ({
                  label: page.title,
                  url: page.isHome ? "/home" : `/${page.slug}`,
                })),
                ctaLabel: "",
                ctaUrl: "#",
                sticky: true,
              },
            },
          ],
          settings: emptyPageSchema.settings,
        }),
      }),
    ).resolves.toMatchObject({
      id: "site-1",
      pages: [
        { id: "page-home", title: "Home", slug: "home", isHome: true },
        { id: "page-pricing", title: "Pricing", slug: "pricing", isHome: false },
      ],
    });

    expect(siteCreate).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "Demo Site",
        slug: "demo-site",
      },
    });
    expect(pageCreate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Home",
          slug: "home",
          isHome: true,
          status: "PUBLISHED",
        }),
      }),
    );
    expect(pageCreate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Pricing",
          slug: "pricing",
          isHome: false,
          status: "DRAFT",
        }),
      }),
    );
    expect(siteUpdate).toHaveBeenCalledWith({
      where: { id: "site-1" },
      data: {
        globalHeader: expect.objectContaining({
          blocks: [
            expect.objectContaining({
              type: "header",
              props: expect.objectContaining({
                brandText: "demo-site",
                links: [
                  { label: "Home", url: "/home" },
                  { label: "Pricing", url: "/pricing" },
                ],
              }),
            }),
          ],
        }),
      },
    });
  });
});

describe("toCreatedSiteSummary", () => {
  it("includes the home page id and public path for create-site navigation", () => {
    const summary = toCreatedSiteSummary({
      id: "site-1",
      name: "Demo Site",
      slug: "demo-site",
      updatedAt: new Date("2026-07-06T00:00:00.000Z"),
      pages: [
        { id: "page-pricing", slug: "pricing", isHome: false },
        { id: "page-home", slug: "home", isHome: true },
      ],
    });

    expect(summary).toEqual({
      id: "site-1",
      name: "Demo Site",
      slug: "demo-site",
      updatedAt: "2026-07-06T00:00:00.000Z",
      homePageId: "page-home",
      publicPath: "/s/demo-site",
    });
  });
});
