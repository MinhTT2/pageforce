# Pageforce Showcase

Pageforce is a mini landing page builder SaaS MVP for founders, marketers, and small teams who need to create polished campaign pages without wiring a CMS from scratch.

The project demonstrates a complete product loop: authenticate, create a site, compose pages from JSON-backed blocks, save live, share public URLs, upload images, and collect leads.

## Product Screens

![Pageforce landing page](assets/screenshots/home-desktop.png)

The landing page introduces the product and gives reviewers a quick visual signal before they inspect the code.

![Pageforce login and builder mockup](assets/screenshots/login-desktop.png)

The auth screen uses Supabase Google login and shows the core builder workflow without requiring a reviewer to sign in first.

![Pageforce design system](assets/screenshots/design-system-desktop.png)

The design system route shows the dashboard-oriented primitives behind Pageforce: panels, forms, buttons, badges, cards, states, and visual surfaces.

![Pageforce mobile landing page](assets/screenshots/home-mobile.png)

The builder is desktop-first for the MVP, but the public marketing surface remains responsive enough for mobile review.

## Why It Is Interesting

- It is not just CRUD: the core artifact is a versioned JSON page schema with typed blocks, defaults, validation, editing controls, and shared rendering.
- Supabase Auth stays the user source of truth; Prisma stores product data and ownership ids instead of duplicating users.
- Private APIs enforce ownership through `Site.userId`, while public `/s` pages remain unauthenticated and render only live content.
- Lead capture is intentionally public for visitors, but keeps strict validation, body-size limits, and honeypot handling.
- The live-save model keeps the product simple: saving a non-blank page updates the public page immediately.

## Reviewer Path

1. Start with [README.md](../README.md) for the product pitch, setup, stack, and quality checks.
2. Read [Architecture](architecture.md) for the route boundaries, data flow, and invariants.
3. Inspect `prisma/schema.prisma` for `Site`, `Page`, and `LeadSubmission`.
4. Inspect the block contract across `src/types/blocks.ts`, `src/lib/blocks.ts`, `src/lib/validators.ts`, and `src/components/blocks/BlockRenderer.tsx`.
5. Inspect private API ownership checks under `src/app/api/pages` and `src/app/api/sites`.
6. Inspect public rendering at `src/app/s/[siteSlug]/[[...pageSlug]]/page.tsx`.
7. Run `npm run lint`, `npm run test`, and `npm run build`.

## Product Workflow

- Create or log in with Google through Supabase Auth.
- Create a site and pages from the guarded dashboard.
- Build a page with drag-and-drop blocks and page-wide design tokens.
- Save the page and open the public `/s/[siteSlug]` URL.
- Capture leads from public Lead Form blocks.
- Review submissions in the site lead view.

## Next Visual Upgrade

The current screenshot set intentionally uses unauthenticated routes. Once a clean dev Supabase project has seed data, add dashboard, builder, public site, and lead table screenshots to show the full authenticated flow without exposing personal or production data.
