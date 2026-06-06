<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project runs **Next.js 16.2.6** with **React 19.2**. APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing route handlers, layouts, server actions, or metadata. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ScrubAI — Agent Guide

ScrubAI is a local-first image metadata remover. Users drop images into the browser, the canvas redraws them pixel-by-pixel, and the re-exported file carries no EXIF, GPS, IPTC, XMP, or C2PA Content Credentials. Nothing is uploaded. Nothing leaves the sandbox. That invariant is the product.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| React | 19.2.4 |
| Styling | Tailwind v4 (CSS-first, no `tailwind.config.*`) — design tokens live in `src/app/globals.css` inside `@theme { }` |
| Auth | `@clerk/nextjs` ^7.4.1 |
| Payments | `@paypal/react-paypal-js` ^9.2.0 (one-time Lifetime Pro, no subscriptions) |
| Icons | `lucide-react` (only icon library — don't add others) |
| Analytics | `posthog-js` (UI events only — never image content) |
| Image work | `exifreader`, `heic2any`, `jszip`, `@contentauth/c2pa-web` |

No shadcn, no Radix, no framer-motion. Components are hand-rolled JSX + Tailwind. Animations are CSS keyframes in `globals.css`.

## Repo orientation

```
src/
  app/
    layout.tsx              Root layout — fonts (next/font), Clerk, Providers
    providers.tsx           PostHog + Clerk identity sync
    globals.css             All design tokens, animations, utility classes
    page.tsx                Marketing landing + embedded workspace
    pricing/                Free vs Lifetime Pro + PayPal checkout
    dashboard/              Authenticated user view
    docs/, docs/[slug]/     Privacy education content
    c2pa-scanner/           Standalone C2PA inspector
    about/                  Company / mission (if present)
    sign-in/, sign-up/      Clerk catch-all auth
    privacy/, terms/, cookies/, security/, refund/, thank-you/
    api/paypal/             PayPal create-order + capture-order
    sitemap.ts, robots.ts
  components/
    Header.tsx, Footer.tsx, Ticker.tsx
    CleanerInterface.tsx    The drop zone + canvas pipeline
    BillingModal.tsx
    docs/MarkdownView.tsx
  hooks/
    useCanvasEngine.ts      Pixel redraw + export
    useAppAuth.ts           Clerk wrapper with isPro logic
  config/
    pricing.ts              Single source of truth for the price
  content/docs/             MDX-style content modules registered in index.ts
```

## Conventions worth knowing

- **Design tokens** — colors, fonts, font-feature-settings all declared as CSS custom properties in `globals.css` and exposed to Tailwind via `@theme`. Edit tokens there, not in component files.
- **Theme switching** — `data-theme="light" | "dark"` on `<html>`. `Header.tsx` reads/writes `localStorage["scrubai-theme"]`.
- **Pricing** — every price string flows through `src/config/pricing.ts`. Don't hardcode dollar amounts in UI or API routes; import `PRICING`.
- **Auth gating** — use `useAppAuth()` (returns `{ isSignedIn, isPro, userId, isLoaded }`). Don't call Clerk hooks directly in feature components.
- **Client vs server** — most pages are `"use client"` because the canvas pipeline and PayPal SDK both need the browser. Metadata exports live in sibling `layout.tsx` files (server). Don't break that split.
- **Privacy invariant** — image bytes never go over the network. Don't `fetch` user images. Don't add SSR for anything that touches `<canvas>` data. Treat this as a hard product constraint.
- **Analytics** — track UI events (`pricing_page_viewed`, `checkout_completed`, etc.). Never log image content, filenames, or EXIF values.
- **Writing content** — Never use em dashes, instead use a normal hyphen.

## Current design direction

The site is moving away from a newsprint / editorial aesthetic (Playfair Display all-caps, JetBrains Mono micro-labels, "Vol. 1 / Local First Edition" chrome, dot-grid paper background, rotated red stamps, hard `border-x border-ink` page frame) toward a **modern minimal SaaS look** — single sans typeface, neutral palette with a tuned red accent, generous whitespace, rounded cards, restrained motion. Match this when adding new UI.

## Working in this repo

- One agent works the whole repo. Don't invent file ownership boundaries; touch what the task needs.
- Before writing a new route, layout, server action, or metadata config, skim the matching page in `node_modules/next/dist/docs/01-app/`.
- Run `npm run build` after non-trivial changes. `npm run lint` for surface-level checks.
- Never start `npm run dev` from a tool call — it blocks the terminal.
