# Auction Web App

`apps/web` is the Next.js frontend for the Auction platform. It uses the App Router, React Query for client-side server state, Tailwind CSS v4 utility classes, and feature-based modules under `features/`.

This README documents the conventions expected in this app so a new developer can make changes without guessing where things belong.

## Quick Start

Run from the repository root:

```bash
npm -w web run dev
npm -w web run build
npm -w web run lint
npm.cmd exec -w web tsc -- --noEmit
```

On Windows PowerShell, `npm` may be blocked by execution policy. Use `npm.cmd` instead:

```bash
npm.cmd -w web run dev
npm.cmd exec -w web tsc -- --noEmit
```

The dev server is configured as:

```bash
next dev --webpack
```

## Top-Level Structure

```text
apps/web
|-- app/                 Next.js routes, route groups, layouts, metadata
|-- features/            Domain-specific UI, hooks, services, types, utils
|-- shared/              Cross-feature layout, providers, theme, generic helpers
|-- public/              Static assets served by Next.js
|-- globals.css          Theme tokens and global styles
|-- next.config.ts       Next.js config
|-- tsconfig.json        TypeScript config with @/* path alias
`-- package.json         Web workspace scripts and dependencies
```

The `@/*` import alias points to `apps/web/*`.

Prefer:

```ts
import { EditProfilePage } from "@/features/profile/components/edit-profile-page";
```

Avoid deep relative imports across domains:

```ts
import { EditProfilePage } from "../../../features/profile/components/edit-profile-page";
```

## Routing Conventions

Routes live under `app/`. Route groups are used to organize layouts without adding URL segments:

```text
app/
|-- (auth)/       /login, /register, /forgot-password, /reset-password
|-- (public)/     Public auction pages
|-- (profile)/    /profile and profile subpages
|-- (seller)/     /seller pages
`-- (admin)/      /admin pages
```

Keep `app/**/page.tsx` files thin. A page should usually import a feature component and render it:

```tsx
import { ProfileOverviewPage } from "@/features/profile/components/profile-overview-page";

export default function ProfilePage() {
  return <ProfileOverviewPage />;
}
```

Use `app/**/layout.tsx` for route shell composition: nav bars, sidebars, route guards, and page-level structure. Do not put business API calls or large forms directly in route layouts.

## Feature Module Conventions

Domain logic belongs in `features/<domain>/`.

Recommended structure:

```text
features/<domain>/
|-- components/   Domain UI and page-level client components
|-- hooks/        React hooks for server state, filters, actions
|-- services/     API clients, mappers, gateway functions
|-- types/        Domain TypeScript types
`-- utils/        Pure formatting, mapping, validation helpers
```

Examples already in the app:

```text
features/auction/
features/auth/
features/profile/
```

Use `features/profile` as the reference for profile work:

```text
features/profile/
|-- components/
|   |-- profile-overview-page.tsx
|   |-- edit-profile-page.tsx
|   |-- change-password-page.tsx
|   |-- profile-page-frame.tsx
|   |-- account-summary-section.tsx
|   |-- field-label.tsx
|   `-- status-message.tsx
|-- hooks/
|   `-- use-profile-data.ts
|-- services/
|   |-- profile-api.ts
|   `-- profile-user-store.ts
|-- types/
|   `-- profile.ts
`-- utils/
    |-- profile-error.ts
    `-- profile-format.ts
```

### What Belongs Where

Use `app/` for:

- URL structure
- metadata exports
- route layouts
- page files that render feature components
- route-specific loading/error/not-found files

Use `features/<domain>/components` for:

- domain page components
- forms tied to a domain API
- domain cards, tables, panels, sections

Use `features/<domain>/hooks` for:

- React Query hooks
- filter state hooks
- multi-step UI action hooks
- hooks that coordinate multiple services

Use `features/<domain>/services` for:

- `fetch` wrappers for backend endpoints
- API response parsing
- domain mappers
- persistence helpers specific to the domain

Use `features/<domain>/types` for:

- API DTOs
- normalized domain models
- form state types

Use `features/<domain>/utils` for:

- pure functions
- formatting
- labels
- calculations

Use `shared/` only when something is genuinely cross-feature.

## Client And Server Components

Default to Server Components for route files and static composition. Add `"use client"` only when a file uses:

- React state or effects
- browser APIs
- React Query hooks
- `useRouter`, `usePathname`, or other client navigation hooks
- event handlers

Common pattern:

```tsx
// app route file: server by default
import { EditProfilePage } from "@/features/profile/components/edit-profile-page";

export default function Page() {
  return <EditProfilePage />;
}
```

```tsx
// feature component: client when it owns state or mutations
"use client";

export function EditProfilePage() {
  // hooks, forms, mutations
}
```

## Data Fetching And API Services

The app uses React Query through `shared/components/query/query-provider.tsx`, mounted in `app/layout.tsx`.

For authenticated API calls, use:

```ts
import { authHttpFetch } from "@/features/auth/services/auth-http.client";
```

Do not call `fetch` directly for authenticated profile/auth flows unless there is a specific reason.

Service functions should:

- return typed data
- parse JSON safely
- throw domain-aware errors
- keep component code free of endpoint strings

Example shape:

```ts
export async function getMyProfile(): Promise<ProfileUser> {
  const response = await authHttpFetch("/profile/me", { method: "GET" });
  // parse and validate response here
}
```

React Query keys should be stable arrays:

```ts
queryKey: ["profile", "me"];
```

When a mutation changes cached data, update the query cache in `onSuccess`.

## Auth And Session Conventions

Root auth/session bootstrapping happens in `app/layout.tsx`:

```tsx
<QueryProvider>
  <ThemeProvider>
    <AuthSessionBootstrap />
    {children}
    <Toaster />
  </ThemeProvider>
</QueryProvider>
```

Auth-related helpers live in `features/auth/services`.

Important files:

- `auth-http.client.ts`
- `auth-token.store.ts`
- `auth-user.store.ts`
- `auth-api.error.ts`
- `auth-routing.ts`

For pages that require the user profile, follow the profile pattern in `features/profile/hooks/use-profile-data.ts`:

- query `["profile", "me"]`
- synchronize the auth user store on success
- redirect to login on `401`

## Layout And Navigation

Route shells live under `shared/components/layout`.

Examples:

- `admin-shell.tsx`
- `seller-shell.tsx`
- `auth-shell.tsx`
- `profile-sidebar.tsx`
- `public-sidebar.tsx`

Profile navigation is defined in:

```text
shared/components/layout/profile-sidebar.tsx
```

If you add a profile nav item, also add the matching route under:

```text
app/(profile)/profile/<route>/page.tsx
```

Then put the real page implementation in:

```text
features/profile/components/<route>-page.tsx
```

## Styling Conventions

Styling uses Tailwind utility classes and theme classes/tokens from `app/globals.css`.

Common theme classes:

- `theme-page`
- `theme-card`
- `theme-surface`
- `theme-heading`
- `theme-muted`
- `theme-primary`
- `theme-button-primary`
- `theme-button-secondary`
- `theme-callout`

Prefer existing theme classes over inventing new one-off color systems.

Use `lucide-react` for icons:

```tsx
import { Save } from "lucide-react";
```

For page-level public layouts, follow the auction market pattern:

```tsx
<section className="mx-auto w-full max-w-6xl px-6 py-8 sm:py-10">
  <div className="relative overflow-hidden rounded-4xl theme-card p-6 sm:p-8">
    ...
  </div>
</section>
```

Avoid moving large UI sections into `app/page.tsx` unless the UI is truly route-only and tiny.

## Forms

Form conventions:

- keep form state local to the owning page component
- submit through service functions via React Query mutations
- clear success messages before a new mutation
- derive mutation errors with a small utility such as `getErrorMessage`
- use typed form state from `features/<domain>/types`

Common small form UI belongs in the feature component folder when it is domain-specific:

```text
features/profile/components/field-label.tsx
features/profile/components/status-message.tsx
```

Move to `shared/` only after multiple domains actually need it.

## Metadata, Sitemap, Robots

Global metadata is in:

```text
app/layout.tsx
```

SEO route files:

```text
app/sitemap.ts
app/robots.ts
```

Public pages can export `metadata` from their route `page.tsx` when needed.

## Environment Variables

Client-exposed environment variables must start with `NEXT_PUBLIC_`.

Known variable:

```text
NEXT_PUBLIC_SITE_URL
```

`app/layout.tsx` uses `NEXT_PUBLIC_SITE_URL` for `metadataBase`, falling back to `https://example.com`.

## Verification Checklist

Before handing off a change:

```bash
npm.cmd exec -w web tsc -- --noEmit
npm.cmd -w web run lint
```

At the time of writing, `tsc --noEmit` is the most reliable structural check. If lint fails due to configuration, fix the config if your task is about linting; otherwise report the exact lint failure.

Also check:

- no feature logic was added directly to `app/**/page.tsx`
- route files import through `@/...`
- client files have `"use client"` only when needed
- authenticated requests use `authHttpFetch`
- shared components are truly shared
- no unrelated generated files are committed

## Adding A New Page

Example: adding `/profile/payment-methods`.

1. Add navigation if needed:

```text
shared/components/layout/profile-sidebar.tsx
```

2. Add the route:

```text
app/(profile)/profile/payment-methods/page.tsx
```

3. Keep the route file thin:

```tsx
import { PaymentMethodsPage } from "@/features/profile/components/payment-methods-page";

export default function ProfilePaymentMethodsPage() {
  return <PaymentMethodsPage />;
}
```

4. Put implementation in:

```text
features/profile/components/payment-methods-page.tsx
```

5. Put API logic in:

```text
features/profile/services/
```

6. Put reusable hooks in:

```text
features/profile/hooks/
```

## Naming Conventions

Files use kebab-case:

```text
profile-page-frame.tsx
use-profile-data.ts
profile-api.ts
```

React components use PascalCase:

```tsx
export function ProfilePageFrame() {}
```

Hooks use `use` prefix:

```ts
export function useProfileData() {}
```

Service functions use action names:

```ts
getMyProfile();
updateMyProfile();
updateEmail();
changePassword();
```

Types describe the domain shape:

```ts
ProfileUser;
ProfileFormState;
EmailFormState;
PasswordFormState;
```

## Current Profile Route Map

```text
/profile
  app/(profile)/profile/page.tsx
  features/profile/components/profile-overview-page.tsx

/profile/edit-profile
  app/(profile)/profile/edit-profile/page.tsx
  features/profile/components/edit-profile-page.tsx

/profile/change-password
  app/(profile)/profile/change-password/page.tsx
  features/profile/components/change-password-page.tsx
```

The old route-local `_components/profile-page-sections.tsx` pattern should not be used for large domain logic. Keep app route folders focused on routing and layouts.
