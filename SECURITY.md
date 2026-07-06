# Security Policy

Pageforce is an MVP portfolio project, but security-sensitive behavior is still treated carefully.

## Supported Version

The active development branch is `main`. Security fixes should target `main` unless a maintainer creates a release branch.

## Reporting a Vulnerability

Please open a private report through GitHub security advisories if available, or contact the repository owner directly through the GitHub profile linked to this repository.

Do not include real Supabase keys, database credentials, OAuth client secrets, Vercel tokens, or personal access tokens in public issues or pull requests.

## Secret Handling

- Do not commit `.env` files.
- Do not commit Supabase service-role keys.
- Do not commit Google OAuth client secrets.
- Do not put secrets in `NEXT_PUBLIC_*` variables.
- Keep local MCP, Vercel, GitHub, and Supabase credentials outside the repository.

## Environment Safety

Local development should use the `pageforce-dev` Supabase project with `PAGEFORCE_ENV="development"`.

Vercel Production should use the `pageforce-prod` Supabase project with `PAGEFORCE_ENV="production"`.

Use guarded Prisma scripts:

- Local/dev migrations: `npm run prisma:migrate`
- Production migration deploys: `npm run prisma:deploy`

Never run dev migrations against production.

## Current Security Boundaries

- Supabase Auth is the user source of truth.
- Private app APIs must get the current Supabase user and enforce ownership through `Site.userId`.
- Public `/s` routes intentionally do not require auth, but only render published pages with content.
- Public lead capture intentionally does not require visitor auth, but must keep payload validation, body size limits, and honeypot protection.
- Image uploads require an authenticated owner and validate file type, extension, size, and page ownership.
