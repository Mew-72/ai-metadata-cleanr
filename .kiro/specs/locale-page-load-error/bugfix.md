# Bugfix Requirements Document

## Introduction

Visitors who are not using the site in default English report that ScrubAI pages fail to render and are replaced by an error screen shown in their own language (Portuguese in the reported case): a warning triangle, "Nao foi possivel carregar esta pagina.", "Recarregue a pagina para tentar novamente ou volte atras.", and Recarregar / Voltar buttons. The English default experience works.

Investigation of the repo establishes an important fact: ScrubAI has no localization layer at all. There is no `[locale]` route segment, no i18n config in `next.config.ts`, no message catalogs, and no translated string anywhere under `src/`. Nothing in the codebase can produce Portuguese UI copy. `src/app/layout.tsx` hardcodes `<html lang="en">`. Therefore the error screen in the report is browser chrome, not an app-rendered error page, and the localized wording is the browser's UI language rather than evidence of a locale-aware code path.

Two mechanisms can put a non-English visitor in front of that screen:

- **Browser page translation.** "Not on the default English version" most plausibly means the visitor is using Chrome/Edge built-in translation. Page translation rewrites and re-parents the text nodes React owns. When React 19 later updates one of those nodes it throws (typically `NotFoundError: Failed to execute 'removeChild'/'insertBefore' on 'Node'`). ScrubAI is client-heavy, so almost every visible text node is React-managed and mutated after hydration by the theme effect, scroll effect, and Clerk auth state resolving.
- **Locale-prefixed URLs.** Translated links, hreflang guesses, and search results frequently point at paths like `/pt-br/`, `/pt/pricing`, `/es/docs`. None of these match a route, and none are listed in the public-route matcher in `src/proxy.ts`, so `clerkMiddleware` runs `auth.protect()` and redirects to sign-in instead of returning the app's 404.

Both mechanisms surface as a dead page for the same reason: the app ships **no error boundary at all**. There is no `error.tsx`, no `global-error.tsx`, and no `componentDidCatch` anywhere in `src/`. Any uncaught client error unmounts the whole React tree to an empty document, and the browser then reports the empty/failed document with its own localized screen. The missing boundary is what turns a recoverable render error into "the site is broken" for non-English users, and it is the defect with the highest confidence and widest blast radius.

Residual uncertainty: the exact browser screen could not be attributed to a specific vendor string because `node_modules/` is not installed in this workspace, so library bundles could not be searched, and the reporter's browser and URL are unknown. The requirements below are therefore written against observable app-side conditions that are each independently verifiable, rather than against a single assumed root cause.

**Reproduction**

1. Open any ScrubAI page (`/`, `/pricing`, `/docs`) in Chrome with UI language set to Portuguese.
2. Accept or trigger "Translate this page" to Portuguese.
3. Interact so React re-renders translated subtrees (toggle theme, open the mobile menu, scroll past the sticky-header threshold, or wait for Clerk auth state to resolve and swap the header between `SignInButton` and `UserButton`).
4. Observed: the page blanks and the browser's localized "could not load" screen appears. Expected: the page keeps working, or an in-app recovery UI appears.

Independent second path: request `https://scrubai.app/pt-br/` or `/pt/pricing`. Observed: redirect to sign-in. Expected: the app's 404.

**Bug Condition**

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type PageLoad { path, browserTranslationActive, clientRenderThrows }
  OUTPUT: boolean

  RETURN X.browserTranslationActive = TRUE
      OR X.clientRenderThrows = TRUE
      OR isLocalePrefixedUnknownPath(X.path)
END FUNCTION
```

```pascal
// Property: Fix Checking - a non-English visitor always gets a usable document
FOR ALL X WHERE isBugCondition(X) DO
  result <- renderPage'(X)
  ASSERT NOT is_empty_document(result)
  ASSERT rendered_by_app(result)        // never the browser's own error screen
  ASSERT has_recovery_affordance(result) // working content, in-app error UI, or app 404
END FOR
```

```pascal
// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT renderPage(X) = renderPage'(X)
END FOR
```

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a visitor loads a ScrubAI page with browser page translation active THEN the browser rewrites React-managed text nodes, React throws during the next reconciliation of those nodes, and the page is lost.

1.2 WHEN any client component throws during render, hydration, or a post-hydration update THEN no error boundary catches it because the app defines no `error.tsx` and no `global-error.tsx`, so the React tree unmounts to an empty document and the browser shows its own localized failure screen.

1.3 WHEN a visitor requests a locale-prefixed path such as `/pt/`, `/pt-br/pricing`, or `/es/docs` THEN no route matches and, because those paths are absent from `isPublicRoute` in `src/proxy.ts`, `clerkMiddleware` calls `auth.protect()` and redirects the visitor to sign-in instead of returning the app's 404.

1.4 WHEN any page is served THEN `<html lang="en">` is hardcoded with no `translate` hints on volatile text, so translation engines are free to rewrite every React-owned string including dynamically updated counters and status labels.

1.5 WHEN a page fails to render for a visitor THEN nothing is reported to PostHog, so the failure is invisible in analytics and cannot be confirmed, scoped, or attributed to a browser or locale.

1.6 WHEN the processed-pixel readout renders THEN `pixelCount.toLocaleString()` in `src/components/CleanerInterface.tsx` formats against the ambient locale, so the same value renders differently between the server locale and a non-English client locale.

### Expected Behavior (Correct)

2.1 WHEN a visitor loads a ScrubAI page with browser page translation active THEN the system SHALL continue to render and remain interactive, with volatile React-managed text isolated from translation rewrites so reconciliation cannot throw.

2.2 WHEN any client component throws during render, hydration, or a post-hydration update THEN the system SHALL catch it in an app-owned error boundary (`error.tsx` plus a `global-error.tsx` fallback) and render an in-app recovery UI offering retry and a link home, so the visitor never sees the browser's own error screen.

2.3 WHEN a visitor requests an unknown locale-prefixed path THEN the system SHALL return the app's 404 page with status 404, without triggering `auth.protect()` or redirecting to sign-in.

2.4 WHEN any page is served THEN the system SHALL keep the document language declaration consistent with the served English content and SHALL mark translation-volatile nodes so translation engines do not rewrite text React updates.

2.5 WHEN a page fails to render THEN the system SHALL capture a PostHog error event carrying error name, message, digest, and route only, so failures are observable.

2.6 WHEN the processed-pixel readout renders THEN the system SHALL format the number with an explicitly pinned locale so output is identical regardless of visitor locale.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a visitor loads the site in English with no browser translation active THEN the system SHALL CONTINUE TO render every page exactly as it does today.

3.2 WHEN images are dropped, cleaned, or exported THEN the system SHALL CONTINUE TO process them entirely in the browser, and no added error reporting SHALL transmit image bytes, filenames, or EXIF values.

3.3 WHEN the canvas pipeline runs THEN the system SHALL CONTINUE TO strip EXIF, GPS, IPTC, XMP, and C2PA metadata and produce identical exported output.

3.4 WHEN a signed-out visitor requests a genuinely protected route such as `/dashboard` THEN the system SHALL CONTINUE TO require authentication via `clerkMiddleware`.

3.5 WHEN the pricing page or billing modal renders THEN the system SHALL CONTINUE TO read every price from `src/config/pricing.ts` and SHALL CONTINUE TO create and capture PayPal orders at 24.99 USD.

3.6 WHEN a visitor toggles the theme THEN the system SHALL CONTINUE TO persist `scrubai-theme` in localStorage and apply `data-theme` on `<html>`.

3.7 WHEN daily clean and scan counts are persisted THEN the system SHALL CONTINUE TO key them by the `en-CA` pinned date string so existing stored counters stay valid.

3.8 WHEN `robots.txt` and `sitemap.xml` are requested THEN the system SHALL CONTINUE TO serve the current unprefixed URL set.
