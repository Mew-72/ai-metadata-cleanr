# Locale Page Load Error Bugfix Design

## Overview

Non-English visitors report that ScrubAI pages blank out and are replaced by a browser-rendered, localized "could not load this page" screen. The requirements phase established that ScrubAI has no localization layer, so that screen is browser chrome reacting to a dead document, not app copy.

The fix has one primary move and three supporting ones.

Primary: give the app an error boundary. `src/app/` currently has no `error.tsx`, no `global-error.tsx`, and no `componentDidCatch` anywhere in `src/`. Any uncaught client error therefore unmounts the tree to an empty document, and the browser fills the void with its own localized failure UI. Adding an app-owned boundary converts every one of these failures into an in-app recovery screen, regardless of which underlying trigger fired. This is the change with the widest blast radius and the highest confidence.

Supporting:
1. Reduce the trigger rate for browser page translation by marking translation-volatile, React-updated text with `translate="no"` so translation engines stop re-parenting nodes React owns.
2. Let unknown locale-prefixed paths such as `/pt-br/` reach the app's 404 instead of being swept into `auth.protect()` by the default-protect matcher in `src/proxy.ts`, and add the `not-found.tsx` the app is currently missing.
3. Pin ambient-locale number and date formatting, and report boundary-level errors to PostHog with a sanitized payload so the failure stops being invisible.

The privacy invariant is load-bearing here. Error telemetry is a new outbound network path, so every field it carries is enumerated and sanitized in this design. No image bytes, filenames, dimensions, or EXIF values leave the browser.

Framework note: `node_modules/` is not installed in this workspace, so the App Router file conventions below were confirmed against the published Next.js 16.x docs for the `error`, `global-error`, and `not-found` file conventions rather than the vendored copy. Two version-specific details matter and are reflected in the design: `unstable_retry` was added to the error boundary props in v16.2.0 (preferred over `reset`), and `global-error` renders its own document and does not inherit app global styles or the `data-theme` attribute.

## Glossary

- **Bug_Condition (C)**: The input condition that triggers the bug. A page load where browser page translation is active, or a client render throws, or the requested path is an unknown locale-prefixed path.
- **Property (P)**: The desired behavior under C. The visitor receives a non-empty, app-rendered document with a recovery affordance, never the browser's own error screen.
- **Preservation**: The behavior that must not change. English page loads without translation, the canvas cleaning pipeline and its exported bytes, PayPal pricing at the value in `src/config/pricing.ts`, Clerk protection of `/dashboard`, theme persistence, the `en-CA` daily counter keys, and the current sitemap and robots URL set.
- **Route error boundary**: `src/app/error.tsx`. A client component that wraps every segment below the root layout. Receives `error` and `unstable_retry`.
- **Global error boundary**: `src/app/global-error.tsx`. The last resort boundary that also catches root layout failures. Must render its own `<html>` and `<body>`.
- **Translation-volatile text**: A React-owned text node whose content or presence changes after hydration. In ScrubAI this is produced by the theme effect and scroll effect in `Header.tsx`, the `SignInButton` / `UserButton` swap driven by `useAppAuth()`, the mobile drawer mount, and the live stat readouts in `CleanerInterface.tsx`.
- **Default-protect model**: The inverted security model in `src/proxy.ts`. Anything not matched by `isPublicRoute` requires authentication. Unknown paths are currently caught by this and redirected to sign-in.
- **Sanitized error payload**: The four-plus-context field set defined in Fix Implementation section 5, with message redaction applied before capture.

## Bug Details

### Bug Condition

The bug manifests when a visitor's page load enters a state the app cannot render out of. Three independent entry paths lead there: a translation engine mutates React-managed DOM and the next reconciliation throws a `NotFoundError` from `removeChild` or `insertBefore`; any client component throws during render, hydration, or a post-hydration update; or the requested path carries a locale prefix that matches no route. All three converge on the same outcome because no app-owned boundary exists to catch the first two, and because the default-protect matcher misroutes the third.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type PageLoad { path, browserTranslationActive, clientRenderThrows }
  OUTPUT: boolean

  RETURN input.browserTranslationActive = TRUE
      OR input.clientRenderThrows = TRUE
      OR isLocalePrefixedUnknownPath(input.path)
END FUNCTION

FUNCTION isLocalePrefixedUnknownPath(path)
  INPUT: path of type string
  OUTPUT: boolean

  RETURN NOT matchesAppRoute(path)
     AND firstSegment(path) MATCHES languageTagShape   // pt, pt-br, es, fr-ca, zh-hans
END FUNCTION
```

### Examples

- A visitor on Chrome with UI language Portuguese loads `/`, accepts "Translate this page", then toggles the theme. Expected: the theme flips and the page stays interactive. Actual: React throws during reconciliation of a translated text node, the tree unmounts, and the browser shows its localized "could not load" screen.
- A visitor with translation active scrolls past the sticky-header threshold in `Header.tsx`, flipping `scrolled` state. Expected: the header border appears. Actual: same unmount, same browser screen.
- Clerk auth state resolves and `Header.tsx` swaps `SignInButton` for `UserButton` under an active translation. Expected: the avatar replaces the sign-in button. Actual: same unmount.
- Any client component throws for a reason unrelated to translation, for example a `heic2any` decode failure inside `CleanerInterface.tsx`. Expected: an in-app error screen with retry. Actual: empty document, browser error screen, no telemetry.
- A search result or translated link sends a visitor to `/pt-br/pricing`. Expected: the app's 404 with status 404. Actual: `isPublicRoute` does not match, `auth.protect()` runs, and the visitor is redirected to sign-in for a page that does not exist.
- Edge case: `/dashboard` requested while signed out. Expected and current: redirect to sign-in. This must not change.
- Edge case: a 1920x1080 image is cleaned and the pixel readout renders. Expected: an identical string for every visitor. Actual: `pixelCount.toLocaleString()` in `CleanerInterface.tsx` formats against the ambient locale, so grouping separators differ by visitor locale.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- English page loads with no translation active render byte-identical UI to today, including the landing page, pricing, docs, dashboard, and the C2PA scanner.
- The canvas pipeline in `useCanvasEngine.ts` continues to strip EXIF, GPS, IPTC, XMP, and C2PA metadata and produces identical exported blobs. No added code touches image data.
- No image bytes, filenames, dimensions, or EXIF values are transmitted anywhere. This includes the new error telemetry path.
- `clerkMiddleware` continues to require authentication for genuinely protected routes. `/dashboard` stays gated, and the default-protect posture stays in force for every route the app actually serves.
- Pricing continues to flow from `src/config/pricing.ts` through the pricing page, `BillingModal.tsx`, and both PayPal API routes at 24.99 USD.
- Theme toggling continues to persist `scrubai-theme` in localStorage and apply `data-theme` on `<html>`.
- Daily clean and scan counters continue to key off the `en-CA` date string in `CleanerInterface.tsx`, `c2pa-scanner/page.tsx`, and `dashboard/page.tsx`, so stored counters stay valid.
- `robots.txt` and `sitemap.xml` continue to serve the current unprefixed URL set. No locale-prefixed URLs are added.
- The client and server split is preserved. Pages that need the browser stay `"use client"`, and metadata exports stay in server `layout.tsx` siblings.

**Scope:**

All page loads that are not under active browser translation, do not throw during client render, and request a path that matches an existing route are completely unaffected. That includes:
- Every English visit to an existing route.
- Every mouse, keyboard, and touch interaction with the drop zone, canvas controls, and export flow.
- Every authenticated flow through Clerk and every PayPal checkout.
- Server-rendered metadata, sitemap, and robots output.

The expected correct behavior under the bug condition is specified in the Correctness Properties section.

## Hypothesized Root Cause

Ranked by confidence.

1. **Missing error boundary, high confidence.** There is no `error.tsx`, no `global-error.tsx`, and no class component with `componentDidCatch` in `src/`. React 19 unmounts the whole tree when an error escapes to the root with no boundary. The result is an empty document, which is exactly the condition browsers report with their own localized failure UI. This explains why the symptom presents as a total page failure rather than a degraded component, and it explains why the message is in the visitor's language while the app has no translations. It is also the only hypothesis that covers all reported variants at once.

2. **Browser page translation mutating React-owned DOM, high confidence as the trigger.** Chrome and Edge page translation replaces text nodes and wraps them in `<font>` elements. React 19 holds direct references to the nodes it created. When state changes and React tries to remove or reorder a node the translator has re-parented, it throws `NotFoundError: Failed to execute 'removeChild' on 'Node'` or the `insertBefore` equivalent. ScrubAI is unusually exposed because almost all visible text is React-managed and several effects mutate it shortly after hydration:
   - the theme effect in `Header.tsx` sets state on mount,
   - the scroll effect in `Header.tsx` flips `scrolled` on the first scroll event,
   - `useAppAuth()` resolving flips the header between `SignInButton` and `UserButton`,
   - the mobile drawer mounts and unmounts a whole nav subtree,
   - the stat readouts in `CleanerInterface.tsx` update text on every pipeline step.

3. **Default-protect matcher swallowing unknown paths, high confidence but narrower.** `src/proxy.ts` protects anything `isPublicRoute` does not match. Locale-prefixed paths such as `/pt/`, `/pt-br/pricing`, and `/es/docs` match nothing, so `auth.protect()` redirects to sign-in. A visitor who arrived from a translated link or a stale search result sees an auth wall for a page that does not exist. This is a separate, independently verifiable defect on the same report. It is also why the app never surfaces a 404: there is no `not-found.tsx` either.

4. **Unpinned locale formatting, low severity, contributes to hydration mismatch risk.** `pixelCount.toLocaleString()` in `CleanerInterface.tsx` and the three `new Date(...).toLocaleString()` calls in `c2pa-scanner/page.tsx` format against the ambient locale. These are client-only render paths today, so they are not a confirmed hydration mismatch source, but they produce visitor-dependent output and are the kind of drift that turns into a mismatch the moment any of that markup moves to the server.

5. **Zero observability, not a cause but the reason the bug stayed unattributed.** `instrumentation-client.ts` does set `capture_exceptions: true`, so PostHog auto-captures uncaught JS errors. That auto-capture is not boundary-aware: it carries no route segment, no error digest, no signal about whether translation was active, and its message field is unsanitized with respect to the privacy invariant. Nothing in the app captures an event at the moment a boundary catches, which is why the failure could not be scoped to a browser or locale during the requirements phase.

## Correctness Properties

Property 1: Bug Condition - Non-English visitors always get a usable, app-rendered document

_For any_ page load where the bug condition holds (browser translation is active, or a client component throws during render, hydration, or a post-hydration update, or the path is an unknown locale-prefixed path), the fixed app SHALL return a non-empty document that was rendered by the app, containing a recovery affordance: either the working page, or the in-app error screen with a retry control and a link home, or the app's 404 page. The browser's own error screen SHALL never be reached.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Unaffected page loads behave identically

_For any_ page load where the bug condition does NOT hold (English, no translation active, no client throw, path matches an existing route), the fixed app SHALL produce the same rendered result and the same network behavior as the original app, preserving page markup, the canvas cleaning pipeline and its exported bytes, Clerk protection of protected routes, PayPal pricing, theme persistence, and the `en-CA` daily counter keys.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

Property 3: Unknown locale-prefixed paths resolve to the app's 404

_For any_ request path that matches no app route, the fixed middleware SHALL NOT invoke `auth.protect()` and the app SHALL respond with its own 404 page at HTTP status 404. _For any_ request path that matches an app route and is not listed as public, the middleware SHALL still invoke `auth.protect()`.

**Validates: Requirements 2.3, 3.4**

Property 4: Locale-pinned formatting is visitor-independent

_For any_ numeric or date value rendered through a formatting call in the cleaning or scanning UI, the output string SHALL be identical regardless of the ambient locale of the runtime, while the `en-CA` date keys used for persisted daily counters remain unchanged.

**Validates: Requirements 2.6, 3.7**

Property 5: Error telemetry carries no image-derived data

_For any_ error captured by an app error boundary, the emitted PostHog payload SHALL contain only fields from the allowed set (error name, redacted message, digest, route, boundary level, translation-active flag, browser UI language) and SHALL NOT contain image bytes, object or data URLs, filenames, image dimensions, or EXIF values.

**Validates: Requirements 2.5, 3.2**

## Fix Implementation

### Changes Required

Assuming the root cause ranking above is correct. Exploratory checking runs first and can reorder this list.

**1. Route-level error boundary**

**File**: `src/app/error.tsx` (new)

- `"use client"` client component, default export, per the App Router error file convention.
- Props: `{ error: Error & { digest?: string }, unstable_retry: () => void }`. Prefer `unstable_retry()` over `reset()`, since v16.2.0 added it and it re-fetches as well as re-renders the boundary's children, which is the right recovery for a translation-induced reconciliation failure. Keep `reset` out of the signature unless exploratory testing shows retry is unsuitable.
- Renders the shared fallback UI with a retry button wired to `unstable_retry()` and a `next/link` back to `/`.
- Reports to PostHog in a `useEffect` keyed on `error`, via the sanitizer in change 5. Boundary level `"route"`.
- Wraps every segment below the root layout, so all of `/`, `/pricing`, `/docs`, `/dashboard`, `/c2pa-scanner` and the rest are covered by this one file. No per-segment `error.tsx` is added, since there is no segment-specific recovery story to tell.

**2. Global error boundary**

**File**: `src/app/global-error.tsx` (new)

- `"use client"`, default export, renders its own `<html lang="en">` and `<body>` because it replaces the root layout when active.
- Catches failures the route boundary cannot, including a throw inside the root layout itself.
- Two constraints from the framework docs shape this file. First, it does not inherit the app's global styles, so it imports `./globals.css` explicitly and the fallback UI is written to survive without Tailwind if that import is ever stripped. Second, the app's `data-theme` attribute is not applied here, so this screen renders the light-theme token defaults and does not offer a theme toggle. That is an accepted limitation, not a bug.
- Metadata exports are not supported in an error boundary, so the document title is set with the React `<title>` component.
- Reports to PostHog with boundary level `"global"`.

**3. Shared fallback UI and the app 404**

**File**: `src/components/ErrorFallback.tsx` (new)

- Presentational client component shared by both boundaries. Props: `title`, `description`, optional `onRetry`.
- Modern minimal SaaS treatment consistent with the current direction: centered single column, rounded card, generous whitespace, restrained motion, Tailwind v4 tokens from `globals.css` only (`bg`, `ink`, `n500`, `n600`, `accent`, `muted-border`, `accent-soft`). No new tokens, no hardcoded hex values in component files.
- Icons from `lucide-react` only. `TriangleAlert` for the error state, `RotateCw` for retry, `House` for the home link.
- Copy is English, plain, no em dashes, and does not blame the visitor. It names browser translation as a possible cause and suggests viewing the original page, since that is actionable for exactly the affected audience.

**File**: `src/app/not-found.tsx` (new)

- The app has no 404 page today. This one reuses `ErrorFallback` with 404 copy and a link home, no retry control.
- Server component by default. It renders no browser-only API, so it does not need `"use client"`, which keeps the client and server split intact.

**4. Translation resilience for volatile text**

**Files**: `src/components/Header.tsx`, `src/components/CleanerInterface.tsx`, `src/app/layout.tsx`

- Keep `<html lang="en">` exactly as it is. The document language declaration must stay consistent with the English content that is actually served.
- Do not add a document-wide `<meta name="google" content="notranslate">` and do not put `translate="no"` on `<html>`. Blanket opt-out would take translation away from the visitors this fix exists to help. Marking is targeted.
- Add `translate="no"` (plus the legacy `notranslate` class for engines that ignore the attribute) to the specific nodes that are both React-managed and mutated after hydration:
  - the theme toggle button and its `title` in `Header.tsx`, which changes text on every toggle,
  - the auth action region in `Header.tsx` that swaps between `SignInButton` and `UserButton`,
  - the mobile drawer container, which mounts and unmounts a whole nav subtree,
  - the stat readouts in `CleanerInterface.tsx`: size delta, pixel count, quality label, and any status or progress text that updates during the pipeline.
- Give the conditionally rendered subtrees in `Header.tsx` a stable outer wrapper element that React owns and translation does not touch, so the node being inserted or removed during a swap is a wrapper rather than a translated text node. Static nav labels stay translatable, since text that never changes after hydration is not a reconciliation hazard.
- This reduces trigger frequency. It is not a guarantee. The error boundary remains the backstop, and the design does not depend on translation marking being exhaustive.

**5. Privacy-safe error reporting**

**File**: `src/lib/errorReporting.ts` (new)

- `reportAppError(error, context)` builds and captures the event. Allowed fields, and nothing else:
  - `error_name`: `error.name`.
  - `error_message`: passed through `sanitizeErrorMessage` and truncated to a fixed length.
  - `error_digest`: `error.digest` when present, for matching server logs.
  - `route`: the pathname only, with query string dropped.
  - `boundary`: `"route" | "global"`.
  - `translation_active`: boolean, derived from translation-engine markers on `<html>` such as the `translated-ltr` / `translated-rtl` classes and a `lang` attribute that no longer reads `en`. Derived from DOM state, not from visitor content.
  - `browser_language`: `navigator.language`.
- `sanitizeErrorMessage` redacts before capture: strips `blob:` and `data:` URLs, strips anything matching an image file extension pattern, collapses path-like tokens, and truncates. Applied to every message, including messages the app did not author, so a third-party library that echoes a filename into an error cannot leak it.
- No stack traces are sent. Stacks in a client bundle can carry interpolated values and buy little for this class of failure.
- Event name `app_error`, consistent with the existing snake_case UI event naming.

**File**: `instrumentation-client.ts`

- `capture_exceptions: true` is already on, so PostHog auto-captures uncaught errors independently of the boundaries. Add a `before_send` hook that runs `sanitizeErrorMessage` over `$exception` event message fields, so the auto-capture path is held to the same privacy standard as the boundary path. Leave every other init option untouched, including the `/ingest` proxy, the web vitals config, and `on_request_error`.
- Accept that a single failure may produce both an `app_error` and an `$exception` event. Boundary attribution is worth the duplication, and the two event names keep them separable in analytics.

**6. Middleware and unknown-path handling**

**File**: `src/proxy.ts`

- Keep the inverted default-protect model. Do not convert to an explicit protected-route matcher, because that would silently make every future route public by default and put requirement 3.4 at ongoing risk.
- Add a second matcher, `isKnownRoute`, enumerating the paths the app actually serves, public and protected alike, including `/dashboard(.*)`, `/thank-you(.*)`, and the PayPal API routes.
- New decision order:
  1. path matches `isPublicRoute`, allow through,
  2. path matches `isKnownRoute` but not `isPublicRoute`, call `auth.protect()` exactly as today,
  3. path matches neither, return without calling `auth.protect()` and let Next routing fall through to `not-found.tsx` with status 404.
- This covers unknown locale-prefixed paths as a special case of unknown paths generally, so `/pt-br/`, `/es/docs`, and plain typos all land on the app 404. No locale regex is required in the middleware, which avoids the risk of a language-tag pattern shadowing a future two-letter route.
- The `matcher` config array is unchanged.
- Rejected alternative: redirecting `/pt-br/pricing` to `/pricing`. It reads as friendlier but invents a locale routing contract the app does not have, and requirement 2.3 specifies a 404. Left out.

**7. Locale-pinned formatting**

**Files**: `src/components/CleanerInterface.tsx`, `src/app/c2pa-scanner/page.tsx`

- `pixelCount.toLocaleString()` becomes an explicitly pinned call with a fixed locale and explicit options.
- The three unpinned `new Date(...).toLocaleString()` calls in the C2PA scanner signature readout are pinned the same way, with explicit date and time options so output does not drift with the runtime locale.
- The `new Date().toLocaleDateString("en-CA")` calls in `CleanerInterface.tsx`, `c2pa-scanner/page.tsx`, and `dashboard/page.tsx` are left exactly as they are. They are already pinned and they key persisted counters, so changing them would invalidate stored data and break requirement 3.7.

### Files Touched

| File | Change |
|---|---|
| `src/app/error.tsx` | new, route error boundary |
| `src/app/global-error.tsx` | new, global error boundary |
| `src/app/not-found.tsx` | new, app 404 |
| `src/components/ErrorFallback.tsx` | new, shared fallback UI |
| `src/lib/errorReporting.ts` | new, sanitizer and capture |
| `src/proxy.ts` | add `isKnownRoute`, unknown paths bypass protect |
| `src/components/Header.tsx` | translation marking on volatile nodes, stable wrappers |
| `src/components/CleanerInterface.tsx` | translation marking on stat readouts, pin `toLocaleString` |
| `src/app/c2pa-scanner/page.tsx` | pin signature date formatting |
| `instrumentation-client.ts` | `before_send` message sanitizer |

Not touched: `src/hooks/useCanvasEngine.ts`, `src/config/pricing.ts`, `src/app/api/paypal/**`, `src/app/sitemap.ts`, `src/app/robots.ts`, `next.config.ts`. Leaving the canvas engine and pricing untouched is the cheapest way to hold requirements 3.3 and 3.5.

## Testing Strategy

### Validation Approach

Two phases. First, surface counterexamples on the unfixed code to confirm or refute the root cause ranking. If exploratory checking refutes hypothesis 1 or 2, re-hypothesize before writing the fix. Second, verify the fix holds under the bug condition and that everything outside the bug condition is untouched.

The repo has no unit test framework today. `tests/` contains only a `performance` directory. Testing this fix requires adding one. Proposal: Vitest with jsdom, `@testing-library/react` for component and boundary behavior, and `fast-check` for the property-based checks, all at pinned versions, as devDependencies. Middleware and 404 status behavior is checked against a built app with `next build` plus `next start` and direct HTTP requests, since middleware does not run under jsdom. Every test command runs single-shot, never in watch mode.

### Exploratory Bug Condition Checking

**Goal**: Produce concrete counterexamples on the UNFIXED code that demonstrate each hypothesized cause, and establish which one actually fires for the reported symptom.

**Test Plan**: Simulate translation-style DOM mutation against the real `Header.tsx`, then trigger the state changes that force reconciliation of the mutated nodes. Separately, throw from a client component and observe what the document looks like afterward. Separately again, request locale-prefixed paths against a built app and record the response status and `Location` header.

**Test Cases**:
1. **Translation mutation then theme toggle**: render `Header.tsx`, replace a React-owned text node with a `<font>`-wrapped clone the way page translation does, then toggle the theme and assert the tree survives (will fail on unfixed code, expected `NotFoundError` from `removeChild` or `insertBefore`).
2. **Translation mutation then auth swap**: same mutation, then flip `useAppAuth()` from signed out to signed in and assert the header still renders (will fail on unfixed code).
3. **Translation mutation then mobile drawer mount**: same mutation, then open the drawer and assert the nav subtree mounts (will fail on unfixed code).
4. **Uncaught client throw leaves an empty document**: mount a component that throws on update inside the current app shell and assert the document still has rendered content (will fail on unfixed code, this is the missing boundary made visible).
5. **Locale-prefixed path routing**: request `/pt-br/`, `/pt/pricing`, `/es/docs` against a built app and assert 404 (will fail on unfixed code, expected a 307 or 302 to sign-in).
6. **Edge case, ambient locale formatting**: render the pixel readout with the process locale forced to `pt-BR` and assert the output matches the `en-US` output (may fail on unfixed code depending on the runtime ICU locale).

**Expected Counterexamples**:
- A `NotFoundError` naming `removeChild` or `insertBefore` from cases 1 through 3, confirming hypothesis 2.
- An empty container with no app-rendered content from case 4, confirming hypothesis 1 and explaining the browser chrome symptom.
- A redirect to sign-in from case 5, confirming hypothesis 3.
- Possible causes if these do not reproduce: the reported screen came from a network or service worker failure rather than a render throw, the visitor was on a browser whose translation implementation does not re-parent nodes, or the path involved was a real route behind auth. Any of these would send us back to re-hypothesize.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed app produces the expected behavior.

**Pseudocode:**

```
FOR ALL X WHERE isBugCondition(X) DO
  result := renderPage_fixed(X)
  ASSERT NOT is_empty_document(result)
  ASSERT rendered_by_app(result)
  ASSERT has_recovery_affordance(result)
END FOR
```

Concretely, `has_recovery_affordance` is satisfied by any one of: the page rendering normally, the `ErrorFallback` UI with a working retry control and a home link, or `not-found.tsx` served at status 404.

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed app produces the same result as the original app.

**Pseudocode:**

```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderPage_original(X) = renderPage_fixed(X)
END FOR
```

**Testing Approach**: Property-based testing is the right tool for preservation here because the input domain is wide (route x auth state x theme x translation state x file type) and the interesting regressions are combinational rather than enumerable. Generated cases also catch the failure mode this fix is most likely to introduce: an over-broad translation marking or middleware matcher change that alters behavior for visitors who were never affected.

**Test Plan**: Capture behavior on the UNFIXED code first, as snapshots for markup and as recorded values for exported bytes, middleware decisions, and prices. Then assert the fixed code reproduces those exact captures.

**Test Cases**:
1. **English render preservation**: capture rendered markup for every route with no translation active on unfixed code, then assert the fixed code matches. Confirms the translation marking added only attributes and wrappers that do not alter visible output.
2. **Canvas output preservation**: capture exported blob bytes and stripped-metadata assertions for a fixture set across JPEG, PNG, and HEIC on unfixed code, then assert byte-identical output after the fix. Confirms requirements 3.2 and 3.3.
3. **Protected route preservation**: assert `/dashboard` signed out still redirects to sign-in, and that every path in `isPublicRoute` still passes through without `auth.protect()`. Confirms requirement 3.4 survives the `isKnownRoute` addition.
4. **Pricing preservation**: assert every rendered price equals the value in `src/config/pricing.ts` and that the PayPal create-order payload is unchanged at 24.99 USD. Confirms requirement 3.5.
5. **Theme preservation**: assert toggling still writes `scrubai-theme` and sets `data-theme` on `<html>`, including on nodes that now carry `translate="no"`. Confirms requirement 3.6.
6. **Counter key preservation**: assert the `en-CA` date keys are byte-identical to the unfixed values under several ambient locales, so stored counters remain readable. Confirms requirement 3.7.
7. **Sitemap and robots preservation**: assert the URL sets are unchanged and contain no locale-prefixed entries. Confirms requirement 3.8.

### Unit Tests

- `error.tsx` renders `ErrorFallback`, and its retry control invokes the `unstable_retry` prop.
- `global-error.tsx` renders a complete document with `<html lang="en">` and `<body>`, and stays legible with only light-theme token defaults available.
- `not-found.tsx` renders 404 copy with a home link and no retry control.
- `sanitizeErrorMessage` redacts `blob:` URLs, `data:` URLs, image filenames with extensions, and path-like tokens, and truncates to the length cap.
- `reportAppError` emits exactly the allowed field set and nothing else, for both boundary levels.
- `isKnownRoute` classification: public, known-but-protected, and unknown, one case each per branch.
- Pinned formatting helpers return identical strings under forced `pt-BR`, `de-DE`, and `en-US` runtime locales.

### Property-Based Tests

- **Property 1**: generate page loads across route x translation-active x auth state x throw-site, and assert the resulting document is non-empty, app-rendered, and carries a recovery affordance.
- **Property 2**: generate non-bug-condition page loads and assert markup and behavior match the captured unfixed baseline.
- **Property 3**: generate path strings mixing valid routes, valid routes with language-tag prefixes, and random unknown paths, and assert the middleware decision is protect only for known non-public routes and 404 for everything unknown.
- **Property 4**: generate integer pixel counts and timestamps across a wide range and assert formatted output is invariant under ambient locale.
- **Property 5**: generate error objects whose names and messages embed filenames, `blob:` URLs, `data:` URLs, EXIF-looking key and value pairs, and long paths, then assert the captured payload contains no substring from the image-derived input and no key outside the allowed set. This is the privacy invariant expressed as a property, and it is the single most important generated test in this fix.

### Integration Tests

- Full translated-page flow: load `/` with simulated page translation, toggle the theme, open the mobile drawer, scroll past the sticky threshold, resolve auth, and assert the page stays interactive with no boundary activation.
- Boundary recovery flow: force a throw inside a page, assert the in-app error screen appears, click retry, and assert the page recovers.
- Locale-prefixed path flow against a built app: request `/pt-br/`, `/pt/pricing`, `/es/docs` and assert status 404 with the app 404 body and no sign-in redirect, then request `/dashboard` signed out and assert the sign-in redirect still happens.
- Telemetry flow: force a boundary catch with PostHog capture intercepted, and assert one `app_error` event with the allowed fields and a sanitized message.
- Clean-and-export flow under active translation: run a full clean and download with translation simulated, and assert the export succeeds and the output bytes match the untranslated baseline.
- `npm run build` and `npm run lint` both pass, since new root-level App Router convention files are the kind of change that surfaces at build time.
