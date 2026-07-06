# Roadmap

This roadmap keeps the MVP honest while showing where the product can grow next.

## MVP Complete

- Supabase Auth with Google login and guarded dashboard/builder routes.
- Multi-site, multi-page data model with Prisma migrations.
- Drag-and-drop JSON block builder with shared public rendering.
- Live-save publishing for non-blank pages.
- Public `/s/[siteSlug]` and `/s/[siteSlug]/[pageSlug]` routes.
- Lead Form blocks with capture, mailto, and external action modes.
- Site-level lead views.
- Authenticated image uploads to Supabase Storage.
- Unit tests, Playwright smoke tests, ESLint, build checks, and GitHub Actions CI.

## Next Near-Term

- Deploy a stable production demo and add live URL plus screenshots to `README.md`.
- Expand template coverage for common landing-page categories.
- Harden Supabase Storage setup documentation and bucket policy checks.
- Add deeper Playwright coverage for authenticated builder save and public render flows.
- Add seed/demo data tooling for reviewer and preview environments.
- Review and harden database-level RLS policies alongside the existing app-level ownership checks.
- Add richer empty/error states in dashboard and builder workflows.

## Later Product Bets

- Custom domains after the core public-site model is stable.
- Lightweight analytics for page visits and form conversion.
- Team collaboration and roles.
- Billing and plan limits.
- Asset library management for uploaded images.
- Version history and undo/redo.
- Breakpoint-specific design controls.

## Non-Goals For Now

- Replacing Supabase Auth with an app-owned user table.
- Adding production-only secrets or service-role credentials to the repo.
- Running local development or migrations against the production Supabase project.
- Expanding into teams, billing, analytics, or custom domains before the core MVP is stable.
