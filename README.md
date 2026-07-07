# Pageforce

[![CI](https://github.com/MinhTT2/pageforce/actions/workflows/ci.yml/badge.svg)](https://github.com/MinhTT2/pageforce/actions/workflows/ci.yml)

Pageforce is a mini multipage website builder SaaS MVP for creating marketing sites from structured JSON blocks. It combines a guarded dashboard and drag-and-drop builder with live public rendering, lead capture, image uploads, and Supabase-backed auth/data.

The project is intentionally small enough to review in one sitting, but built with production-minded boundaries: explicit ownership checks, schema validation, CI, Prisma migrations, environment guards, and reusable rendering between the builder preview and public pages.

![Pageforce landing page](docs/assets/screenshots/home-desktop.png)

## Review In 5 Minutes

1. Scan the screenshot gallery and [Showcase](docs/showcase.md).
2. Inspect the data model in `prisma/schema.prisma`.
3. Inspect the block contract in `src/types/blocks.ts`, `src/lib/blocks.ts`, `src/lib/validators.ts`, and `src/components/blocks/BlockRenderer.tsx`.
4. Inspect ownership checks under `src/app/api/pages` and `src/app/api/sites`.
5. Run `npm run lint`, `npm run test`, and `npm run build`.

## What Reviewers Should Notice

- Full-stack product flow: Google/Supabase auth, dashboard, builder, public pages, image uploads, and lead capture.
- Multi-tenant ownership model without a duplicated app `User` table; Supabase Auth remains the user source of truth.
- JSON block contract shared across types, defaults, validation, editing, and rendering.
- Live-save publishing model: saving content updates the public page immediately once it has at least one block.
- Security-minded API boundaries: private routes enforce `Site.userId`, public lead submission stays unauthenticated but validated.
- Quality posture: unit tests, Playwright smoke tests, CI, Prisma migration scripts, and production-safe migration commands.

## Demo Gallery

Live demo URL can be added after deployment. Until then, the screenshot set below gives reviewers a quick visual pass through the unauthenticated product surfaces.

| Landing | Landing full page | Tablet | Mobile |
| --- | --- | --- | --- |
| ![Landing page desktop](docs/assets/screenshots/home-desktop.png) | ![Landing page full desktop](docs/assets/screenshots/home-full-desktop.png) | ![Landing page tablet](docs/assets/screenshots/home-tablet.png) | ![Landing page mobile](docs/assets/screenshots/home-mobile.png) |

| Login | Register | Design system | Not found |
| --- | --- | --- | --- |
| ![Login page desktop](docs/assets/screenshots/login-desktop.png) | ![Register page desktop](docs/assets/screenshots/register-desktop.png) | ![Design system desktop](docs/assets/screenshots/design-system-desktop.png) | ![Not found page](docs/assets/screenshots/not-found-desktop.png) |

| Login mobile | Register mobile | Design system tablet | Design system mobile |
| --- | --- | --- | --- |
| ![Login page mobile](docs/assets/screenshots/login-mobile.png) | ![Register page mobile](docs/assets/screenshots/register-mobile.png) | ![Design system tablet](docs/assets/screenshots/design-system-tablet.png) | ![Design system mobile](docs/assets/screenshots/design-system-mobile.png) |

## Builder Workflow Gallery

These authenticated demo screenshots show the product loop that matters most: manage a site, compose a real page, edit block content/style, switch pages, tune design tokens, preview the visitor view, and verify that the public route renders the same schema.

| Dashboard | Builder overview |
| --- | --- |
| ![Dashboard site management](docs/assets/screenshots/dashboard-sites-demo.png) | ![Builder overview with block palette, canvas, and inspector](docs/assets/screenshots/builder-overview.png) |

| Content inspector | Style inspector |
| --- | --- |
| ![Builder hero block content inspector](docs/assets/screenshots/builder-hero-inspector.png) | ![Builder block style inspector](docs/assets/screenshots/builder-style-inspector.png) |

| Page navigator | Design tokens |
| --- | --- |
| ![Builder multi-page navigator](docs/assets/screenshots/builder-pages-navigator.png) | ![Builder page design token controls](docs/assets/screenshots/builder-design-tokens.png) |

| Preview mode | Public render |
| --- | --- |
| ![Builder visitor preview mode](docs/assets/screenshots/builder-preview-mode.png) | ![Public page rendered from the live builder schema](docs/assets/screenshots/public-demo-site.png) |

What this demonstrates:

- A real multi-page builder, not a static CRUD dashboard: pages, blocks, global header, live public URL, preview, and inspector all appear in one workflow.
- A typed `PageSchema` contract drives defaults, validation, editor controls, builder preview, and public rendering.
- Page-wide design tokens and per-block style overrides are visible in the UI and validated before save.
- Authenticated dashboard/builder routes stay private, while public `/s` routes render only published pages with content.

See [docs/showcase.md](docs/showcase.md) for the product story and reviewer path. Screenshot regeneration notes live in [docs/assets/README.md](docs/assets/README.md).

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4, shadcn/ui primitives, lucide-react icons
- Supabase Auth, Supabase Postgres, Supabase Storage
- Prisma 6 for app data access and migrations
- Vitest, Playwright, ESLint, GitHub Actions, Vercel

## Feature Tour

- Google sign-in through Supabase Auth with guarded dashboard and builder routes.
- Multi-site dashboard where each user can create sites and manage pages.
- Drag-and-drop builder with live canvas, block palette, keyboard-accessible reordering, duplication, deletion, and tabbed inspectors.
- Thirteen block types: Hero, Text, Image, Carousel, Button, Features, Testimonials, Pricing, Products, FAQ, CTA, Lead Form, Footer.
- Page-wide design tokens plus per-block style overrides for colors, fonts, radius, spacing, alignment, padding, and width.
- Template-driven site/page creation and global header/footer support.
- Live public URLs at `/s/[siteSlug]` and `/s/[siteSlug]/[pageSlug]`.
- SEO metadata from page settings.
- Lead Form blocks with capture, `mailto`, or external action delivery modes.
- Authenticated image uploads to Supabase Storage with file type and size validation.

## Why This Is More Than CRUD

Pageforce is centered on a schema-driven builder, not a set of plain database forms. The page schema is typed, validated, edited visually, saved to Postgres, and rendered through shared components on public routes.

The app also demonstrates real SaaS boundaries: Supabase Auth identity, Prisma-owned product data, site-level ownership checks, public rendering rules, visitor lead capture, image upload validation, CI, and production-safe migration scripts.

## Architecture

```mermaid
flowchart LR
  browser[Browser]
  app[Next.js App Router]
  auth[Supabase Auth]
  prisma[Prisma Client]
  db[(Supabase Postgres)]
  storage[Supabase Storage]

  browser --> app
  app --> auth
  app --> prisma
  prisma --> db
  app --> storage
```

The app keeps authentication and application data separate. Supabase Auth owns users in `auth.users`; Prisma owns Pageforce data in `Site`, `Page`, and `LeadSubmission`.

`Site.userId` stores the Supabase Auth user id. Pages belong to sites, and private reads/mutations enforce ownership through `Page.site.userId = current user id`.

Public rendering is unauthenticated by design. Public `/s` routes only render pages that are `PUBLISHED` and have content. Blank pages stay `DRAFT`.

For more detail, see [docs/architecture.md](docs/architecture.md).

## Data Model

- `Site`: owned by a Supabase Auth user, contains pages, optional global header/footer JSON, and site-level lead submissions.
- `Page`: belongs to a site and stores route metadata, section modes, and the live builder schema in `schema`.
- `LeadSubmission`: stores validated public form submissions against a site and block id.

There is no Prisma `User` model. That is deliberate: Supabase Auth is the source of truth for identity, while Pageforce tables store product data and ownership ids.

## Local Setup

Create two Supabase projects before filling env values:

- `pageforce-dev` for local development and test users/pages.
- `pageforce-prod` for Vercel Production and real data.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Fill `.env` with the `pageforce-dev` Supabase values before running migrations. Keep `PAGEFORCE_ENV="development"` locally. Do not point local `.env` at the production Supabase project.

Open http://localhost:3000.

## Google Login

Google sign-in uses Supabase Auth OAuth. The app renders a unified `Continue with Google` auth screen at `/login`, and Supabase redirects back through `/auth/callback`.

1. In Google Cloud Console, open your OAuth Client and add this authorized redirect URI:

```txt
https://[PROJECT_REF].supabase.co/auth/v1/callback
```

2. In Supabase Dashboard, open `Authentication` > `Providers` > `Google`, enable Google, then paste your Google OAuth Client ID and Client Secret.

3. In Supabase Dashboard, open `Authentication` > `URL Configuration` and set:

```txt
Site URL: http://localhost:3000
Redirect URLs: http://localhost:3000/auth/callback
```

For production, add your production domain as an additional redirect URL, for example:

```txt
https://your-domain.com/auth/callback
```

Do not commit the Google Client Secret or put it in any `NEXT_PUBLIC_*` environment variable.

## Image Uploads

Image uploads use the Supabase Storage bucket named `page-assets`. Create it as a public bucket in the active Supabase project before uploading images from the builder.

The upload endpoint requires an authenticated user, validates page ownership, accepts JPEG, PNG, WebP, and GIF files, and rejects files larger than 5MB.

## Quality Checks

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

Use the combined CI command before larger handoffs:

```bash
npm run ci
```

GitHub Actions runs lint, unit tests, and build on pull requests and pushes to `main`. Production migration deployment is handled separately with guarded Prisma commands.

## Deploy

Set these Vercel Production environment variables with values from `pageforce-prod`:

- `PAGEFORCE_ENV=production`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then deploy the Next.js app on Vercel. Production migrations should use:

```bash
npm run prisma:deploy
```

Never run `npm run prisma:migrate` against production.

## More Docs

- [Architecture](docs/architecture.md)
- [Showcase](docs/showcase.md)
- [Reviewer Guide](docs/reviewer-guide.md)
- [Roadmap](docs/roadmap.md)
- [Development Workflow](docs/dev-workflow.md)
- [MCP and Agent Setup](docs/mcp-agent-setup.md)
