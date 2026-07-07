import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BuilderShell } from "./BuilderShell";
import { createBlock, defaultPageSettings } from "@/lib/blocks";
import type { PageBlock } from "@/types/blocks";
import type { EditablePage } from "@/types/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@dnd-kit/core", async () => {
  const React = await import("react");

  return {
    DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    KeyboardSensor: vi.fn(),
    PointerSensor: vi.fn(),
    closestCenter: vi.fn(() => []),
    pointerWithin: vi.fn(() => []),
    useSensor: vi.fn(() => ({})),
    useSensors: vi.fn(() => []),
  };
});

vi.mock("@/components/blocks/BlockRenderer", () => ({
  BlockRenderer: () => <div data-testid="block-renderer" />,
}));

vi.mock("./BlockPalette", () => ({
  BlockPalette: () => <div data-testid="block-palette" />,
  PaletteDragPreview: () => <div />,
}));

vi.mock("./BuilderCanvas", () => ({
  BuilderCanvas: () => <div data-testid="builder-canvas" />,
}));

vi.mock("./BuilderHeader", () => ({
  BuilderHeader: ({
    dirty,
    onSave,
    onTogglePages,
  }: {
    dirty: boolean;
    onSave: () => void;
    onTogglePages: () => void;
  }) => (
    <div>
      <button type="button" data-dirty={dirty} onClick={onSave}>
        Save
      </button>
      <button type="button" onClick={onTogglePages}>
        Pages
      </button>
    </div>
  ),
}));

vi.mock("./BuilderPageNavigator", () => ({
  BuilderPageNavigator: ({
    currentPageId,
    switchingPageId,
    onSelectPage,
  }: {
    currentPageId: string;
    switchingPageId: string | null;
    onSelectPage: (pageId: string) => void;
  }) => (
    <div data-testid="page-navigator" data-current={currentPageId} data-switching={switchingPageId ?? ""}>
      <button type="button" onClick={() => onSelectPage("page-1")}>
        Open page 1
      </button>
      <button type="button" onClick={() => onSelectPage("page-2")}>
        Open page 2
      </button>
    </div>
  ),
}));

vi.mock("./BuilderPageSettingsSidebar", () => ({
  BuilderPageSettingsSidebar: () => <div data-testid="page-settings" />,
}));

vi.mock("./Inspector", () => ({
  Inspector: ({
    pageId,
    selectedBlock,
    onUpdateBlock,
  }: {
    pageId: string;
    selectedBlock: PageBlock | null;
    onUpdateBlock: (block: PageBlock) => void;
  }) => (
    <div>
      <span data-testid="page-id">{pageId}</span>
      <button
        type="button"
        onClick={() => {
          if (selectedBlock?.type === "text") {
            onUpdateBlock({
              ...selectedBlock,
              props: { ...selectedBlock.props, content: `${selectedBlock.props.content}!` },
            });
          }
        }}
      >
        Edit selected block
      </button>
    </div>
  ),
}));

vi.mock("./hooks", () => ({
  usePublicOrigin: () => "",
  useSaveShortcut: vi.fn(),
  useUndoRedoShortcuts: vi.fn(),
  useUnsavedChangesWarning: vi.fn(),
}));

function deferredResponse() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((next) => {
    resolve = next;
  });

  return { promise, resolve };
}

function makePage(id: string, title: string): EditablePage {
  const pageSummaries = [
    {
      id: "page-1",
      siteId: "site-1",
      siteName: "Demo Site",
      siteSlug: "demo",
      title: "Home",
      slug: "home",
      publicPath: "/s/demo/home",
      isHome: false,
      headerMode: "INHERIT" as const,
      footerMode: "INHERIT" as const,
      status: "PUBLISHED" as const,
      publishedAt: null,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "page-2",
      siteId: "site-1",
      siteName: "Demo Site",
      siteSlug: "demo",
      title: "Pricing",
      slug: "pricing",
      publicPath: "/s/demo/pricing",
      isHome: false,
      headerMode: "INHERIT" as const,
      footerMode: "INHERIT" as const,
      status: "PUBLISHED" as const,
      publishedAt: null,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ];

  return {
    id,
    siteId: "site-1",
    siteName: "Demo Site",
    siteSlug: "demo",
    title,
    slug: title.toLowerCase(),
    publicPath: `/s/demo/${title.toLowerCase()}`,
    isHome: false,
    headerMode: "INHERIT",
    footerMode: "INHERIT",
    status: "PUBLISHED",
    publishedAt: null,
    updatedAt: "2026-01-01T00:00:00.000Z",
    schema: {
      version: 2,
      blocks: [createBlock("text")],
      settings: defaultPageSettings,
    },
    site: {
      id: "site-1",
      name: "Demo Site",
      slug: "demo",
      updatedAt: "2026-01-01T00:00:00.000Z",
      globalHeader: null,
      globalFooter: null,
      pages: pageSummaries,
    },
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("BuilderShell", () => {
  it("does not reuse a pending save after loading a different page", async () => {
    const firstSave = deferredResponse();
    const fetchMock = vi
      .fn()
      .mockReturnValueOnce(firstSave.promise)
      .mockResolvedValueOnce(
        Response.json({
          ...makePage("page-2", "Pricing"),
          updatedAt: "2026-01-01T00:01:00.000Z",
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(<BuilderShell page={makePage("page-1", "Home")} />);

    fireEvent.click(screen.getByText("Edit selected block"));
    fireEvent.click(screen.getByText("Save"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pages/page-1",
      expect.objectContaining({ method: "PATCH" }),
    );

    rerender(<BuilderShell page={makePage("page-2", "Pricing")} />);
    await waitFor(() => expect(screen.getByTestId("page-id").textContent).toBe("page-2"));

    fireEvent.click(screen.getByText("Edit selected block"));
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/pages/page-2",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);

    firstSave.resolve(Response.json(makePage("page-1", "Home")));
  });

  it("saves dirty edits before fetching and switching to another page", async () => {
    const pushStateSpy = vi.spyOn(window.history, "pushState");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(Response.json(makePage("page-1", "Home")))
      .mockResolvedValueOnce(Response.json(makePage("page-2", "Pricing")));
    vi.stubGlobal("fetch", fetchMock);

    render(<BuilderShell page={makePage("page-1", "Home")} />);

    fireEvent.click(screen.getByText("Edit selected block"));
    fireEvent.click(screen.getByText("Pages"));
    fireEvent.click(screen.getByText("Open page 2"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "/api/pages/page-1",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/pages/page-2"));
    await waitFor(() => expect(screen.getByTestId("page-id").textContent).toBe("page-2"));
    expect(pushStateSpy).toHaveBeenCalledWith(
      null,
      "",
      "/builder/site/site-1?page=page-2",
    );
  });

  it("uses the page cache when switching back to a loaded page", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json(makePage("page-2", "Pricing")));
    vi.stubGlobal("fetch", fetchMock);

    render(<BuilderShell page={makePage("page-1", "Home")} />);

    fireEvent.click(screen.getByText("Pages"));
    fireEvent.click(screen.getByText("Open page 2"));
    await waitFor(() => expect(screen.getByTestId("page-id").textContent).toBe("page-2"));

    fireEvent.click(screen.getByText("Open page 1"));
    await waitFor(() => expect(screen.getByTestId("page-id").textContent).toBe("page-1"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/pages/page-2");
  });

  it("stays on the current page when saving before switch fails", async () => {
    const pushStateSpy = vi.spyOn(window.history, "pushState");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json(
          { error: "This page changed in another tab. Reload before saving again." },
          { status: 409 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(<BuilderShell page={makePage("page-1", "Home")} />);

    fireEvent.click(screen.getByText("Edit selected block"));
    fireEvent.click(screen.getByText("Pages"));
    fireEvent.click(screen.getByText("Open page 2"));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/pages/page-1",
      expect.objectContaining({ method: "PATCH" }),
    );
    await waitFor(() => expect(screen.getByTestId("page-id").textContent).toBe("page-1"));
    await waitFor(() => expect(screen.getByTestId("page-navigator").dataset.switching).toBe(""));
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it("switches clean pages without saving first", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json(makePage("page-2", "Pricing")));
    vi.stubGlobal("fetch", fetchMock);

    render(<BuilderShell page={makePage("page-1", "Home")} />);

    fireEvent.click(screen.getByText("Pages"));
    fireEvent.click(screen.getByText("Open page 2"));

    await waitFor(() => expect(screen.getByTestId("page-id").textContent).toBe("page-2"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/pages/page-2");
  });
});
