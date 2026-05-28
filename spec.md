# Spec: Mini BigC Frontend

## Objective

Build and maintain the Mini BigC frontend as an internal branch operations console for store managers and staff.

The frontend must let authenticated users:

- Log in and access protected operational pages.
- Review branch KPIs, revenue, alerts, deliveries, suggestions, and profile data.
- See role-appropriate information for `manager` and `staff` users.
- Use the application in Thai and English.
- Ask the AI branch assistant about sales, orders, stock, and branch performance.

Success means a branch user can complete daily operational checks without relying on manual reports, and protected or manager-only views behave consistently across browser refreshes and direct URL access.

## Assumptions

- The frontend package is `miniBigCProject_Frontend`.
- The application is a Next.js App Router web app, not a native mobile app.
- First-release roles are `manager` and `staff`.
- All routes under `src/app/(app)` require authentication.
- API calls should go through frontend `/api/*` paths and Next.js rewrites, not direct browser calls to backend hostnames.
- Backend APIs are expected on `http://localhost:5001` during local development.
- Some data can remain mocked or mapped locally while backend contracts mature, but page components should consume typed domain objects.

## Tech Stack

- Framework: Next.js 16.2.6 with App Router.
- Runtime UI: React 19.2.4.
- Language: TypeScript 5 with strict project settings.
- Styling: Tailwind CSS 4.3.0.
- UI primitives: Base UI and local components in `src/components/ui`.
- Icons: `lucide-react`.
- Toasts: `sonner`.
- Theme: `next-themes`.
- Unit tests: Vitest 3 with Testing Library and jsdom.
- E2E tests: Playwright.

## Commands

Run commands from `miniBigCProject_Frontend`.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test:unit
npm run test:e2e
npm run test:all
```

Local development URL:

```text
http://localhost:3000
```

Backend dependency for live data:

```text
http://localhost:5001
```

## Product Scope

### Authentication

- `/login` provides the unauthenticated sign-in experience.
- Successful login stores a client-readable role/session using the existing auth session utilities.
- Logout clears the frontend session and returns the user to `/login`.
- Direct access to protected routes without a session redirects to `/login`.
- Login must support the current demo role model and SSO callback profile data.
- Login errors must avoid exposing whether an email, employee ID, or password was the invalid field.
- The app shell must not render protected operational data before auth state is ready.

### Protected App Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/dashboard` | Branch KPI overview, urgent alerts, revenue trend, top products, delivery summary | `manager`, `staff` with staff masking where required |
| `/revenue` | Sales breakdown by time, category, payment, and forecast | `manager` only |
| `/alerts` | Low-stock and expiring-inventory warnings | `manager`, `staff` with manager-only actions hidden for staff |
| `/deliveries` | Customer delivery tracking and delivery state review | `manager`, `staff` with order values and manager actions hidden for staff |
| `/suggestions` | AI or rule-based operational recommendations | `manager` only |
| `/profile` | User profile and account settings | `manager`, `staff` |

### Shared UI

- App shell includes sidebar navigation, topbar, theme support, language toggle, and chat widget.
- Route pages should stay thin; page-level client logic belongs in `src/components/pages`.
- Charts should use local chart wrappers in `src/components/charts`.
- Reusable controls belong in `src/components/ui`.

### Localization

- Thai is the default document language.
- All user-visible labels, headings, errors, button text, and empty states must come from `getT(lang)` in `src/lib/i18n.ts`.
- New strings must be added for both `th` and `en`.

## Page-Level Requirements

### Login

Users must be able to:

- Enter email or employee ID and password.
- Submit only when required fields are present.
- See a loading state while login is being processed.
- See a localized error when credentials are rejected.
- Reach the reset-password request flow from the login page.
- Use Microsoft or Google SSO entry points when configured.

Acceptance criteria:

- Successful login redirects to `/dashboard`.
- Refreshing the browser after login preserves the authenticated role where the current session model supports it.
- Logout clears the session and prevents browser-back access to protected pages.
- Login page does not show the app shell sidebar or protected topbar.

### Dashboard

The dashboard is the first operational view after login. It should summarize the current branch situation and link users into deeper workflows.

Required content:

- Crisis-management or executive summary section for the selected branch.
- Revenue highlight and comparison against prior period.
- Delivery/OTIF summary.
- Stock alert summary for low stock, expiring items, and risk indicators.
- Top-product or performance tiles.
- AI-generated or backend-provided branch summary when available.
- Export action for dashboard evidence rows.
- Refresh action using the shared branch refresh flow.

Acceptance criteria:

- Dashboard content is derived from `BranchDataProvider`.
- Clicking linked fact cards routes to the relevant page section where a hash target exists.
- Staff users can access the dashboard but must not see unmasked manager-only commercial values.
- Loading, empty, and backend-error states are visible and do not leave blank panels.

### Revenue

The revenue page is a manager-only performance analysis view.

Required content:

- Day, month-to-date, and year-to-date range controls.
- Revenue actuals and comparison totals.
- Gap value and percentage.
- Transaction estimate and average basket.
- Category pacing and drag contributors.
- Top product gains and losses.
- Payment mix.
- Export action for the active revenue view.

Acceptance criteria:

- Staff users see the shared restricted-access state, not revenue details.
- Range controls update charts, metrics, and export contents together.
- Duplicate products and payment methods are de-duplicated before rendering summary lists.
- Revenue charts render a clear empty state when the backend returns no chartable values.

### Alerts

The alerts page helps users act on out-of-stock, expiring, and slow-moving inventory risk.

Required content:

- Tabs for stock-out or low-stock risk, expiring inventory, and slow-moving inventory.
- Search input.
- Filter dialog with category filters, Top-30-only option where applicable, and hide-acknowledged option.
- Priority indicators for urgent, warning, and lower-priority rows.
- Acknowledge action for operational follow-up.
- Manager-only action controls for commercial or supplier decisions.
- Export action for the current alert view.

Acceptance criteria:

- Staff users can view alerts but cannot see manager-only actions.
- Filters can be applied, cleared, and represented as visible chips.
- Acknowledged rows can be hidden without deleting underlying data.
- Inventory rows use keys that account for duplicate SKUs across locations or expiry dates.

### Deliveries

The deliveries page tracks Mini BigC-to-customer fulfillment and delivery risk.

Required content:

- Active and completed delivery tabs.
- Status and late-only filters.
- OTIF metric against target.
- Open delivery count, late delivery count, and operational value summary.
- Root-cause indicators that connect late delivery risk to stock, picking, or driver state.
- Driver performance summary.
- Delivery detail selection.
- Refresh action through shared branch refresh.

Acceptance criteria:

- Staff users can access deliveries but order values and manager actions are hidden or masked.
- Late deliveries are visually distinguishable and filterable.
- Delivery selection does not break when the selected delivery disappears after refresh.
- Empty active/completed tabs show an explicit localized empty state.

### Suggestions

The suggestions page is a manager-only action-planning view. It converts alert, revenue, and event signals into recovery actions.

Required content:

- All, quick-win, 1-2 week, and monthly-plus planning tabs.
- Suggestions from backend promotions and events.
- Generated actions from low-stock and expiring-inventory data.
- Priority, effort, confidence, expected upside, owner, and action window.
- Review or launch dialog for a selected action.
- Export action for the suggestion plan.

Acceptance criteria:

- Staff users see the shared restricted-access state.
- Suggestions reconcile with source pages: alert-derived actions should match alert counts and value-at-risk.
- Confidence drives priority consistently.
- Empty suggestions show a clear state instead of hiding the page body.

### Profile

The profile page lets authenticated users review and locally update account-facing information.

Required content:

- Profile summary with initials, role, employee ID, and branch.
- Personal details tab for name, email, phone, employee ID, role, and branch.
- Security tab for password and two-factor controls.
- Edit, cancel, and save states for editable personal fields.
- Password visibility controls where password fields are shown.

Acceptance criteria:

- Both manager and staff roles can access profile.
- Name, email, and phone are required before saving.
- Email format is validated before saving.
- Local profile overrides update the displayed shell profile without a full page reload.
- Disabled fields remain readable and visually distinct from editable fields.

### AI Chat

The chat widget is shared across protected app pages.

Required behavior:

- Open and close from the app shell.
- Preserve a short conversation during the current session.
- Send user questions to the AI chat API helper.
- Show loading, error, user, and assistant states.
- Keep input controls keyboard accessible.

Acceptance criteria:

- AI chat failures do not break the current page.
- The widget never covers required primary actions on mobile without a close affordance.
- Chat copy is localized.

## Project Structure

```text
miniBigCProject_Frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/login/        # Login route
│   │   ├── (app)/               # Protected app routes
│   │   ├── api/auth/            # Auth route handlers
│   │   ├── globals.css          # Global Tailwind theme and base styles
│   │   └── layout.tsx           # Root providers, metadata, fonts
│   ├── components/
│   │   ├── auth/                # Route guards
│   │   ├── charts/              # Chart components
│   │   ├── chat/                # AI chat widget
│   │   ├── layout/              # App shell, sidebar, topbar, notifications
│   │   ├── pages/               # Page-level client components
│   │   └── ui/                  # Reusable primitives
│   ├── config/                  # Runtime environment helpers
│   ├── hooks/                   # Shared React hooks
│   ├── lib/
│   │   ├── api/                 # API clients and mappers
│   │   ├── auth-session.ts      # Browser session utilities
│   │   ├── branch-data.ts       # Domain data builders
│   │   ├── i18n.ts              # Thai and English translations
│   │   └── user-data.ts         # Local profile data
│   ├── providers/               # Branch and shell data providers
│   └── types/                   # Shared TypeScript types
├── e2e/                         # Playwright tests
├── public/                      # Static assets
├── vitest.config.ts             # Unit test config
├── playwright.config.ts         # E2E test config
└── ROLE_RESTRICTED_APIS.md      # Route and API access map
```

## Code Style

Use TypeScript, React function components, explicit domain types, and `@/` imports.

```tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n";
import type { Lang, Role } from "@/types";

interface RefreshButtonProps {
  lang: Lang;
  role: Role;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function RefreshButton({
  lang,
  role,
  isRefreshing,
  onRefresh,
}: RefreshButtonProps) {
  const tx = getT(lang);
  const canRefresh = role === "manager";

  return (
    <Button
      type="button"
      disabled={!canRefresh || isRefreshing}
      onClick={onRefresh}
    >
      {tx.common.refresh}
    </Button>
  );
}
```

Conventions:

- Use `"use client"` only for components that need hooks, browser APIs, event handlers, or client context.
- Keep `src/app/**/page.tsx` files thin and delegate UI work to `src/components/pages`.
- Use `@/` imports instead of deep relative imports.
- Prefer Tailwind utility classes over inline styles.
- Use inline styles only for dynamic values that cannot be represented cleanly with Tailwind classes.
- Use `lucide-react` icons for actions when an icon exists.
- Keep React list keys unique across the rendered tree by including parent identifiers.
- Keep user-visible text out of components except through `getT(lang)`.
- Map raw API payloads in `src/lib/api/mappers.ts` before they reach page components.

## Data And API Rules

- Client-side API helpers live in `src/lib/api`.
- API paths should use local `/api/*` routes or helpers that resolve through `apiUrl`.
- Do not call `http://localhost:5001` directly from browser components.
- Include the current role with API requests through `X-User-Role` when role-restricted data is involved.
- Treat API errors as user-visible states with localized copy.
- Preserve `cache: "no-store"` for operational data that should refresh on demand.

Primary dashboard data source:

```http
GET /api/v1/dashboard
```

AI chat source:

```http
POST /api/v1/ai/chat
```

Store list source for manager branch switching:

```http
GET /api/v1/stores
```

Store-specific dashboard source:

```http
GET /api/v1/stores/{storeId}/dashboard
```

### Branch Data Provider Contract

`BranchDataProvider` is the main client-side data boundary for operational pages.

It must expose:

- `data`: mapped `BranchData` domain object.
- `branches`: available branch options for the current user.
- `selectedBranchId`: selected branch ID or `null`.
- `loading`: first-load state.
- `isRefetching`: refresh state after data is already visible.
- `error`: fetch or mapping error message.
- `lastFetchedAt`: last successful load timestamp.
- `selectBranch(branchId)`: manager-only branch switch.
- `refetch()`: reload the current branch.

Provider behavior:

- Manager users fetch `/api/v1/stores`, resolve a selected store, then fetch store dashboard data.
- Staff users fetch dashboard data for their assigned store and receive a single branch option.
- Selected branch ID is persisted in session storage only when it is valid for the manager.
- Stale requests must not overwrite newer request results.
- If the user is not authenticated, provider fetches must not run.

### Data State Requirements

Every page that consumes branch data must define UI for:

- First load.
- Refetch in progress while existing data remains visible.
- Empty data.
- Backend or mapping error.
- Restricted access.

Operational data should keep the previous successful render visible during refetch unless the selected branch changes and stale data would be misleading.

### API Error Handling

- Non-2xx responses should throw `ApiError` with status and user-safe detail.
- API helpers should prefer backend `error` fields when present.
- Pages should not render raw stack traces or unlocalized technical errors to store users.
- Unauthorized or forbidden responses should lead to either login redirect or restricted-access UI depending on context.

## Role And Access Rules

- `manager` can access all current app pages.
- `staff` can access dashboard, alerts, deliveries, and profile.
- `staff` must see a restricted-access message on revenue and suggestions.
- Staff-facing views must hide or mask manager-only values and actions.
- Route protection belongs in `src/components/auth`, not directly in page files.
- Role restrictions should be tested at route and visible-control levels.

Role-sensitive data rules:

| Data or control | Manager | Staff |
| --- | --- | --- |
| Revenue totals and trend details | Visible | Masked or hidden outside allowed summaries |
| Revenue page | Visible | Restricted state |
| Suggestions page | Visible | Restricted state |
| Alert acknowledge | Visible | Visible if operational only |
| Alert commercial actions | Visible | Hidden |
| Delivery order value | Visible | Hidden or masked |
| Delivery manager actions | Visible | Hidden |
| Branch switcher | Visible when multiple stores exist | Hidden |
| Profile | Visible | Visible |

## UI And UX Requirements

- The app should feel like an operational retail tool: dense enough for scanning, restrained, and task-focused.
- Navigation must be predictable across desktop and mobile.
- Loading, empty, error, and restricted states must be explicit.
- Tables and charts must not overflow their containers on mobile.
- Text must not overlap or clip in buttons, cards, tabs, dialogs, or navigation items.
- Common actions should use icons with accessible names or visible labels.
- Cards are appropriate for repeated content blocks and dashboard widgets, not nested decorative containers.

### Responsive Requirements

Minimum supported layouts:

- Mobile: 390px wide.
- Tablet: 768px wide.
- Desktop: 1280px wide and above.

Responsive behavior:

- Sidebar collapses or becomes a drawer on small screens.
- Topbar controls wrap or collapse without overlapping search, user, language, or notification controls.
- Tables may transform into stacked rows or horizontal scroll containers, but page-level horizontal scroll should be avoided.
- Filter dialogs and sheets must fit within mobile viewport height.
- Chart labels must remain readable or reduce density on mobile.

### Accessibility Requirements

- Interactive controls must be reachable by keyboard.
- Icon-only controls need accessible names through visible text, `aria-label`, or tooltip-backed labels.
- Inputs must have associated labels.
- Dialogs must trap focus and provide clear close/cancel paths.
- Color cannot be the only signal for urgent, warning, success, or restricted states.
- Text/background contrast should be sufficient in light and dark themes.
- Loading states should announce progress through visible text or stable affordances.

### Visual Design Requirements

- Use the existing theme tokens in `src/app/globals.css`.
- Prefer restrained dashboard density over marketing-style sections.
- Do not introduce decorative gradient blobs or unrelated illustrations.
- Use consistent spacing across page sections: compact vertical rhythm for operational scanning.
- Keep card radius and border treatments consistent with existing `src/components/ui/card.tsx`.
- Use badges for statuses and priority only when the text remains readable in both themes.

## Non-Functional Requirements

- Initial protected page render should avoid avoidable layout shift.
- Data refresh should not block navigation.
- CSV exports should complete on the client without server round trips.
- Client-side computations over dashboard data should remain memoized when they are derived from large arrays.
- Development console should be free of React key warnings, hydration warnings, and uncaught promise errors.
- The app should continue to render a usable shell if optional AI endpoints fail.
- Backend outage should produce recoverable error states on operational pages.

## Testing Strategy

### Unit Tests

Use Vitest for:

- Pure utilities in `src/lib`.
- API mappers and formatting helpers.
- Session helpers where jsdom is sufficient.
- Role and localization helper behavior.
- CSV export row builders.
- Filtering and priority helper functions.

Command:

```bash
npm run test:unit
```

Suggested unit coverage:

- `src/lib/download-csv.ts`: escaping, filename generation, row serialization.
- `src/lib/format.ts`: money, number, percent, and date formatting.
- `src/lib/api/mappers.ts`: dashboard API to `BranchData` mapping, missing-field defaults, duplicate handling.
- `src/lib/auth-session.ts`: read/write/clear/subscribe behavior.
- `src/lib/profile-session.ts`: profile overrides and initials generation.
- Page helper functions that calculate totals, gaps, priorities, filters, or export rows.

### E2E Tests

Use Playwright for:

- Login flow.
- Protected route redirects.
- Manager versus staff page access.
- Sidebar/topbar navigation.
- Mobile layout sanity checks for primary pages.
- Branch switching for managers.
- CSV export action availability.
- Restricted page direct URL navigation.

Command:

```bash
npm run test:e2e
```

Suggested E2E scenarios:

- Anonymous user visiting `/dashboard` is redirected to `/login`.
- Manager logs in and can visit every route in the sidebar.
- Staff logs in and sees restricted UI for `/revenue` and `/suggestions`.
- Staff does not see manager-only alert and delivery actions.
- Manager can refresh branch data without losing the current page.
- Mobile user can open sidebar, navigate, open filters, and close dialogs.
- Language toggle changes visible navigation and page labels.

### Build And Lint

Every meaningful frontend change should pass:

```bash
npm run lint
npm run build
```

Run `npm run test:all` before merging changes that affect routing, auth, role restrictions, data mapping, or major UI workflows.

## Boundaries

Always:

- Keep protected routes behind `RequireAuth`.
- Add Thai and English translations together.
- Use typed domain objects at component boundaries.
- Reuse existing `src/components/ui` primitives before adding new primitives.
- Keep manager/staff behavior aligned with `ROLE_RESTRICTED_APIS.md`.
- Run the smallest relevant test first, then broader validation before handoff.

Ask first:

- Adding a new runtime dependency.
- Changing route names, navigation IA, or role permissions.
- Replacing the auth/session model.
- Changing backend API contracts.
- Introducing a new charting, state management, or styling library.
- Removing existing user-visible functionality.

Never:

- Commit secrets, tokens, passwords, or real customer data.
- Put backend hostnames directly in client components.
- Hardcode user-visible strings in only one language.
- Bypass route guards by adding protected pages outside `src/app/(app)`.
- Remove failing tests to make a build pass.
- Rewrite shared UI primitives for a single page-specific need.

## Success Criteria

- `npm run build` completes successfully.
- `npm run lint` completes successfully.
- `npm run test:unit` passes.
- `npm run test:e2e` passes for authentication and protected app navigation.
- Direct navigation to protected routes without a session redirects to `/login`.
- Manager-only pages are unavailable to staff users.
- Thai and English UI strings are present for every new visible string.
- Primary desktop and mobile viewports show no clipped or overlapping critical UI.

## Implementation Checklist

- [ ] Confirm route inventory under `src/app/(auth)` and `src/app/(app)` matches this spec.
- [ ] Confirm `ROLE_RESTRICTED_APIS.md` matches actual route guards and visible controls.
- [ ] Confirm all page-level visible strings are routed through `getT(lang)` or intentionally local constants with both languages.
- [ ] Confirm branch data fetches use `src/lib/api` helpers and include role headers.
- [ ] Confirm dashboard, revenue, alerts, deliveries, suggestions, profile, and chat have loading/error/empty states.
- [ ] Confirm manager/staff masking works after direct URL navigation and browser refresh.
- [ ] Add or update unit tests for changed mappers, formatters, exports, filters, and session helpers.
- [ ] Add or update Playwright tests for any changed auth, navigation, role restriction, or responsive workflow.
- [ ] Run `npm run lint`, `npm run build`, and the relevant test commands before handoff.

## Detailed Data Contract

The frontend consumes backend API JSON in `src/types/api.ts` and maps it to UI domain types in `src/types/index.ts` and `src/lib/branch-data.ts`.

### API Store

Required backend fields:

| Field | Type | Required | Usage |
| --- | --- | --- | --- |
| `id` | number | yes | Branch selector, selected branch persistence, provider identity |
| `code` | string | yes | Store display, export context, diagnostics |
| `name_th` | string | yes | Thai store name |
| `name_en` | string | yes | English store name |
| `short_name_th` | string | yes | Thai compact store label |
| `short_name_en` | string | yes | English compact store label |
| `address_th` | string | yes | Thai branch address |
| `address_en` | string | yes | English branch address |
| `manager_name_th` | string | yes | Manager profile fallback |
| `manager_name_en` | string | yes | Manager profile fallback |
| `manager_initials` | string | yes | Manager avatar fallback |
| `staff_name_th` | string | yes | Staff profile fallback |
| `staff_name_en` | string | yes | Staff profile fallback |
| `staff_initials` | string | yes | Staff avatar fallback |

Mapping requirements:

- Store name fields map to localized `store.name`.
- Short names map to localized `store.short`.
- Address fields map to localized `store.address`.
- Missing bilingual values should degrade to the available language only as a defensive fallback; the backend contract still requires both languages.

### API Sales

Hourly sales:

| Field | Type | Constraint | Usage |
| --- | --- | --- | --- |
| `hour` | number | `0 <= hour <= 23` | Hourly charts and sparkline order |
| `sales_value` | number | `>= 0` | Current actual |
| `comparison_sales_value` | number | `>= 0` | Delta and gap calculation |
| `sale_date` | string | ISO date/time parseable | Ordering and export context |

Daily sales:

- `sales_value` maps to current daily series.
- `comparison_sales_value` maps to comparison daily series.
- Rows must sort by `sale_date` ascending before chart rendering.

Monthly sales:

- `year` and `month` map to YTD and monthly trend views.
- `month` must be `1` through `12`.
- Rows must sort by `year`, then `month`.

Frontend calculation requirements:

- Percent change must avoid division by zero and return `0` or a deliberate empty display when no comparison exists.
- Money displays must use `fmtMoney`, not raw `toLocaleString` in page code.
- Chart arrays must remain stable for the selected range to prevent visual jumping during rerenders.

### API Category Sales

Required fields:

- `category_id`
- `name_th`
- `name_en`
- `color`
- `sales_value`
- `share`
- `trend_percent`

Mapping requirements:

- `name_th` and `name_en` map to `Category.th` and `Category.en`.
- `sales_value` maps to `Category.v`.
- `share` maps to decimal share used by donut/category displays.
- `trend_percent` maps to `Category.trend`.
- `color` should be used only if valid; otherwise fall back to design-token colors.

### API Payment Mix

Required fields:

- `payment_method_id`
- `name_th`
- `name_en`
- `share`

Requirements:

- Payment methods should be de-duplicated before summary display.
- Share values should be treated as decimal fractions unless a backend contract explicitly changes them.
- The UI should not assume the number of payment methods is fixed.

### API Top Products

Required fields:

- `sku`
- `name_th`
- `name_en`
- `sold_quantity`
- `sales_value`
- `trend_percent`

Requirements:

- `sku` is the stable identity for product de-duplication.
- `sold_quantity` maps to `Product.sold`.
- `sales_value` maps to `Product.value`.
- `trend_percent` maps to `Product.trend`.
- Duplicate SKUs across dates should be collapsed or intentionally presented by date, depending on page context.

### API Inventory And Alerts

Low-stock alert required fields:

- `sku`
- `name_th`
- `name_en`
- `category_id`
- `category_th`
- `category_en`
- `stock_quantity`
- `reorder_quantity`
- `location_code`

Expiring inventory required fields:

- `sku`
- `name_th`
- `name_en`
- `category_id`
- `category_th`
- `category_en`
- `expiry_date`
- `stock_quantity`
- `location_code`
- `price`

Requirements:

- `expiry_date` must parse to a valid `Date`.
- Value at risk is computed as `stock_quantity * price`.
- Low-stock severity derives from current stock versus reorder quantity and page-level priority rules.
- Row identity must include SKU plus location or expiry context where duplicate SKUs are possible.

### API Deliveries

Required fields:

- `id`
- `customer_name_th`
- `customer_name_en`
- `address_th`
- `address_en`
- `item_count`
- `order_value`
- `driver_name_th`
- `driver_name_en`
- `status`
- `eta_time`
- `is_late`
- `distance_km`

Supported frontend statuses:

| API status | Domain status | Display |
| --- | --- | --- |
| `preparing` | `preparing` | Picking/packing state |
| `enRoute` | `enRoute` | Driver is on route |
| `delivered` | `delivered` | Completed state |

Requirements:

- Unknown statuses should not crash the UI; they should map to the closest safe display or an explicit unknown state if added.
- `order_value` is manager-sensitive.
- `distance_km` should be numeric and non-negative.
- `eta_time` should be display-safe even if not a full timestamp.

### API Suggestions

Required fields:

- `id`
- `kind`
- `icon`
- `title_th`
- `title_en`
- `description_th`
- `description_en`
- `upside_value`
- `confidence`
- `duration_th`
- `duration_en`
- `target_th`
- `target_en`
- `type`

Requirements:

- `confidence` should be a decimal between `0` and `1`.
- Suggestions page derives priority from confidence.
- Unknown icons must map to a safe default icon.
- Suggestion rows should preserve stable IDs for dialogs and exports.

## User Flows

### Manager Daily Review Flow

1. Manager opens `/login`.
2. Manager signs in and lands on `/dashboard`.
3. Dashboard loads store list and selected branch data.
4. Manager reviews executive summary, revenue, alerts, deliveries, and suggestions.
5. Manager opens `/revenue` from a dashboard fact card or sidebar.
6. Manager changes range between day, MTD, and YTD.
7. Manager exports revenue evidence rows.
8. Manager opens `/alerts`, filters urgent low-stock items, and acknowledges operational rows.
9. Manager opens `/deliveries`, filters late deliveries, and reviews driver/root-cause data.
10. Manager opens `/suggestions`, reviews recovery actions, and exports a plan.

Acceptance criteria:

- Each page transition preserves app shell state.
- Selected branch persists within the browser session.
- Refresh actions update operational data without logging the user out.
- Exports reflect the active branch, active language, and active filters/range where applicable.

### Staff Operational Flow

1. Staff signs in and lands on `/dashboard`.
2. Staff sees operational dashboard data with manager-only commercial values masked or hidden.
3. Staff opens `/alerts` to identify urgent stock tasks.
4. Staff uses search/filter controls to narrow stock tasks.
5. Staff acknowledges operational alert rows where allowed.
6. Staff opens `/deliveries` to monitor active deliveries.
7. Staff attempts `/revenue` or `/suggestions` and sees restricted access messaging.

Acceptance criteria:

- Staff cannot reach manager-only detail through direct URL access.
- Staff cannot reveal manager-only values by using export buttons, browser refresh, or hash navigation.
- Staff-visible workflows remain useful even when commercial values are hidden.

### Branch Switching Flow

1. Manager signs in.
2. Provider loads store list.
3. Manager selects another branch.
4. Provider persists selected branch ID in session storage.
5. Provider fetches the selected branch dashboard.
6. All pages render the newly selected branch.

Acceptance criteria:

- Invalid stored branch IDs are ignored.
- Staff users cannot switch branches.
- In-flight stale branch requests do not overwrite the latest selected branch.
- UI communicates refetch progress.

### Language Switching Flow

1. User clicks language toggle in topbar.
2. App shell updates `lang`.
3. Current page rerenders with translated labels.
4. Domain data uses localized fields without refetching unless the backend contract requires it.

Acceptance criteria:

- Navigation, headings, controls, empty states, restricted states, and dialogs update language.
- Active page state is preserved across language toggle.
- Exported labels use the active language.

## Component Responsibilities

### App Shell

Owns:

- Sidebar layout and mobile drawer behavior.
- Topbar controls.
- Current language.
- Current role.
- Current user profile display.
- Logout behavior.
- Chat widget placement.

Must not own:

- Page-specific filter state.
- Dashboard calculations.
- API mapping logic.

### Branch Data Provider

Owns:

- Dashboard and branch fetch lifecycle.
- Store list for managers.
- Selected branch session persistence.
- Loading, refetching, error, and last-fetched state.

Must not own:

- Page-level filters.
- Role-specific display masking beyond fetch/access behavior.
- CSV export formatting.

### Page Components

Own:

- Page-specific derived metrics.
- Active tabs/ranges/filters.
- Visible restricted/empty/error states.
- Export button behavior.
- Page-specific dialogs.

Must not own:

- Direct backend URLs.
- Raw API response shape assumptions beyond typed mapped data.
- Cross-page app shell state.

### UI Primitives

Own:

- Visual consistency.
- Accessible focus, disabled, hover, active, and loading states.
- Theme-compatible styling.

Must not own:

- Business rules.
- Role decisions.
- API calls.

## State Management Requirements

### Session State

- Auth role is stored through `auth-session.ts`.
- Profile overrides are stored through `profile-session.ts`.
- Selected branch ID is stored in `sessionStorage`.
- State reads that depend on `window` must be guarded for server rendering.

### Page State

Page state may include:

- Active tab.
- Active range.
- Search query.
- Filter draft.
- Applied filters.
- Dialog open state.
- Selected row ID.
- Exported confirmation state.

Rules:

- Draft filters should not mutate applied filters until user applies them.
- Clear filters must return to documented defaults.
- Selected row IDs must be revalidated after data refresh.
- Temporary exported states should timeout and not block repeated export.

### Derived State

Derived metrics should use `React.useMemo` when:

- Filtering arrays.
- Sorting lists.
- Computing totals over arrays.
- Generating chart series.
- Building export rows.

Derived state should not be stored in React state unless user interaction changes it independently.

## Loading And Error State Matrix

| State | Trigger | Required UI |
| --- | --- | --- |
| Auth not ready | Initial app render | Do not flash protected content |
| Unauthenticated | No role/session | Redirect or show login route |
| First data load | Provider starts initial fetch | Skeleton or stable loading surface |
| Refetch | User refreshes existing data | Keep previous data visible and show spinner |
| Empty dashboard | API returns valid empty arrays | Empty state explaining no data |
| API error | Fetch or mapping fails | Error state with retry path |
| Restricted | Role lacks page access | Localized restricted message |
| Export success | CSV download created | Short success affordance |
| Export failure | Serialization/download fails | Toast or inline error |

## CSV Export Requirements

General rules:

- Use `downloadCsv` and page export builders.
- Escape commas, quotes, and line breaks.
- Include enough context for offline review: branch, page, active range/filter, metric labels, values.
- Use active language for labels.
- Do not include staff-hidden manager-only fields in staff exports.
- File names should use stable prefixes and timestamp-safe strings.

Page export requirements:

| Page | Export scope |
| --- | --- |
| Dashboard | Fact cards, joint commit/action context, branch summary |
| Revenue | Active range, revenue actual/comparison, category/product/payment rows |
| Alerts | Active tab, filters, alert rows, value-at-risk where visible |
| Suggestions | Active plan tab, action rows, upside/confidence/owner/window |

## Accessibility Test Matrix

Manual or automated checks should cover:

- Login form labels and submit disabled state.
- Sidebar navigation by keyboard.
- Mobile sidebar open and close by keyboard.
- Tabs with arrow-key or tab navigation where supported by primitive.
- Filter dialog focus management.
- Dialog escape/close behavior.
- Icon-only buttons accessible names.
- Theme contrast in light and dark mode.
- Form validation errors readable by screen readers where practical.
- AI chat input and send behavior by keyboard.

## Responsive Test Matrix

Minimum viewport checks:

| Viewport | Required checks |
| --- | --- |
| `390x844` | Login, sidebar drawer, dashboard cards, alert filters, delivery list, chat widget |
| `768x1024` | App shell, topbar wrapping, charts, tables, dialogs |
| `1280x800` | Full desktop shell, dashboard density, chart sizing |
| `1440x900` | Common desktop workflow and no excessive empty spacing |

Failure conditions:

- Body-level horizontal scrolling caused by page content.
- Text clipped inside controls.
- Buttons changing size when icons or labels change.
- Dialogs extending outside viewport without scroll.
- Chat widget blocking required actions without a close control.

## Observability And Diagnostics

The frontend should make debugging user reports practical.

Requirements:

- API helper errors should preserve HTTP status in `ApiError`.
- Pages should expose user-safe errors but retain enough developer signal in caught errors.
- Avoid swallowing errors silently except for explicitly optional flows.
- Console should not contain React key warnings, hydration mismatches, unhandled promise rejections, or invalid DOM nesting warnings.
- Data freshness should be visible where the UI has `lastFetchedAt`.

## Security And Privacy

Rules:

- Do not store secrets in localStorage, sessionStorage, or client bundle.
- Role stored in the frontend is demo/session state and must not be treated as production-grade authorization.
- Do not render raw backend error details if they can contain internal implementation information.
- Do not include sensitive customer data in exports beyond current product scope.
- Do not pass manager-only values to staff-only components when avoidable; hide at data derivation boundaries as well as rendering boundaries.

## Frontend-Backend Alignment

The frontend and backend specs must remain aligned on:

- Route paths.
- Role restrictions.
- Dashboard aggregate field names.
- AI chat request/response shape.
- Store selection behavior.
- Error status expectations.
- Bilingual field requirements.

Any change to one side should update both specs in the same work item when the contract changes.

## Suggested Delivery Phases

### Phase 1: Contract Stability

- Freeze `/api/v1/dashboard` shape.
- Confirm role restrictions against `ROLE_RESTRICTED_APIS.md`.
- Add mapper tests for all dashboard fields.
- Add API tests for manager/staff access.

### Phase 2: UX State Completion

- Audit all pages for loading, empty, error, refetch, and restricted states.
- Add responsive checks for mobile and desktop.
- Add missing localization keys.

### Phase 3: Operational Actions

- Decide which alert, delivery, profile, and suggestion actions become backend-backed writes.
- Specify write request/response contracts before implementation.
- Add optimistic or pessimistic UI behavior per action.

### Phase 4: Production Auth Readiness

- Replace demo role trust with backend-authenticated identity.
- Update frontend session model.
- Update protected route behavior.
- Update API helper credential behavior.

## Open Questions

- Should authentication remain localStorage-based for the frontend demo, or move to a server-managed session once backend auth is ready?
- Should manager-only data be filtered by the backend, the frontend, or both?
- Which dashboard widgets must use real backend APIs first when mock data is phased out?
- What are the required browser support targets for store devices?
- Should AI suggestions be generated live, cached from backend analysis, or rule-based for the first release?
- Should staff users have branch switching in any future multi-branch support scenario?
- Should CSV exports include masked fields for staff, omit those columns, or block export entirely?
- What are the required SLA and freshness expectations for dashboard data?
- Which SSO providers are first-release commitments versus demo-only entry points?
