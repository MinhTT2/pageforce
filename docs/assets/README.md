# Demo Assets

This folder contains static screenshots used by `README.md` and `docs/showcase.md`.

## Screenshot Set

| File | Source route | Viewport | Notes |
| --- | --- | --- | --- |
| `screenshots/home-desktop.png` | `/` | 1440x1100 | Marketing page first viewport. |
| `screenshots/login-desktop.png` | `/login` | 1440x1000 | Auth page and builder mockup. |
| `screenshots/design-system-desktop.png` | `/design-system` | 1440x1100 | UI primitives and visual system. |
| `screenshots/home-mobile.png` | `/` | 390x844 | Mobile marketing page first viewport. |

## Regenerate

Start the local app in one terminal:

```bash
npm run dev
```

Then capture screenshots in another terminal:

```bash
npm run demo:screenshots
```

The script uses `PLAYWRIGHT_BASE_URL` when set, otherwise it defaults to `http://127.0.0.1:3000`.

## Safety

The default screenshot set uses unauthenticated routes so it can be regenerated without test accounts or private data.

Authenticated dashboard and builder screenshots can be added later, but only from a clean dev Supabase project. Do not capture real customer data, private emails, access tokens, service-role keys, `.env` contents, or personal browser sessions.
