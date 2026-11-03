# Jetrav — user app

Customer-facing travel account served at **https://user.jetrav.com** (Next.js 16, App Router).
Customers sign in with their mobile number, follow their trip requests and quotations,
check their Jet Points balance and buy or change a plan (Razorpay).

## Development

```bash
pnpm --filter user dev        # http://localhost:3002
pnpm --filter user build
pnpm --filter user check-types
```

Environment (`.env.local` / `.env.production`):

| Variable              | Example                  |
| --------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080`  |
| `NEXT_PUBLIC_WS_URL`  | `ws://localhost:8080`    |

## Structure

- `app/(auth)` — sign in, sign up, OTP (views from `@repo/auth`); `/signin` and `/signup` are indexable.
- `app/(pages)` — signed-in pages inside the app shell: dashboard, accounts, profile.
- `app/(standalone)` — full-width signed-in pages (plan selection and checkout).
- `components/layout` — `AppShell` (sidebar/header) and `AccountProvider` (profile + subscription, loaded once).
- `lib/constants.ts` — every API URL; `lib/useApiQuery.ts` — abortable GET hook with loading/error/reload.
- `proxy.ts` — redirects based on the `user_refresh_token` cookie; the backend still authorises every request.

UI comes from `@repo/ui` (design tokens in `packages/ui/styles/css/variable.css`); use its
semantic tokens (`--surface-*`, `--text-*`, `--accent`, `--space-*`…) instead of raw colours.
