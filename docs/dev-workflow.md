# Dev Workflow

This project uses one Supabase project for dev/preview and a separate Supabase project for production.

## Daily Development

```bash
npm install
npm run prisma:generate
npm run dev
```

Use `.env` for local development and point it at the Supabase dev project.

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

- Local development: Supabase dev project.
- Vercel Preview: Supabase dev project.
- Vercel Production: Supabase production project.

Required variables for each environment:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Treat the existing project `orwnkmrohrmpsuabuyvy` as dev unless you explicitly promote it to production.

## Prisma Migrations

Create and apply local/dev migrations with:

```bash
npm run prisma:migrate
```

Apply committed migrations to production with:

```bash
npm run prisma:deploy
```

Do not run `prisma migrate dev` against production.

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
