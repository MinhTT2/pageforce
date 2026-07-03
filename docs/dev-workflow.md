# Dev Workflow

This project uses a Supabase dev project for local development and a separate Supabase production project for real data.

## Daily Development

```bash
npm install
npm run prisma:generate
npm run dev
```

Use root `.env` for local development and point it at the `pageforce-dev` Supabase project. Keep `PAGEFORCE_ENV="development"` locally so Prisma guard scripts can refuse production-unsafe commands.

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

Use the combined CI command before larger handoffs:

```bash
npm run ci
```

Run browser smoke tests when the dev Supabase env is ready:

```bash
npm run test:e2e
```

## Database Environments

- Local development: `pageforce-dev` Supabase project.
- Vercel Preview: no dedicated database for now; either leave disabled or point at dev intentionally.
- Vercel Production: `pageforce-prod` Supabase project.

Required variables for each environment:

- `PAGEFORCE_ENV`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Use `PAGEFORCE_ENV=development` for local/dev, `PAGEFORCE_ENV=preview` for preview if configured, and `PAGEFORCE_ENV=production` only in Vercel Production.

## Prisma Migrations

Create and apply local/dev migrations with:

```bash
npm run prisma:migrate
```

This command is guarded and will fail if `PAGEFORCE_ENV=production`.

Apply committed migrations to production with:

```bash
npm run prisma:deploy
```

Do not run `prisma migrate dev` or `npm run prisma:migrate` against production.

## First Production Setup

- Create a fresh `pageforce-prod` Supabase project.
- Add the production Supabase values to Vercel Production env.
- Set `PAGEFORCE_ENV=production` in Vercel Production.
- Run `npm run prisma:deploy` against production during the first deploy.
- Create a separate production user; do not reuse dev test accounts for smoke tests.

## Builder Changes

When adding or changing a block type, update these together:

- TypeScript block types in `src/types/blocks.ts`
- Defaults and labels in `src/lib/blocks.ts`
- Validation in `src/lib/validators.ts`
- Rendering in `src/components/blocks/BlockRenderer.tsx`
- Editing controls in `src/components/builder/BuilderShell.tsx`
- Unit tests for schema/default behavior

## Release Flow

- Pull requests and feature branches get Vercel Preview deployments.
- Merges or pushes to `main` deploy to Vercel Production.
- GitHub Actions runs lint, unit tests, and build before merge/deploy confidence.

## Manual Smoke Checklist

- Register or log in.
- Create a page.
- Add, edit, reorder, and delete blocks.
- Save the builder.
- Publish the page.
- Open `/p/[slug]` and confirm the public page renders.
