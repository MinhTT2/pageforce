# Reviewer Guide

This guide is for recruiters and technical reviewers who want a fast, high-signal pass through Pageforce.

## 10-Minute Review Path

1. Read the top of [README.md](../README.md) for product scope, stack, and quality signals.
2. Inspect `prisma/schema.prisma` to understand `Site`, `Page`, and `LeadSubmission`.
3. Inspect `src/types/blocks.ts`, `src/lib/blocks.ts`, `src/lib/validators.ts`, and `src/components/blocks/BlockRenderer.tsx` to see the JSON block contract.
4. Inspect `src/app/api/pages` and `src/app/api/sites` for Supabase user lookup and ownership enforcement.
5. Inspect `src/app/s/[siteSlug]/[[...pageSlug]]/page.tsx` for unauthenticated public rendering.
6. Run the quality checks below if the local Supabase env is configured.

## Strongest Engineering Signals

- Auth/data separation: Supabase Auth owns identity; Prisma models own product data.
- Ownership enforcement: private APIs authorize through `Site.userId`.
- Shared rendering: builder preview and public pages use the same block renderer.
- Schema discipline: block changes require coordinated types, defaults, validation, renderer, and editor controls.
- Live-save product model: no hidden publish queue; saved non-blank pages become public immediately.
- Lead capture safety: public visitor endpoint is validated, size-capped, and guarded with a honeypot.
- Environment safety: Prisma migration scripts distinguish local/dev and production.
- CI posture: lint, unit tests, and build run in GitHub Actions.

## Local Review Commands

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Fill `.env` with the `pageforce-dev` Supabase project before running migrations.

Quality checks:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

`npm run test:e2e` starts the dev server and runs Playwright smoke tests. A fully authenticated builder smoke test requires a configured Supabase dev project and test account flow.

## Manual Smoke Checklist

- Visit `/` and confirm the marketing page links to auth.
- Log in through `/login`.
- Create a site and at least one page from the dashboard.
- Open the builder, add blocks, edit content/style, reorder blocks, duplicate and delete a block.
- Save the page.
- Open `/s/[siteSlug]` or `/s/[siteSlug]/[pageSlug]` and confirm the saved content renders publicly.
- Add a Lead Form in capture mode, submit it on the public page, and confirm it appears in the site lead view.
- Upload an image after creating the public `page-assets` Supabase Storage bucket.

## Intentional MVP Boundaries

These are intentionally outside the current MVP unless a future roadmap item explicitly adds them:

- Teams and role-based collaboration.
- Billing and subscriptions.
- Custom domains and subdomains.
- Analytics dashboards.
- Breakpoint-specific editing.
- Full asset library management beyond current page image upload support.
- Undo/redo history.

The current target is a coherent single-user landing page builder with clear auth, data, builder, public rendering, and lead capture flows.
