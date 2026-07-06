# Summary

<!-- What changed, why, and any reviewer context. -->

# Checks

- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` if browser flow changed

# Data and Migrations

- [ ] No Prisma schema change
- [ ] Prisma schema changed and `npm run prisma:generate` was run
- [ ] Local/dev migration created with `npm run prisma:migrate`
- [ ] Production rollout notes mention `npm run prisma:deploy`

# Auth, Ownership, and Env Safety

- [ ] Private API reads/mutations get the current Supabase user
- [ ] Private data access enforces ownership through `Site.userId`
- [ ] Public routes remain unauthenticated only where intended
- [ ] Public lead submission keeps validation, size limits, and honeypot protection
- [ ] No `.env`, service-role key, access token, or production secret is committed
- [ ] Local/dev work remains pointed at the `pageforce-dev` Supabase project

# UI Review

- [ ] Screenshots or screen recording attached for visual changes
- [ ] Main workflow checked in browser when UI changed
- [ ] Mobile is not badly broken, even when the feature is desktop-first

# Notes

<!-- Known tradeoffs, follow-ups, or rollout details. -->
