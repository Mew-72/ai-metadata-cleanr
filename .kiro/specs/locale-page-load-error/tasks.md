# Implementation Plan

Dependency note for the scheduler: tasks 1 and 2 must both complete before any of task 3 begins. Inside task 3, the DAG is:

- 3.1 (harness) gates every other subtask that runs a test.
- 3.2 gates 3.3, 3.4, 3.5 (they all render `ErrorFallback`).
- 3.6 gates 3.3, 3.4 (both call `reportAppError`) and gates 3.7 (shares `sanitizeErrorMessage`).
- 3.8, 3.9, 3.10, 3.11 are independent of each other and of the boundary chain, so they can run in parallel once 3.1 is done.
- 3.12 and 3.13 require every preceding subtask.
- Task 4 requires all of task 3.

Never run `npm run dev`. Every test command is single-shot (`vitest --run`), never watch mode.

- [ ] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Non-English visitors always get a usable, app-rendered document
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the three entry paths of `isBugCondition` from the design Bug Condition section
  - **Scoped PBT Approach**: the bug is deterministic per entry path, so scope each property to the concrete failing cases rather than an open input space: route in `{ /, /pricing }` x mutation target in `{ theme toggle label, auth action region, mobile drawer subtree }` for translation, and path in `{ /pt-br/, /pt/pricing, /es/docs }` for routing
  - Bootstrap the minimum harness needed to run this test now (Vitest + jsdom + `@testing-library/react` + `fast-check`, pinned, single-shot script). Task 3.1 finalizes the full setup
  - Case A, translation-style DOM mutation then reconciliation: render `src/components/Header.tsx`, replace a React-owned text node with a `<font>`-wrapped clone the way Chrome page translation re-parents nodes, then force reconciliation by toggling the theme, flipping `useAppAuth()` from signed out to signed in, and opening the mobile drawer. Assert the tree survives and the header still renders
  - Case B, uncaught client throw leaves an empty document: mount a component that throws on update inside the current app shell and assert the document still contains app-rendered content
  - Case C, locale-prefixed path routing: exercise the `src/proxy.ts` decision for `/pt-br/`, `/pt/pricing`, `/es/docs` and assert the result is the app 404 rather than an `auth.protect()` sign-in redirect
  - Assertions mirror the Fix Checking pseudocode: NOT `is_empty_document`, `rendered_by_app`, `has_recovery_affordance`
  - Run test on UNFIXED code with `npx vitest --run`
  - **EXPECTED OUTCOME**: Test FAILS. Case A is expected to throw `NotFoundError: Failed to execute 'removeChild'` or the `insertBefore` equivalent, Case B is expected to leave an empty container, Case C is expected to produce a 307 or 302 to sign-in
  - Document counterexamples found, one per case, and record whether they confirm or refute hypotheses 1, 2, and 3 in the design. If Case A or Case B refutes its hypothesis, stop and re-hypothesize before starting task 3
  - Mark task complete when the test is written, run, and the failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unaffected page loads behave identically
  - **IMPORTANT**: Follow observation-first methodology. Record what the UNFIXED code actually does, then assert exactly that
  - Observe on unfixed code and capture as baselines: rendered markup for `/`, `/pricing`, `/docs`, `/dashboard`, `/c2pa-scanner` with no translation active; exported blob bytes and stripped-metadata assertions for a JPEG, PNG, and HEIC fixture through `useCanvasEngine.ts`; the `src/proxy.ts` decision for `/dashboard` signed out and for every path in `isPublicRoute`; every rendered price and the PayPal create-order payload against `src/config/pricing.ts`; `scrubai-theme` in localStorage and `data-theme` on `<html>` after a toggle; the `en-CA` daily counter key strings under ambient locales `en-US`, `pt-BR`, `de-DE`; the `sitemap.ts` and `robots.ts` URL sets
  - Write property-based tests over the generated domain route x auth state x theme x file type, asserting the fixed output equals the captured baseline. Generated cases are the point here: the regression this fix is most likely to introduce is an over-broad translation marking or middleware matcher that changes behavior for visitors who were never affected
  - Assert the sitemap and robots sets contain no locale-prefixed entries
  - Run tests on UNFIXED code with `npx vitest --run`
  - **EXPECTED OUTCOME**: Tests PASS. This confirms the baseline behavior to preserve
  - Mark task complete when the tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 3. Fix for locale page load error: missing error boundary, unknown-path misrouting, translation-volatile DOM

  - [ ] 3.1 Finalize the test framework setup
    - Add devDependencies at exact pinned versions, no carets: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`, `fast-check`. Confirm the exact pins resolve against the registry for React 19.2 and Next 16.2.6 before writing them in
    - Add `vitest.config.ts` with the jsdom environment, the React plugin, a `tests/setup.ts` that loads `@testing-library/jest-dom`, and path aliases matching `tsconfig.json`
    - Add single-shot scripts only: `"test": "vitest --run"` and `"test:pbt": "vitest --run tests/properties"`. Do not add a watch script
    - Place unit tests under `tests/unit`, property tests under `tests/properties`, and leave `tests/performance` untouched
    - Middleware and HTTP status behavior cannot run under jsdom. Route those checks through `next build` plus `next start` and direct HTTP requests, in a separate `tests/integration` suite that is invoked explicitly
    - Re-run tasks 1 and 2 under the finalized config and confirm the same outcomes (task 1 fails, task 2 passes)
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.2 Create the shared `ErrorFallback` UI
    - New file `src/components/ErrorFallback.tsx`, presentational client component, props `{ title, description, onRetry? }`
    - Modern minimal SaaS treatment: centered single column, rounded card, generous whitespace, restrained motion
    - Use only existing Tailwind v4 tokens from `src/app/globals.css` (`bg`, `ink`, `n500`, `n600`, `accent`, `muted-border`, `accent-soft`). No new tokens, no hardcoded hex in the component
    - Icons from `lucide-react` only: `TriangleAlert`, `RotateCw`, `House`
    - English copy, plain, no em dashes, does not blame the visitor. Name browser translation as a possible cause and suggest viewing the original page
    - Render the retry control only when `onRetry` is supplied
    - Unit test: renders title and description, shows retry only when `onRetry` is passed, and invokes `onRetry` on click
    - _Bug_Condition: isBugCondition(input) where input.clientRenderThrows = TRUE_
    - _Expected_Behavior: has_recovery_affordance(result) from the Fix Checking pseudocode_
    - _Preservation: adds a new component only, touches no existing render path_
    - _Requirements: 2.2_

  - [ ] 3.3 Add the route-level error boundary `src/app/error.tsx`
    - New file, `"use client"`, default export, props `{ error: Error & { digest?: string }, unstable_retry: () => void }`
    - Prefer `unstable_retry()` over `reset()`. It was added to the error boundary props in Next 16.2.0 and re-fetches as well as re-renders, which is the right recovery for a translation-induced reconciliation failure. Skim `node_modules/next/dist/docs/01-app/` for the `error` file convention before writing this file
    - Render `ErrorFallback` with a retry button wired to `unstable_retry()` and a `next/link` back to `/`
    - Call `reportAppError` from a `useEffect` keyed on `error`, boundary level `"route"`
    - Unit test: renders `ErrorFallback` and the retry control invokes the `unstable_retry` prop
    - _Bug_Condition: isBugCondition(input) where input.clientRenderThrows = TRUE_
    - _Expected_Behavior: NOT is_empty_document(result) AND rendered_by_app(result) AND has_recovery_affordance(result)_
    - _Preservation: boundary is inert on successful renders, so Property 2 baselines must not shift_
    - _Requirements: 1.2, 2.1, 2.2_

  - [ ] 3.4 Add the global error boundary `src/app/global-error.tsx`
    - New file, `"use client"`, default export, renders its own `<html lang="en">` and `<body>` because it replaces the root layout when active
    - Import `./globals.css` explicitly, since a global error boundary does not inherit app global styles. Write the fallback so it stays legible if that import is ever stripped
    - `data-theme` is not applied here, so render the light-theme token defaults and offer no theme toggle. This is an accepted limitation, documented in the design
    - Metadata exports are not supported in an error boundary, so set the document title with the React `<title>` component
    - Call `reportAppError` with boundary level `"global"`
    - Unit test: renders a complete document with `<html lang="en">` and `<body>`, and stays legible with only light-theme token defaults available
    - _Bug_Condition: isBugCondition(input) where the throw escapes the route boundary or originates in the root layout_
    - _Expected_Behavior: NOT is_empty_document(result) AND rendered_by_app(result)_
    - _Preservation: inert on successful renders_
    - _Requirements: 1.2, 2.2_

  - [ ] 3.5 Add the app 404 `src/app/not-found.tsx`
    - New file. The app has no 404 page today
    - Reuse `ErrorFallback` with 404 copy and a link home, no retry control
    - Keep it a server component. It renders no browser-only API, so no `"use client"`, which preserves the client and server split
    - Unit test: renders 404 copy with a home link and no retry control
    - _Bug_Condition: isBugCondition(input) where isLocalePrefixedUnknownPath(input.path) = TRUE_
    - _Expected_Behavior: the app's 404 page served at HTTP status 404_
    - _Preservation: no existing route resolution changes_
    - _Requirements: 1.3, 2.3_

  - [ ] 3.6 Add `src/lib/errorReporting.ts` with the sanitizer and capture
    - **Property 5: Fix Checking** - Error telemetry carries no image-derived data
    - New file exporting `sanitizeErrorMessage(message)` and `reportAppError(error, context)`
    - `sanitizeErrorMessage` redacts before capture: strips `blob:` and `data:` URLs, strips anything matching an image file extension pattern, collapses path-like tokens, truncates to a fixed length cap. Apply it to every message including messages the app did not author, so a third-party library that echoes a filename cannot leak it
    - `reportAppError` emits PostHog event `app_error` with exactly this field set and nothing else: `error_name`, `error_message` (sanitized and truncated), `error_digest`, `route` (pathname only, query dropped), `boundary` (`"route" | "global"`), `translation_active` (derived from `translated-ltr` / `translated-rtl` classes on `<html>` and a `lang` attribute that no longer reads `en`), `browser_language` (`navigator.language`)
    - Send no stack traces
    - Unit tests: redaction of `blob:` URLs, `data:` URLs, image filenames with extensions, path-like tokens, and the length cap. `reportAppError` emits exactly the allowed field set for both boundary levels
    - Property test over generated error objects whose names and messages embed filenames, `blob:` URLs, `data:` URLs, EXIF-looking key and value pairs, and long paths. Assert the captured payload contains no substring from the image-derived input and no key outside the allowed set. This is the privacy invariant expressed as a property and the single most important generated test in this fix
    - _Bug_Condition: isBugCondition(input) where a boundary catches, making telemetry a new outbound path_
    - _Expected_Behavior: payload fields are a subset of the allowed set and carry no image-derived substrings_
    - _Preservation: no image bytes, filenames, dimensions, or EXIF values leave the browser (requirement 3.2)_
    - _Requirements: 1.5, 2.5, 3.2_

  - [ ] 3.7 Add the `before_send` sanitizer hook to `instrumentation-client.ts`
    - `capture_exceptions: true` already auto-captures uncaught errors independently of the boundaries, so hold that path to the same privacy standard
    - Add a `before_send` hook that runs `sanitizeErrorMessage` over `$exception` event message fields
    - Leave every other init option untouched, including the `/ingest` proxy, the web vitals config, and `on_request_error`
    - Accept that one failure can produce both an `app_error` and an `$exception` event. Boundary attribution is worth the duplication and the two event names keep them separable
    - Unit test: an `$exception` event carrying a `blob:` URL and an image filename comes out of `before_send` redacted, and a non-exception event passes through unmodified
    - _Bug_Condition: isBugCondition(input) where clientRenderThrows = TRUE and PostHog auto-capture fires_
    - _Expected_Behavior: Property 5 allowed-field and no-image-substring guarantees apply to auto-captured exceptions too_
    - _Preservation: existing PostHog init options and event flow unchanged_
    - _Requirements: 2.5, 3.2_

  - [ ] 3.8 Add `isKnownRoute` to `src/proxy.ts` so unknown paths reach the 404
    - **Property 3: Fix Checking** - Unknown locale-prefixed paths resolve to the app's 404
    - Keep the inverted default-protect model. Do not convert to an explicit protected-route matcher, which would make every future route public by default and put requirement 3.4 at ongoing risk
    - Add a second matcher `isKnownRoute` enumerating the paths the app actually serves, public and protected alike, including `/dashboard(.*)`, `/thank-you(.*)`, and the PayPal API routes
    - Decision order: matches `isPublicRoute`, allow through; matches `isKnownRoute` but not `isPublicRoute`, call `auth.protect()` exactly as today; matches neither, return without calling `auth.protect()` and let Next routing fall through to `not-found.tsx` at status 404
    - No locale regex in the middleware. Unknown locale-prefixed paths are handled as a special case of unknown paths generally, which avoids a language-tag pattern shadowing a future two-letter route
    - Leave the `matcher` config array unchanged
    - Do not redirect `/pt-br/pricing` to `/pricing`. That invents a locale routing contract the app does not have, and requirement 2.3 specifies a 404
    - Unit tests: `isKnownRoute` classification, one case each for public, known-but-protected, and unknown
    - Property test over generated path strings mixing valid routes, valid routes with language-tag prefixes, and random unknown paths. Assert `auth.protect()` is invoked only for known non-public routes and that everything unknown resolves to 404
    - Integration check against a built app (`next build` then `next start`): `/pt-br/`, `/pt/pricing`, `/es/docs` return status 404 with the app 404 body and no sign-in redirect, and `/dashboard` signed out still redirects to sign-in
    - _Bug_Condition: isLocalePrefixedUnknownPath(input.path) = TRUE_
    - _Expected_Behavior: 404 status with the app 404 page, no auth.protect() invocation_
    - _Preservation: Clerk protection of `/dashboard` and every other known non-public route is unchanged (requirement 3.4)_
    - _Requirements: 1.3, 2.3, 3.4_

  - [ ] 3.9 Mark translation-volatile nodes in `src/components/Header.tsx`
    - Keep `<html lang="en">` in `src/app/layout.tsx` exactly as it is. The document language declaration must stay consistent with the English content served
    - Do not add a document-wide `<meta name="google" content="notranslate">` and do not put `translate="no"` on `<html>`. Blanket opt-out would take translation away from the visitors this fix exists to help
    - Add `translate="no"` plus the legacy `notranslate` class to the theme toggle button and its `title`, the auth action region that swaps between `SignInButton` and `UserButton`, and the mobile drawer container
    - Give the conditionally rendered subtrees a stable outer wrapper element that React owns and translation does not touch, so the node inserted or removed during a swap is a wrapper rather than a translated text node
    - Leave static nav labels translatable. Text that never changes after hydration is not a reconciliation hazard
    - This reduces trigger frequency, it is not a guarantee. The error boundary stays the backstop and the fix does not depend on marking being exhaustive
    - Unit test: toggling the theme and flipping auth state after a simulated translation mutation no longer throws
    - _Bug_Condition: input.browserTranslationActive = TRUE_
    - _Expected_Behavior: the page continues to render and stays interactive, reconciliation does not throw_
    - _Preservation: attributes and wrappers only, visible output for English visitors is unchanged (requirements 3.1, 3.6)_
    - _Requirements: 1.1, 1.4, 2.1, 2.4_

  - [ ] 3.10 Mark translation-volatile stat readouts in `src/components/CleanerInterface.tsx`
    - Add `translate="no"` plus the `notranslate` class to the size delta, pixel count, quality label, and any status or progress text that updates during the pipeline
    - Leave static instructional copy translatable
    - Touch no image data path. `src/hooks/useCanvasEngine.ts` stays untouched
    - Unit test: pipeline step updates after a simulated translation mutation no longer throw
    - _Bug_Condition: input.browserTranslationActive = TRUE_
    - _Expected_Behavior: stat readouts update without a reconciliation throw_
    - _Preservation: exported bytes and metadata stripping are byte-identical (requirements 3.2, 3.3)_
    - _Requirements: 1.1, 1.4, 2.1, 2.4_

  - [ ] 3.11 Pin ambient-locale formatting
    - **Property 4: Fix Checking** - Locale-pinned formatting is visitor-independent
    - Replace `pixelCount.toLocaleString()` in `src/components/CleanerInterface.tsx` with an explicitly pinned locale and explicit options
    - Pin the three unpinned `new Date(...).toLocaleString()` calls in the `src/app/c2pa-scanner/page.tsx` signature readout the same way, with explicit date and time options
    - Leave the `new Date().toLocaleDateString("en-CA")` calls in `CleanerInterface.tsx`, `c2pa-scanner/page.tsx`, and `dashboard/page.tsx` exactly as they are. They are already pinned and they key persisted counters, so changing them would invalidate stored data and break requirement 3.7
    - Unit test: pinned formatting helpers return identical strings under forced `pt-BR`, `de-DE`, and `en-US` runtime locales
    - Property test over generated integer pixel counts and timestamps across a wide range, asserting formatted output is invariant under ambient locale while the `en-CA` counter keys stay byte-identical
    - _Bug_Condition: ambient locale differs from the server locale (design edge case)_
    - _Expected_Behavior: formatted output is identical for every visitor_
    - _Preservation: `en-CA` daily counter keys unchanged so stored counters stay readable (requirement 3.7)_
    - _Requirements: 1.6, 2.6, 3.7_

  - [ ] 3.12 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Non-English visitors always get a usable, app-rendered document
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior. When it passes, the Fix Checking property is satisfied
    - Run with `npx vitest --run`, plus the built-app integration check for Case C
    - **EXPECTED OUTCOME**: Test PASSES for all three cases. Case A survives translation-style mutation, Case B lands on the in-app `ErrorFallback` with a working retry, Case C returns the app 404 at status 404
    - Also run the integration flows from the design: full translated-page flow with no boundary activation, boundary recovery flow with retry, telemetry flow asserting one sanitized `app_error` event
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.13 Verify preservation tests still pass
    - **Property 2: Preservation** - Unaffected page loads behave identically
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run the preservation property tests from task 2 against the fixed code
    - **EXPECTED OUTCOME**: Tests PASS. English markup matches the baseline, exported blob bytes are byte-identical, `/dashboard` signed out still redirects to sign-in, prices still resolve from `src/config/pricing.ts` at 24.99 USD, theme persistence is unchanged, `en-CA` counter keys are unchanged, sitemap and robots URL sets are unchanged with no locale-prefixed entries
    - Confirm no regressions across the full suite
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run `npx vitest --run` for the full unit and property suite
  - Run the integration suite against a built app: `npm run build` then `npm run start` in a separate terminal you control, then the HTTP checks. Never run `npm run dev`
  - Run `npm run build` and confirm it passes. New root-level App Router convention files are exactly the kind of change that surfaces at build time
  - Run `npm run lint` and confirm it passes
  - Remove any temporary fixtures or scratch files created during verification
  - Ensure all tests pass, ask the user if questions arise
