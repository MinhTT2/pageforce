# Pageforce Showcase

Pageforce is a mini multipage website builder SaaS MVP for founders, marketers, and small teams who need to create polished marketing sites without wiring a CMS from scratch.

The project demonstrates a complete product loop: authenticate, create a site, compose pages from JSON-backed blocks, save live, share public URLs, upload images, and collect leads.

## Product Screens

![Pageforce landing page](assets/screenshots/home-desktop.png)

The landing page introduces the product and gives reviewers a quick visual signal before they inspect the code.

![Pageforce dashboard site management](assets/screenshots/dashboard-sites-demo.png)

The dashboard shows the authenticated ownership surface: a user manages websites, sees live/draft status, opens the builder, jumps to public URLs, and reviews captured leads from one workspace.

![Pageforce builder overview](assets/screenshots/builder-overview.png)

The builder is the core product surface. The left palette exposes typed blocks, the center canvas renders the live page with global header inheritance, and the right inspector edits the selected block. This is the same schema that persists through Prisma and renders on public `/s` routes.

![Pageforce builder content inspector](assets/screenshots/builder-hero-inspector.png)

Content editing is block-aware rather than generic JSON editing. Selecting the Hero block reveals focused controls for heading, subheading, button copy, and action URL while the canvas updates against the reusable renderer.

![Pageforce builder style inspector](assets/screenshots/builder-style-inspector.png)

Per-block style overrides stay scoped and validated: background, text, accent, alignment, vertical padding, and content width can change a section without weakening the page-wide design token system.

![Pageforce builder page navigator](assets/screenshots/builder-pages-navigator.png)

The page navigator shows the multi-page architecture inside the builder. A site can contain Home, Product, Pricing, and Contact pages, each with its own slug/status while ownership remains enforced through the parent `Site`.

![Pageforce builder design tokens](assets/screenshots/builder-design-tokens.png)

Page-wide tokens make the builder more than a block list. Presets, hex colors, typography, radius, and spacing feed CSS variables used by both editor preview and public rendering.

![Pageforce builder preview mode](assets/screenshots/builder-preview-mode.png)

Preview mode removes editing chrome around the page so the user can inspect the visitor experience before opening the live public URL.

![Pageforce public render from builder schema](assets/screenshots/public-demo-site.png)

The public page proves the important contract: a saved builder schema becomes the unauthenticated rendered site, with the same global header, content blocks, styling, and lead path.

![Pageforce login and builder mockup](assets/screenshots/login-desktop.png)

The auth screen uses Supabase Google login and shows the core builder workflow without requiring a reviewer to sign in first.

![Pageforce design system](assets/screenshots/design-system-desktop.png)

The design system route shows the dashboard-oriented primitives behind Pageforce: panels, forms, buttons, badges, cards, states, and visual surfaces.

![Pageforce mobile landing page](assets/screenshots/home-mobile.png)

The builder is desktop-first for the MVP, but the public marketing surface remains responsive enough for mobile review.

## Why It Is Interesting

- It is not just CRUD: the core artifact is a versioned JSON page schema with typed blocks, defaults, validation, editing controls, and shared rendering.
- The builder screenshots show the actual workflow: block palette, drag/click insertion, selected-block inspector, scoped style overrides, page navigator, design tokens, preview, save, and public route.
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

The current screenshot set includes unauthenticated marketing/auth surfaces plus a clean authenticated dev demo of dashboard, builder, preview, and public rendering. The next useful visual addition is a lead-submission walkthrough that captures a public form submit and the private lead table view without exposing personal or production data.
