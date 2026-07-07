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
  BuilderHeader: ({ dirty, onSave }: { dirty: boolean; onSave: () => void }) => (
    <button type="button" data-dirty={dirty} onClick={onSave}>
      Save
    </button>
  ),
}));

vi.mock("./BuilderPageNavigator", () => ({
  BuilderPageNavigator: () => <div data-testid="page-navigator" />,
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
      pages: [],
    },
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
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
});
