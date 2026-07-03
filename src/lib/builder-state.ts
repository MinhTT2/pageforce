import type {
  DesignTokens,
  PageBlock,
  PageSchema,
  PageSettings,
} from "@/types/blocks";
import type { EditablePage } from "@/types/page";
import { defaultPageSettings, defaultTokens } from "@/lib/blocks";
import { slugify } from "@/lib/slug";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type BuilderState = {
  title: string;
  slug: string;
  schema: PageSchema;
  selectedBlockId: string | null;
  dirty: boolean;
  saveStatus: SaveStatus;
  notice: string | null;
};

export type BuilderAction =
  | { type: "setTitle"; value: string }
  | { type: "setSlug"; value: string }
  | { type: "insertBlock"; block: PageBlock; index: number }
  | { type: "moveBlock"; from: number; to: number }
  | { type: "updateBlock"; block: PageBlock }
  | { type: "duplicateBlock"; id: string; newId: string }
  | { type: "deleteBlock"; id: string }
  | { type: "updateSettings"; patch: Partial<Omit<PageSettings, "tokens">> }
  | { type: "updateTokens"; patch: Partial<DesignTokens> }
  | { type: "selectBlock"; id: string | null }
  | { type: "saveStarted" }
  | { type: "saveSucceeded"; page: EditablePage; requestedSlug: string }
  | { type: "saveFailed"; message: string };

function normalizeSettings(schema: PageSchema): PageSettings {
  return {
    ...defaultPageSettings,
    ...schema.settings,
    tokens: { ...defaultTokens, ...schema.settings?.tokens },
  };
}

export function initialBuilderState(page: EditablePage): BuilderState {
  return {
    title: page.title,
    slug: page.slug,
    schema: { ...page.schema, settings: normalizeSettings(page.schema) },
    selectedBlockId: page.schema.blocks[0]?.id ?? null,
    dirty: false,
    saveStatus: "idle",
    notice: null,
  };
}

function edited(state: BuilderState, patch: Partial<BuilderState>): BuilderState {
  return { ...state, ...patch, dirty: true, saveStatus: "idle", notice: null };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  if (action.type === "setTitle") {
    return edited(state, { title: action.value });
  }

  if (action.type === "setSlug") {
    return edited(state, { slug: slugify(action.value) });
  }

  if (action.type === "insertBlock") {
    const index = Math.max(0, Math.min(action.index, state.schema.blocks.length));
    const blocks = [...state.schema.blocks];
    blocks.splice(index, 0, action.block);

    return edited(state, {
      schema: { ...state.schema, blocks },
      selectedBlockId: action.block.id,
    });
  }

  if (action.type === "moveBlock") {
    const { from, to } = action;
    const blocks = state.schema.blocks;

    if (from === to || from < 0 || from >= blocks.length || to < 0 || to >= blocks.length) {
      return state;
    }

    const next = [...blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    return edited(state, { schema: { ...state.schema, blocks: next } });
  }

  if (action.type === "updateBlock") {
    return edited(state, {
      schema: {
        ...state.schema,
        blocks: state.schema.blocks.map((block) =>
          block.id === action.block.id ? action.block : block,
        ),
      },
    });
  }

  if (action.type === "duplicateBlock") {
    const index = state.schema.blocks.findIndex((block) => block.id === action.id);

    if (index < 0) {
      return state;
    }

    const copy = structuredClone(state.schema.blocks[index]);
    copy.id = action.newId;
    const blocks = [...state.schema.blocks];
    blocks.splice(index + 1, 0, copy);

    return edited(state, {
      schema: { ...state.schema, blocks },
      selectedBlockId: copy.id,
    });
  }

  if (action.type === "deleteBlock") {
    const blocks = state.schema.blocks.filter((block) => block.id !== action.id);
    const selectedBlockId =
      state.selectedBlockId === action.id ? blocks[0]?.id ?? null : state.selectedBlockId;

    return edited(state, {
      schema: { ...state.schema, blocks },
      selectedBlockId,
    });
  }

  if (action.type === "updateSettings") {
    return edited(state, {
      schema: {
        ...state.schema,
        settings: { ...normalizeSettings(state.schema), ...action.patch },
      },
    });
  }

  if (action.type === "updateTokens") {
    const settings = normalizeSettings(state.schema);

    return edited(state, {
      schema: {
        ...state.schema,
        settings: { ...settings, tokens: { ...settings.tokens, ...action.patch } },
      },
    });
  }

  if (action.type === "selectBlock") {
    return { ...state, selectedBlockId: action.id };
  }

  if (action.type === "saveStarted") {
    return { ...state, saveStatus: "saving", notice: null };
  }

  if (action.type === "saveSucceeded") {
    const schema = { ...action.page.schema, settings: normalizeSettings(action.page.schema) };
    const selectedStillExists =
      state.selectedBlockId === null ||
      schema.blocks.some((block) => block.id === state.selectedBlockId);

    return {
      ...state,
      title: action.page.title,
      slug: action.page.slug,
      schema,
      selectedBlockId: selectedStillExists
        ? state.selectedBlockId
        : schema.blocks[0]?.id ?? null,
      dirty: false,
      saveStatus: "saved",
      notice:
        action.page.slug !== action.requestedSlug
          ? `That slug was taken — published at /p/${action.page.slug}`
          : null,
    };
  }

  return { ...state, saveStatus: "error", notice: action.message };
}
