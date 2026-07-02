<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Pageforce Agent Guide

This file is the source of truth for agents working in this repository. Read it before changing code, then read the task-relevant files.

## Project Overview

Pageforce is a Mini Web Builder SaaS MVP. Users register, create landing pages, compose pages from JSON-backed blocks, publish pages, and view published pages at `/p/[slug]`.

## Stack

- Next.js App Router with TypeScript.
- React 19 and Next.js 16.2.10.
- Tailwind CSS v4.
- shadcn/ui in `src/components/ui` with lucide-react icons.
- Supabase Auth for users and sessions.
- Supabase Postgres for data.
- Prisma 6 for app data access.
- Vercel for deployment.

## Architecture Rules

- Supabase Auth is the user source of truth. Users live in Supabase `auth.users`.
- Do not create a Prisma `User` model for the MVP.
- App data lives in Prisma models, currently `Page`.
- `Page.userId` stores the Supabase Auth user id.
- Public pages render from JSON schemas stored in `Page.schema`.
- Keep shared block rendering logic reusable between builder preview and public render.

## Auth Rules

- Use Supabase SSR helpers from `src/lib/supabase`.
- Guard `/dashboard` and `/builder` routes.
- Public route `/p/[slug]` must not require auth.
- Public route `/p/[slug]` only renders pages with `status = PUBLISHED`.
- API routes that mutate or read private data must get the current Supabase user and enforce ownership with `userId`.

## Builder Rules

- The block schema JSON is the core contract.
- Every block type must have:
  - a TypeScript type in `src/types/blocks.ts`;
  - a default factory in `src/lib/blocks.ts`;
  - validation in `src/lib/validators.ts`;
  - rendering support in `src/components/blocks/BlockRenderer.tsx`;
  - editing controls in the builder UI.
- MVP reorder uses up/down buttons. Do not add drag-and-drop unless requested.
- MVP images use URLs. Do not add uploads unless requested.

## UI Rules

- Prefer shadcn/ui components from `src/components/ui`.
- If a needed shadcn component is missing, add it with the shadcn CLI instead of hand-rolling a different design system.
- Use lucide-react icons for icon buttons and common actions.
- Keep the builder workflow-first: dashboard, page list, editor, and publish flow matter more than marketing sections.
- Builder is desktop-first for the MVP. Mobile should not be badly broken, but breakpoint editing is out of scope.

## Quality Gates

- Run `npm run lint` after code changes.
- Run `npm run build` before handing off substantial changes.
- Run `npm run prisma:generate` after Prisma schema changes.
- If changing DB schema, create and review a Prisma migration with `npm run prisma:migrate`.
- If `.env` or Supabase credentials are missing, report the blocker clearly instead of faking database verification.

## Prompt Best Practices

Before coding, read:

- `AGENTS.md`
- `README.md`
- `package.json`
- `prisma/schema.prisma`
- the files/components directly related to the task

When changing builder features, update the type, validator, renderer, editor, and default factory together.

When changing auth or database behavior, never query users through Prisma. Get users from Supabase session helpers and enforce `Page.userId` ownership.

When changing UI, preserve existing shadcn/Tailwind conventions and verify the main workflow in the browser when possible.

When finishing, report:

- main files changed;
- checks run;
- any remaining blocker, especially missing Supabase env vars or migrations.

## Recommended MCPs

These MCPs are recommended for local agent environments. Do not commit secrets, service-role keys, access tokens, or personal MCP config to this repository.

- Supabase MCP: inspect Supabase project, auth config, schema, SQL, migrations, and future RLS policies.
- Playwright MCP: verify real browser flows for auth, dashboard, builder, save, publish, and public render.
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
- Do not add a Prisma `User` model for the MVP.
- Do not add drag-and-drop, uploads, templates, SEO settings, analytics, teams, custom domains, undo/redo, or breakpoint editing unless explicitly requested.
- Do not replace the chosen stack without a new architecture decision.
