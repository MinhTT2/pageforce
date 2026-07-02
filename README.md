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

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
```

Fill `.env` with Supabase project values before running migrations.

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

Set these Vercel environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then deploy the Next.js app on Vercel.
