# ScrubAI v1.5 — Multi-Agent Task Board

**Branch:** `v1.5`
**Started:** 2026-05-28
**Charter:** Implement all assigned agent tasks from `AGENTS.md`, plus a mobile hero UX fix. No video support.

---

## 🚀 User-Requested Hotfix (cross-cutting)

- [x] **Mobile hero confusion** → Hide the right-side hero "Cleaner Interface mockup" card on mobile (`<lg`) so users go to the real workspace below. Keep left column copy & marketing privacy claim untouched.
  - File: `src/app/page.tsx`

---

## 🧑‍💻 Agent A — Core Image Processing & Formats
Files: `src/components/CleanerInterface.tsx`, `src/hooks/useCanvasEngine.ts` (NEW)

- [x] **A1. HEIC/HEIF input conversion** — accept `.heic` / `.heif` from iOS uploads, convert to JPEG before processing. Implemented via dynamic import of `heic2any`.
- [x] **A2. Export quality slider (0.1 – 1.0)** — let users dial PNG (lossless) vs aggressive JPEG. Wire into the canvas `toBlob` quality arg.
- [x] **A3. Canvas resizing presets** — preset selector (Original / 1080p / 4K) auto-downscales the canvas before re-export. Aspect-ratio preserved.
- [x] **A4. Extract canvas pipeline into `useCanvasEngine` hook** — keeps `CleanerInterface.tsx` lean and respects boundary contract.

---

## 🎨 Agent B — Premium Aesthetics & Micro-interactions
Files: `src/app/globals.css`, `src/components/Ticker.tsx`, `src/components/Header.tsx`

- [x] **B1. Marquee speed config** — Ticker accepts `speed: "slow" | "normal" | "hyper"`. New CSS classes `.ticker-track--slow`, `--hyper` plus a small per-row pill toggle on the ticker itself.
- [x] **B2. Pulsing double-dashed dropzone overlay** — replace plain dashed border with animated double-rule on drag-enter. New keyframes in `globals.css`, applied conditionally in CleanerInterface.
- [x] **B3. Premium editorial kerning** — wide-screen (`>= 1280px`) typography tweaks: tightened tracking on serif h1/h2, optical kerning on ticker, and dialed leading on body copy via new `@media` block.

---

## 💳 Agent C — Auth & Upgrade Refresh
Files: `src/components/BillingModal.tsx`, `src/hooks/useAppAuth.ts`, `src/app/dashboard/page.tsx`

> Note: ScrubAI has migrated from Clerk Billing to PayPal one-time. C1 (dashboard plan sync) is already complete via PayPal capture writing `publicMetadata.plan = "pro"`. So the meaningful work here is C2 + C3.

- [x] **C1. Confirm PayPal → Clerk publicMetadata sync flow** — reviewed `/api/paypal/capture-order` updates `publicMetadata.plan`, `useAppAuth` reads it.
- [x] **C2. Modal tier mapping points to live PayPal checkout** — `BillingModal` already routes to `/pricing`; verified copy is accurate, no Stripe links remain.
- [x] **C3. Upgrade refresh logic preserves file queue** — when `isPro` flips from `false → true` mid-session, refresh entitlements without dropping the in-progress queue. Achieved via `clerk.user.reload()` polling helper hook + the existing `useEffect` on `isPro` already updating the tier without touching `files`.

---

## 📖 Agent D — Privacy Docs & Technical Briefing
Files: `src/app/docs/page.tsx` (NEW), `src/app/docs/layout.tsx` (NEW), `src/app/docs/[slug]/page.tsx` (NEW), `src/content/docs/*.md` (NEW)

- [x] **D1. Docs route shell** — Next.js App Router `/docs` index with sidebar + content pane in the existing newsprint design.
- [x] **D2. Reach Penalties Guide** — long-form editorial piece on Instagram & Pinterest metadata-driven suppression.
- [x] **D3. Annihilation Math** — pixel-redraw vs metadata-stripping, with security validation reasoning.
- [x] **D4. Client-side docs search** — fast in-memory filter pane, no server hit.
- [x] **D5. Surface docs from Header / Footer** — add a "Docs" link so users can find the new section.

---

## ✅ Done / verification
- [x] Build succeeds (`npm run build`)
- [x] No video acceptance anywhere (`accept="image/*,.heic,.heif"` only)
- [x] Mobile hero verified at `< lg` breakpoint
