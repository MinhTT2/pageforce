# Pageforce

Mini Landing Page Builder SaaS MVP built with Next.js App Router, TypeScript, Tailwind CSS v4, Supabase Auth, Supabase Postgres, and Prisma.

## Core Flow

- Supabase Auth stores users in `auth.users`.
- App data lives in Supabase Postgres tables managed by Prisma.
- `Page.userId` stores the Supabase Auth user id.
- Each user can own multiple landing pages.
- Builder saves landing pages as JSON block schemas.
- Saves are live once a page has content: saved pages with at least one block render the latest schema at `/p/[slug]`; blank pages stay Draft and do not render publicly.
- Lead Form blocks can capture submissions into the `LeadSubmission` table or use `mailto`/external action URLs.
- Agent and MCP setup lives in `AGENTS.md` and `docs/mcp-agent-setup.md`.

## Setup

Create two Supabase projects before filling env values:

- `pageforce-dev` for local development and test users/pages.
- `pageforce-prod` for Vercel Production and real data.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
```

Fill `.env` with the `pageforce-dev` Supabase values before running migrations. Keep `PAGEFORCE_ENV="development"` locally. Do not point local `.env` at the production Supabase project.

## Google Login

Google sign-in uses Supabase Auth OAuth. The app renders a unified `Continue with Google` auth screen at `/login`, and Supabase redirects back through `/auth/callback`.

1. In Google Cloud Console, open your OAuth Client and add this authorized redirect URI:

```txt
https://[PROJECT_REF].supabase.co/auth/v1/callback
```

For local development, use the same Supabase project ref that appears in `NEXT_PUBLIC_SUPABASE_URL`.

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

## Development

```bash
npm run dev
```

Open http://localhost:3000.

## MVP Features

- Register, login, logout, guarded dashboard and builder.
- Google sign-in through Supabase Auth.
- Multi-page dashboard with create, list, edit title/slug, delete, and per-page lead views.
- Builder with draggable block palette, live canvas, and tabbed inspector (Content/Style per block, Page/Design for the page).
- Thirteen block types: Hero, Text, Image, Carousel, Button, Features, Testimonials, Pricing, Products, FAQ, CTA, Lead Form, Footer.
- Drag blocks from the palette onto the canvas, reorder with drag-and-drop (keyboard accessible), duplicate and delete per block.
- Per-block style overrides (background, text, accent color, alignment, padding, width) on top of page-wide design tokens (brand color, fonts, radius, spacing) with three starter presets.
- Page settings for meta title/description and slug; live public pages render SEO metadata.
- Save JSON schema to Postgres and update the public page immediately when the schema has at least one block.
- Blank pages stay Draft; `/p/[slug]` only renders live pages with content.
- Built-in lead capture endpoint for public pages, with a dashboard table for the latest submissions.

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
