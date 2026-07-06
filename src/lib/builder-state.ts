import type {
  DesignTokens,
  PageBlock,
  PageSchema,
  PageSettings,
  SectionMode,
} from "@/types/blocks";
import type { EditablePage, PageStatus } from "@/types/page";
import { defaultPageSettings, defaultTokens } from "@/lib/blocks";
import { slugify } from "@/lib/slug";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type BuilderSnapshot = {
  title: string;
  slug: string;
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  headerSchema: PageSchema | null;
  footerSchema: PageSchema | null;
  schema: PageSchema;
  selectedBlockId: string | null;
};

export type BuilderState = {
  title: string;
  slug: string;
  isHome: boolean;
  headerMode: SectionMode;
  footerMode: SectionMode;
  headerSchema: PageSchema | null;
  footerSchema: PageSchema | null;
  status: PageStatus;
  publishedAt: string | null;
  updatedAt: string;
  schema: PageSchema;
  selectedBlockId: string | null;
  dirty: boolean;
  editVersion: number;
  saveStatus: SaveStatus;
  notice: string | null;
  past: BuilderSnapshot[];
  future: BuilderSnapshot[];
  lastEdit: { key: string; at: number } | null;
};

export type BuilderAction =
  | { type: "loadPage"; page: EditablePage }
  | { type: "setTitle"; value: string; at: number }
  | { type: "setSlug"; value: string; at: number }
  | { type: "setIsHome"; value: boolean; at: number }
  | { type: "setHeaderMode"; value: SectionMode; at: number }
  | { type: "setFooterMode"; value: SectionMode; at: number }
  | { type: "setHeaderSchema"; schema: PageSchema | null; at: number }
  | { type: "setFooterSchema"; schema: PageSchema | null; at: number }
  | { type: "insertBlock"; block: PageBlock; index?: number }
  | { type: "replaceSchema"; schema: PageSchema }
  | { type: "moveBlock"; from: number; to: number }
  | { type: "updateBlock"; block: PageBlock; at: number }
  | { type: "duplicateBlock"; id: string; newId: string }
  | { type: "deleteBlock"; id: string }
  | { type: "updateSettings"; patch: Partial<Omit<PageSettings, "tokens">>; at: number }
  | { type: "updateTokens"; patch: Partial<DesignTokens>; at: number }
  | { type: "selectBlock"; id: string | null }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "saveStarted" }
  | { type: "saveSucceeded"; page: EditablePage; requestedSlug: string; editVersion: number }
  | { type: "saveFailed"; message: string; editVersion: number };

const HISTORY_LIMIT = 50;
const COALESCE_MS = 1000;

const UNDOABLE = new Set<BuilderAction["type"]>([
  "setTitle",
  "setSlug",
  "setIsHome",
  "setHeaderMode",
  "setFooterMode",
  "setHeaderSchema",
  "setFooterSchema",
  "insertBlock",
  "replaceSchema",
  "moveBlock",
  "updateBlock",
  "duplicateBlock",
  "deleteBlock",
  "updateSettings",
  "updateTokens",
]);

function snapshotOf(state: BuilderState): BuilderSnapshot {
  return {
    title: state.title,
    slug: state.slug,
    isHome: state.isHome,
    headerMode: state.headerMode,
    footerMode: state.footerMode,
    headerSchema: state.headerSchema,
    footerSchema: state.footerSchema,
    schema: state.schema,
    selectedBlockId: state.selectedBlockId,
  };
}

// null = structural action (never coalesces); string = coalescing key so a
// typing burst on the same target becomes a single undo step.
function editKeyFor(action: BuilderAction): string | null {
  if (action.type === "setTitle") return "title";
  if (action.type === "setSlug") return "slug";
  if (action.type === "setIsHome") return "isHome";
  if (action.type === "setHeaderMode") return "headerMode";
  if (action.type === "setFooterMode") return "footerMode";
  if (action.type === "setHeaderSchema") return "headerSchema";
  if (action.type === "setFooterSchema") return "footerSchema";
  if (action.type === "updateBlock") return `block:${action.block.id}`;
  if (action.type === "updateSettings") return `settings:${Object.keys(action.patch).sort().join(",")}`;
  if (action.type === "updateTokens") return `tokens:${Object.keys(action.patch).sort().join(",")}`;
  return null;
}

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
    isHome: page.isHome,
    headerMode: page.headerMode,
    footerMode: page.footerMode,
    headerSchema: page.headerSchema,
    footerSchema: page.footerSchema,
    status: page.status,
    publishedAt: page.publishedAt,
    updatedAt: page.updatedAt,
    schema: { ...page.schema, settings: normalizeSettings(page.schema) },
    selectedBlockId: page.schema.blocks[0]?.id ?? null,
    dirty: false,
    editVersion: 0,
    saveStatus: "idle",
    notice: null,
    past: [],
    future: [],
    lastEdit: null,
  };
}

function edited(state: BuilderState, patch: Partial<BuilderState>): BuilderState {
  return {
    ...state,
    ...patch,
    dirty: true,
    editVersion: state.editVersion + 1,
    saveStatus: "idle",
    notice: null,
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  if (action.type === "loadPage") {
    return initialBuilderState(action.page);
  }

  if (action.type === "undo") {
    const previous = state.past.at(-1);

    if (!previous) {
      return state;
    }

    return {
      ...state,
      ...previous,
      past: state.past.slice(0, -1),
      future: [...state.future, snapshotOf(state)],
      lastEdit: null,
      dirty: true,
      editVersion: state.editVersion + 1,
      saveStatus: "idle",
      notice: null,
    };
  }

  if (action.type === "redo") {
    const next = state.future.at(-1);

    if (!next) {
      return state;
    }

    return {
      ...state,
      ...next,
      past: [...state.past, snapshotOf(state)],
      future: state.future.slice(0, -1),
      lastEdit: null,
      dirty: true,
      editVersion: state.editVersion + 1,
      saveStatus: "idle",
      notice: null,
    };
  }

  const next = applyAction(state, action);

  if (next === state || !UNDOABLE.has(action.type)) {
    return next;
  }

  const key = editKeyFor(action);
  const at = "at" in action ? action.at : 0;
  const coalesce =
    key !== null &&
    state.lastEdit !== null &&
    state.lastEdit.key === key &&
    at >= state.lastEdit.at &&
    at - state.lastEdit.at < COALESCE_MS;

  return {
    ...next,
    past: coalesce ? state.past : [...state.past, snapshotOf(state)].slice(-HISTORY_LIMIT),
    future: [],
    lastEdit: key === null ? null : { key, at },
  };
}

type ApplyableAction = Exclude<
  BuilderAction,
  { type: "loadPage" } | { type: "undo" } | { type: "redo" }
>;

function applyAction(state: BuilderState, action: ApplyableAction): BuilderState {
  if (action.type === "setTitle") {
    if (state.title === action.value) {
      return state;
    }

    return edited(state, { title: action.value });
  }

  if (action.type === "setSlug") {
    const slug = slugify(action.value);

    if (state.slug === slug) {
      return state;
    }

    return edited(state, { slug });
  }

  if (action.type === "setIsHome") {
    if (state.isHome === action.value) {
      return state;
    }

    return edited(state, { isHome: action.value });
  }

  if (action.type === "setHeaderMode") {
    if (state.headerMode === action.value) {
      return state;
    }

    return edited(state, { headerMode: action.value });
  }

  if (action.type === "setFooterMode") {
    if (state.footerMode === action.value) {
      return state;
    }

    return edited(state, { footerMode: action.value });
  }

  if (action.type === "setHeaderSchema") {
    return edited(state, { headerSchema: action.schema });
  }

  if (action.type === "setFooterSchema") {
    return edited(state, { footerSchema: action.schema });
  }

  if (action.type === "insertBlock") {
    const index = Math.max(
      0,
      Math.min(action.index ?? state.schema.blocks.length, state.schema.blocks.length),
    );
    const blocks = [...state.schema.blocks];
    blocks.splice(index, 0, action.block);

    return edited(state, {
      schema: { ...state.schema, blocks },
      selectedBlockId: action.block.id,
    });
  }

  if (action.type === "replaceSchema") {
    return edited(state, {
      schema: { ...action.schema, settings: normalizeSettings(action.schema) },
      selectedBlockId: action.schema.blocks[0]?.id ?? null,
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
    let changed = false;
    const blocks = state.schema.blocks.map((block) => {
      if (block.id !== action.block.id) {
        return block;
      }

      changed = block !== action.block;
      return action.block;
    });

    if (!changed) {
      return state;
    }

    return edited(state, {
      schema: {
        ...state.schema,
        blocks,
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

    if (blocks.length === state.schema.blocks.length) {
      return state;
    }

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
    if (action.editVersion !== state.editVersion) {
      return state;
    }

    const schema = { ...action.page.schema, settings: normalizeSettings(action.page.schema) };
    const selectedStillExists =
      state.selectedBlockId === null ||
      schema.blocks.some((block) => block.id === state.selectedBlockId);

    return {
      ...state,
      title: action.page.title,
      slug: action.page.slug,
      isHome: action.page.isHome,
      headerMode: action.page.headerMode,
      footerMode: action.page.footerMode,
      headerSchema: action.page.headerSchema,
      footerSchema: action.page.footerSchema,
      status: action.page.status,
      publishedAt: action.page.publishedAt,
      updatedAt: action.page.updatedAt,
      schema,
      selectedBlockId: selectedStillExists
        ? state.selectedBlockId
        : schema.blocks[0]?.id ?? null,
      dirty: false,
      saveStatus: "saved",
      lastEdit: null,
      notice:
        action.page.slug !== action.requestedSlug
          ? `That slug was taken — published at ${action.page.publicPath}`
          : null,
    };
  }

  if (action.editVersion !== state.editVersion) {
    return state;
  }

  return { ...state, saveStatus: "error", notice: action.message };
}
