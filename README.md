# Pageforce

Mini Web Builder SaaS MVP built with Next.js, TypeScript, TailwindCSS, Supabase Auth, Supabase Postgres, and Prisma.

## Core Flow

- Supabase Auth stores users in `auth.users`.
- App data lives in Supabase Postgres tables managed by Prisma.
- `Page.userId` stores the Supabase Auth user id.
- Builder saves landing pages as JSON block schemas.
- Public pages render at `/p/[slug]` only when `status = PUBLISHED`.
- Agent and MCP setup lives in `AGENTS.md` and `docs/mcp-agent-setup.md`.

## Setup

Create two Supabase projects before filling env values:

- `pageforge-dev` for local development and test users/pages.
- `pageforge-prod` for Vercel Production and real data.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
```

Fill `.env` with the `pageforge-dev` Supabase values before running migrations. Keep `PAGEFORGE_ENV="development"` locally. Do not point local `.env` at the production Supabase project.

## Development

```bash
npm run dev
```

Open http://localhost:3000.

## MVP Features

- Register, login, logout, guarded dashboard and builder.
- Page create, list, edit title/slug/status, delete.
- Builder with sidebar, canvas preview, properties panel.
- Four block types: Hero, Text, Image, Button.
- Add, edit, delete, reorder blocks with buttons.
- Save JSON schema to Postgres.
- Public render for published pages.

## Deploy

Set these Vercel Production environment variables with values from `pageforge-prod`:

- `PAGEFORGE_ENV=production`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then deploy the Next.js app on Vercel. Production migrations should use:

```bash
npm run prisma:deploy
```

Never run `npm run prisma:migrate` against production.
