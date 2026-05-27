<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Mini BigC Frontend — Agent Guide

## What this app is

A retail branch operations dashboard for Big C store managers and staff. Pages: Dashboard (KPIs), Revenue (sales breakdown), Deliveries (real-time tracking), Alerts (stock/expiry warnings), Suggestions (AI recommendations), Profile (settings).

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript 5 (strict) |
| UI | React 19.2.4 |
| Styling | Tailwind CSS 4.3.0 |
| Icons | Lucide React |
| Toasts | Sonner |
| Components | Base UI + custom `src/components/ui/` |
| Auth | Client-side only, localStorage via `lib/auth-session.ts` |
| i18n | Thai / English via `lib/i18n.ts` |
| Backend proxy | `http://localhost:5001` (rewrites in `next.config.ts`) |

## Project layout

```
src/
├── app/
│   ├── (auth)/          # /login — unauthenticated route group
│   └── (app)/           # protected route group
│       ├── dashboard/
│       ├── revenue/
│       ├── deliveries/
│       ├── alerts/
│       ├── suggestions/
│       └── profile/
├── components/
│   ├── ui/              # Reusable primitives (button, card, dialog…)
│   ├── layout/          # AppShell, Sidebar, Topbar
│   ├── pages/           # One file per page (heavy client components)
│   ├── charts/          # Bar, line, donut, sparkline wrappers
│   └── auth/            # Route guard components
├── lib/
│   ├── api/             # fetch helpers, mappers, dashboard data
│   ├── auth-session.ts  # read/write localStorage auth state
│   ├── branch-data.ts   # shared data types & builder functions
│   ├── i18n.ts          # getT(lang) → typed translation object
│   └── user-data.ts     # mock user profiles
├── hooks/               # use-mobile, use-hash-scroll
├── providers/           # AppShellProvider (auth/lang), BranchDataProvider
└── types/               # shared TypeScript interfaces
```

## Conventions

### Components
- Mark anything with event handlers, hooks, or browser APIs as `"use client"`.
- Server Components are the default; only opt into client where required.
- Page-level logic lives in `src/components/pages/<page>.tsx`, keeping `app/(app)/<page>/page.tsx` thin.

### Imports
- Use the `@/` alias for all project imports (`@/components/ui/button`, `@/lib/i18n`).
- Never use relative `../../../` paths.

### Styling
- Tailwind utility classes only — no inline `style={{}}` except for dynamic values (colors, percentages) that cannot be expressed as utilities.
- Dark mode is handled via Tailwind's `dark:` variant; the theme toggle sets a class on `<html>`.

### Localization
- Every user-visible string must come from `getT(lang)` — never hardcode Thai or English text.
- `lang` flows from `AppShellProvider`; consume it via the provider context.

### Lists & keys
- React list keys must be **globally unique within the rendered tree**. Never use `item.name` or another value that repeats across siblings (e.g. the same payment method appearing in multiple branches). Compose keys: `` `${parentId}-${item.id}-${index}` ``.

### Data fetching
- All fetching is client-side inside context providers or page components.
- API calls go through Next.js rewrites (`/api/*` → `localhost:5001/*`); never call the backend URL directly from client code.
- Mappers in `lib/api/` translate raw API shapes to typed domain objects before they reach components.

### Auth
- Role is stored in localStorage by `auth-session.ts`. Read it only on the client (inside `useEffect` or behind a `"use client"` boundary).
- Route protection is handled by components in `src/components/auth/` — do not add redirect logic in page files.

## Common pitfalls

- **Duplicate React keys** — see "Lists & keys" above. Always include a stable unique parent segment in the key.
- **Next.js 16 API differences** — async `params`/`searchParams` props, updated `<Image>` defaults, revised metadata API. Check `node_modules/next/dist/docs/` when in doubt.
- **React 19 strict double-invocation** — effects and renderers run twice in development. Do not use `useEffect` to initialise state that should only run once; use `useRef` or an initialiser function.
- **Tailwind 4 syntax** — the `@apply` directive and some v3 utilities changed. Prefer direct class composition over `@apply`.

## Running locally

```bash
npm install
npm run dev      # starts on http://localhost:3000
```

Backend must be running on port 5001 for API calls to resolve.
