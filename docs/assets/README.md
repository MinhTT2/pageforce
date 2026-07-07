# Demo Assets

This folder contains static screenshots used by `README.md` and `docs/showcase.md`.

## Screenshot Set

| File | Source route | Viewport | Notes |
| --- | --- | --- | --- |
| `screenshots/home-desktop.png` | `/` | 1440x1100 | Marketing page first viewport. |
| `screenshots/home-full-desktop.png` | `/` | 1440x1100 full page | Complete marketing page. |
| `screenshots/home-tablet.png` | `/` | 834x1112 | Tablet marketing page first viewport. |
| `screenshots/home-mobile.png` | `/` | 390x844 | Mobile marketing page first viewport. |
| `screenshots/home-mobile-full.png` | `/` | 390x844 full page | Complete mobile marketing page. |
| `screenshots/login-desktop.png` | `/login` | 1440x1000 | Auth page and builder mockup. |
| `screenshots/login-mobile.png` | `/login` | 390x844 | Mobile auth entry point. |
| `screenshots/register-desktop.png` | `/register` | 1440x1000 | Register page and builder mockup. |
| `screenshots/register-mobile.png` | `/register` | 390x844 | Mobile register entry point. |
| `screenshots/design-system-desktop.png` | `/design-system` | 1440x1100 | UI primitives and visual system. |
| `screenshots/design-system-full-desktop.png` | `/design-system` | 1440x1100 full page | Complete UI primitive gallery. |
| `screenshots/design-system-tablet.png` | `/design-system` | 834x1112 | Tablet UI primitive gallery. |
| `screenshots/design-system-mobile.png` | `/design-system` | 390x844 | Mobile UI primitive gallery. |
| `screenshots/not-found-desktop.png` | `/missing-demo-route` | 1440x900 | Polished not-found fallback. |

## Regenerate

Start the local app in one terminal:

```bash
npm run dev
```

Then capture screenshots in another terminal:

```bash
npm run demo:screenshots
```

The script uses `PLAYWRIGHT_BASE_URL` when set, otherwise it defaults to `http://127.0.0.1:3000`. The default set captures unauthenticated routes so it can be regenerated without a Supabase test account.

## Safety

The default screenshot set uses unauthenticated routes and the public not-found route so it can be regenerated without test accounts or private data.

Authenticated dashboard and builder screenshots can be added later, but only from a clean dev Supabase project. Do not capture real customer data, private emails, access tokens, service-role keys, `.env` contents, or personal browser sessions.
