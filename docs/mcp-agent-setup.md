# MCP and Agent Setup

Use this document when preparing a local agent environment for Pageforce. Keep secrets outside the repository.

## Recommended MCPs

1. Supabase MCP
   - Purpose: inspect Supabase Auth, Postgres schema, SQL, migrations, and future RLS policies.
   - Required secret handling: configure project tokens in the local MCP config only.

2. Playwright MCP
   - Purpose: browser-test the full MVP flow: register, login, create page, edit builder blocks, save, publish, and open `/p/[slug]`.
   - No app secrets should be committed.

3. Context7 or Docs MCP
   - Purpose: fetch current docs for Next.js 16, React 19, Tailwind v4, shadcn/ui, Supabase SSR, and Prisma 6.
   - Use this before changing APIs that may have recent breaking changes.

4. Vercel MCP
   - Purpose: inspect deployments, build logs, and Vercel environment variables.
   - Only needed when deployment work is in scope.

5. GitHub MCP
   - Purpose: manage issues, PRs, and reviews after the repo is hosted on GitHub.

6. Google Drive/Docs MCP
   - Purpose: read or update the product spec if it continues to live in Google Docs.
   - Optional for normal implementation work.

## Not Prioritized

- Filesystem MCP: not needed if the agent already has workspace access.
- Separate Postgres MCP: redundant if Supabase MCP is configured.
- Prisma MCP: not needed for this MVP; use Prisma CLI scripts in `package.json`.

## Agent Startup Checklist

Before implementing a task:

1. Read `AGENTS.md`.
2. Read `README.md`.
3. Read `package.json`.
4. Read `prisma/schema.prisma`.
5. Read task-relevant files.
6. If changing Next.js routing or APIs, inspect `node_modules/next/dist/docs/` first.

## Verification Checklist

Run these checks after normal code changes:

```bash
npm run lint
npm run build
```

Run this after Prisma schema changes:

```bash
npm run prisma:generate
```

Run this when a schema migration is intended and `.env` is configured:

```bash
npm run prisma:migrate
```

## Security Rules

- Never commit `.env`, Supabase service role keys, Vercel tokens, GitHub tokens, or Google credentials.
- Use `.env.example` only for placeholder variable names.
- Keep local MCP configuration outside the repo unless it contains placeholders only.
