<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pageforce Agent Guide

This file is the source of truth for agents working in this repository. Read it before changing code, then read the task-relevant files.

## Project Overview

Pageforce is a Mini Landing Page Builder SaaS MVP. Users register, create sites, compose landing pages from JSON-backed blocks, save changes live, upload page assets, capture leads, and view public pages at `/s/[siteSlug]`.

Each Supabase Auth user can own multiple `Site` records, and each site can contain multiple `Page` records.

## Stack

- Next.js App Router with TypeScript.
- React 19 and Next.js 16.2.10.
- Tailwind CSS v4.
- shadcn/ui in `src/components/ui` with lucide-react icons.
- Supabase Auth for users and sessions.
- Supabase Postgres for data.
- Prisma 6 for app data access.
- Vercel for deployment.

## Environments

- Local/dev uses the `pageforce-dev` Supabase project.
- Vercel Production uses the `pageforce-prod` Supabase project.
- Keep local `.env` pointed at `pageforce-dev` and set `PAGEFORCE_ENV="development"`.
- Vercel Production must set `PAGEFORCE_ENV="production"` and use `pageforce-prod` database/auth values.
- Do not point local `.env`, local Prisma commands, or local browser testing at the production Supabase project.
- Required environment variables:
  - `PAGEFORCE_ENV`
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture Rules

- Supabase Auth is the user source of truth. Users live in Supabase `auth.users`.
- Do not create a Prisma `User` model for the MVP.
- App data lives in Prisma models, currently `Site`, `Page`, and `LeadSubmission`.
- `Site.userId` stores the Supabase Auth user id and is indexed for ownership lookups.
- `Page` belongs to `Site`; do not store user ownership directly on `Page`.
- `Page.draftSchema` currently stores the live builder schema. The column name is legacy.
- `Page.publishedSchema` is kept in sync for compatibility when a page is live, but there is no separate publish step in the MVP.
- Saving updates the live schema and the public page immediately once the schema has at least one block.
- Blank pages remain `DRAFT`; public pages render only `PUBLISHED` pages with content.
- Global header/footer JSON belongs to `Site`; page-level header/footer modes can inherit, customize, or hide those sections.
- Lead Form blocks can store public submissions in `LeadSubmission` or use mailto/external action delivery.
- Authenticated image uploads use Supabase Storage bucket `page-assets`; keep file type, size, ownership, and public URL validation in place.
- Keep shared block rendering logic reusable between builder preview and public render.

## Auth Rules

- Use Supabase SSR helpers from `src/lib/supabase`.
- Guard `/dashboard` and `/builder` routes.
- Public routes `/s/[siteSlug]` and `/s/[siteSlug]/[pageSlug]` must not require auth.
- Public routes render only `PUBLISHED` pages with at least one block.
- API routes that mutate or read private data must get the current Supabase user and enforce ownership through `Site.userId`.

## Page API Rules

- `GET /api/pages` lists all pages owned by the current user.
- `POST /api/pages` creates a new page for the current user.
- `PATCH /api/pages/[pageId]` saves live metadata/content: title, slug, and `schema`.
- `PATCH /api/pages/[pageId]` must not trust client-sent status changes.
- There is no separate publish endpoint in the MVP.
- Delete, update, and get operations must enforce `Page.site.userId = current Supabase user id`.

## Lead API Rules

- `POST /api/pages/[pageId]/leads` is public because visitors submit forms from public `/s` pages.
- Public lead submission must validate payloads, cap body size, and preserve the honeypot guard.
- Dashboard lead views must get the current Supabase user and enforce ownership through `Site.userId`.
- Stored lead submissions belong to `Site`; public submission endpoints may still accept `pageId` to validate the source lead form.

## Builder Rules

- The block schema JSON is the core contract.
- Every block type must have:
  - a TypeScript type in `src/types/blocks.ts`;
  - a default factory in `src/lib/blocks.ts`;
  - validation in `src/lib/validators.ts`;
  - rendering support in `src/components/blocks/BlockRenderer.tsx`;
  - editing controls in `src/components/builder/block-editors/`;
  - focused tests when behavior, validation, defaults, or schema shape changes.
- The current public block contract is `PageSchema` version 2.
- Builder edits the live page schema.
- Public render uses the live page schema for `PUBLISHED` pages with content.
- Blocks are added by dragging from the palette onto the canvas (with a drop-position indicator) or by clicking a palette item.
- Reordering uses drag-and-drop (dnd-kit) via a per-block drag handle; the handle is keyboard accessible (Space/Enter to lift, arrow keys to move, Space to drop, Esc to cancel).
- Page-wide design tokens (`settings.tokens`: colors, fonts, radius, spacing) drive rendering through `--pf-*` CSS variables; per-block `style` overrides re-scope those variables. Colors are validated hex-only — do not relax this (style-attribute injection guard).
- Images can be external URLs or authenticated Supabase uploads. Do not add a new storage provider, image transformation service, or upload surface unless requested.
- Template-driven site/page creation must preserve schema validation and unique site/page slug behavior.

## UI Rules

- Prefer shadcn/ui components from `src/components/ui`.
- If a needed shadcn component is missing, add it with the shadcn CLI instead of hand-rolling a different design system.
- Use lucide-react icons for icon buttons and common actions.
- Keep the builder workflow-first: dashboard, landing page management, editor, and public URL flow matter more than marketing sections.
- Builder is desktop-first for the MVP. Mobile should not be badly broken, but breakpoint editing is out of scope.
- Design system primitives live in `src/components/ui`; prefer semantic tokens from `src/app/globals.css` over hard-coded color scales for shared UI.

## Quality Gates

- Run `npm run lint` after code changes.
- Run `npm run typecheck` after TypeScript-facing changes.
- Run `npm run build` before handing off substantial changes.
- Run `npm run test` for substantial logic, validator, schema, or builder changes.
- Run `npm run prisma:generate` after Prisma schema changes.
- If changing DB schema for local/dev, create and review a Prisma migration with `npm run prisma:migrate`.
- Production must use committed migrations with `npm run prisma:deploy`.
- Never run `prisma migrate dev` or `npm run prisma:migrate` against production.
- If `.env` or Supabase credentials are missing, report the blocker clearly instead of faking database verification.
- Use `npm run ci` before larger handoffs when time and environment allow.
- Run `npm run test:e2e` for changes to auth, dashboard, builder save flows, public rendering, uploads, or lead capture when the dev Supabase environment is configured.
- Lefthook runs `npm run lint` and `npm run typecheck` before commit, and `npm run test` before push. Keep these hooks fast; CI remains the full authoritative gate.

## Prompt Best Practices

Use durable instructions here for repo rules, and use the prompt for task-specific context. Strong task prompts usually include:

- Goal: what should change.
- Context: relevant files, screenshots, logs, URLs, or reproduction steps.
- Constraints: architecture, safety, design, or compatibility limits.
- Done when: checks, behavior, or review criteria that prove completion.

Before coding, read:

- `AGENTS.md`
- `README.md`
- `package.json`
- `prisma/schema.prisma`
- the files/components directly related to the task

For complex or fuzzy changes, plan first. Ask clarifying questions only when the missing answer cannot be safely inferred from the repo.

Use review mode or an explicit review pass for risky diffs before committing, especially auth, ownership, migration, upload, public rendering, and builder schema changes.

Avoid running multiple agent threads against the same files at once. If parallel work is needed, split it by branch, worktree, or clearly separate file ownership.

When changing builder features, update the type, validator, renderer, editor, and default factory together.

When changing auth or database behavior, never query users through Prisma. Get users from Supabase session helpers and enforce ownership through `Site.userId`.

When changing save/public behavior, preserve the live-save model: save updates the current schema and public pages render that current schema.

When changing Prisma schema, include the intended migration command in the handoff. For production, mention `npm run prisma:deploy`; do not imply that `migrate dev` is safe for production.

When changing UI, preserve existing shadcn/Tailwind conventions and verify the main workflow in the browser when possible.

When finishing, report:

- main files changed;
- checks run;
- migration status if the database schema changed;
- any remaining blocker, especially missing Supabase env vars or migrations.

## Agent Workflow and Hooks

Recommended Codex surface choices:

- Put durable repo conventions in `AGENTS.md`.
- Put personal defaults, MCP setup, model/reasoning defaults, and trusted project hooks in Codex `config.toml`, not in the app source unless they are meant to be shared.
- Use a skill for repeated Pageforce workflows such as implement-test-commit-push.
- Use MCPs for live external state, browser verification, Supabase/Vercel/GitHub inspection, and current library docs.
- Use hooks only for mechanical guardrails that are cheap, deterministic, and worth running repeatedly.

Recommended Codex hooks to consider in local or project `.codex/` config:

- `UserPromptSubmit`: scan prompts for accidentally pasted secrets, Supabase service-role keys, access tokens, or production credentials before the agent starts.
- `PreToolUse` for shell commands: block or warn on destructive git commands, production Prisma migrations, writes to `.env`, and commands that appear to target `pageforce-prod` from local dev.
- `PreToolUse` for file edits: warn before editing `.env`, secrets, generated files, migrations, or lockfiles unless the task explicitly calls for it.
- `PostToolUse` for `apply_patch`: run a quick formatting or static sanity check only when it is fast and scoped; do not auto-run the full build after every edit.
- `Stop`: remind the agent to report changed files, checks, migration status, and blockers. Keep it informational, not a hidden auto-commit.
- `PreCompact` or `PostCompact`: save a compact task summary for long builder/database changes so resumed work keeps the same constraints.

Repo Git hooks use Lefthook:

- `prepare` installs Lefthook after `npm install`.
- `pre-commit` runs `npm run lint` and `npm run typecheck`.
- `pre-push` runs `npm run test`.
- Do not add `npm run build` to every local push unless the team explicitly wants slower hooks; use `npm run ci` for larger handoffs and let GitHub Actions remain the authoritative full gate.

## Recommended MCPs

These MCPs are recommended for local agent environments. Do not commit secrets, service-role keys, access tokens, or personal MCP config to this repository.

- Supabase MCP: inspect Supabase project, auth config, schema, SQL, migrations, and future RLS policies.
- Playwright MCP: verify real browser flows for auth, dashboard, builder, save, public URL navigation, and public render.
- Context7 or Docs MCP: fetch current docs for Next.js 16, Supabase SSR, Prisma, shadcn/ui, and Tailwind v4.
- Vercel MCP: manage deployment status, logs, and env vars when production deployment is in scope.
- GitHub MCP: useful after the project is pushed to GitHub for issues, PRs, and reviews.
- Google Drive/Docs MCP: optional, only needed if the product spec remains in Google Docs.

Lower-priority MCPs:

- Filesystem MCP is unnecessary when the agent already has workspace file access.
- A separate Postgres MCP is unnecessary if Supabase MCP is available.
- Prisma MCP is unnecessary for the MVP because Prisma CLI and `prisma/schema.prisma` are sufficient.

## Do Not

- Do not commit `.env` or credentials.
- Do not commit service-role keys, access tokens, personal MCP config, or production project secrets.
- Do not add a Prisma `User` model for the MVP.
- Do not add teams, billing, analytics, custom domains, subdomains, new upload providers, new template systems, undo/redo, or breakpoint editing unless explicitly requested.
- Do not replace the chosen stack without a new architecture decision.
