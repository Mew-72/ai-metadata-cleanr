# Implementation Plan: Workspace Improvements

## Overview

This plan implements six functional improvements to the ScrubAI workspace: translation-resilient controls, centralized tier limits config, tier resolution logic, real EXIF injection into JPEG/WebP, a bundled sample image with genuine metadata, and UX fixes (quality slider disable for PNG, options block layout anchoring). Tasks are ordered by dependency: config first, then tier logic, then independent modules (EXIF injector, sample image), then canvas engine wiring, and finally CleanerInterface integration.

## Tasks

- [x] 1. Set up tier limits config and types
  - [x] 1.1 Add TIER_LIMITS config and types to `src/config/pricing.ts`
    - Export `TierName` type: `"guest_free" | "user_free" | "pro"`
    - Export `TierLimits` interface with `dailyCleanLimit`, `maxBatchSize`, `maxUploadMB`
    - Export `TIER_LIMITS` record mapping each tier to its limits: guest_free (5, 1, 25), user_free (10, 1, 25), pro (0, 50, 100)
    - Keep existing `PRICING` export unchanged
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 1.2 Write unit tests for pricing config shape
    - Verify all three tiers exist with correct `dailyCleanLimit`, `maxBatchSize`, `maxUploadMB` values
    - Verify `dailyCleanLimit: 0` sentinel for pro tier
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 2. Implement tier resolver
  - [x] 2.1 Create `src/lib/tierResolver.ts`
    - Import `TierName` from `@/config/pricing`
    - Define `AuthState` interface: `{ isLoaded: boolean; isSignedIn: boolean | undefined; isPro: boolean }`
    - Export `resolveTier(auth: AuthState): TierName` function
    - Logic: if !isLoaded → guest_free; if isPro → pro; if isSignedIn → user_free; else → guest_free
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 2.2 Write property test for gating decision correctness (Property 1)
    - **Property 1: Gating decision correctness**
    - **Validates: Requirements 2.6, 2.7, 2.8, 3.8**
    - Use fast-check: generate `{ tier: fc.constantFrom("guest_free", "user_free", "pro"), count: fc.nat(1000) }`
    - Assert: permit iff tier is "pro" OR count < TIER_LIMITS[tier].dailyCleanLimit

  - [ ]* 2.3 Write unit tests for tier resolver
    - Test 4 cases: isLoaded=false, guest (signed out), user_free (signed in, not pro), pro
    - Test edge case: isSignedIn=undefined treated as false
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Implement EXIF injector module
  - [x] 3.1 Create `src/lib/exifInjector.ts`
    - Export `ExifProfile` interface: `{ make, model, lensModel, software, dateTimeOriginal }`
    - Export `InjectResult` interface: `{ blob: Blob; injected: boolean; error?: string }`
    - Export `CAMERA_PROFILES` record for iphone, canon, sony profiles
    - Implement `injectExif(blob: Blob, profile: ExifProfile, format: ExportFormat): Promise<InjectResult>`
    - Build valid TIFF header + IFD0 (Make, Model, Software, DateTime, ExifIFD ptr) + Sub-IFD (LensModel, DateTimeOriginal)
    - For JPEG: construct APP1 segment (FF E1 + length + "Exif\0\0" + TIFF payload), inject after SOI
    - For WebP: construct "EXIF" chunk with TIFF payload, set bit 3 in VP8X flags
    - For PNG: return blob unchanged with `injected: false`
    - On any error: return original blob unchanged with `injected: false` and `error` message
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 3.2 Write property test for EXIF round-trip (Property 2)
    - **Property 2: EXIF injection round-trip**
    - **Validates: Requirements 5.4**
    - Use fast-check: generate profile from constantFrom("iphone", "canon", "sony") and date formatted as EXIF datetime
    - Inject into a minimal valid JPEG fixture, then parse with ExifReader
    - Assert: Make, Model, LensModel, Software, DateTimeOriginal match injected values

  - [ ]* 3.3 Write property test for EXIF structural validity (Property 3)
    - **Property 3: EXIF structural validity**
    - **Validates: Requirements 5.1, 5.3**
    - Use fast-check: generate profile, inject into JPEG and WebP fixtures
    - Assert: ExifReader.load() does not throw, parsed output contains all 5 required tag keys

- [x] 4. Create real sample image module
  - [x] 4.1 Create `src/lib/sampleImage.ts`
    - Export `SAMPLE_IMAGE_BASE64` constant: a base64-encoded JPEG (under 4KB base64 / ~3KB file)
    - The JPEG must contain real EXIF tags (Make, Model, Software, DateTimeOriginal), GPS tags (Latitude, Longitude), and a C2PA-like APP11 JUMBF marker
    - Export `createSampleFile(): File` function that decodes the base64 to a `File` object with name `"DALL·E 2026_Camera_Studio_Export.jpg"` and type `"image/jpeg"`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 4.2 Write unit tests for sample image
    - Decode base64, verify dimensions >= 1x1
    - Verify byte size <= 51200
    - Parse with ExifReader: verify presence of EXIF, GPS, and C2PA/JUMBF tags
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 5. Checkpoint - Verify independent modules
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Wire EXIF injection into canvas engine
  - [x] 6.1 Update `src/hooks/useCanvasEngine.ts` to integrate EXIF injection
    - Add optional `profile` field to `PurifyOptions` (type: `ExifProfile | undefined`)
    - Add `injected` boolean to `PurifyResult`
    - After `scrubContainer`, if `profile` is provided and format is not PNG, call `injectExif(blob, profile, format)`
    - If format is PNG or profile is undefined, set `injected: false`
    - Return updated `PurifyResult` with the (possibly injected) blob
    - _Requirements: 5.1, 5.5, 5.7, 6.1, 6.3_

  - [ ]* 6.2 Write property test for source metadata elimination (Property 4)
    - **Property 4: Source metadata elimination after cleaning**
    - **Validates: Requirements 5.5, 6.1, 6.2**
    - Use fixture images with known metadata, clean with canvas engine
    - Assert: output contains zero source-derived metadata tags; only injected profile tags if profile != none

  - [ ]* 6.3 Write property test for pixel dimension preservation (Property 5)
    - **Property 5: Pixel dimension preservation**
    - **Validates: Requirements 6.5**
    - Use fixture images of varying dimensions, clean at "original" resize preset
    - Assert: output width and height equal input natural width and height

  - [ ]* 6.4 Write property test for quality monotonicity (Property 6)
    - **Property 6: Quality monotonicity for lossy formats**
    - **Validates: Requirements 8.1, 8.2**
    - Generate two quality values q1 > q2 with |q1 - q2| >= 0.1
    - Export same source to JPEG/WebP at both qualities
    - Assert: output at q1 has strictly greater byte size than output at q2

- [x] 7. Integrate all changes into CleanerInterface
  - [x] 7.1 Wire tier resolution and config-driven limits into `src/components/CleanerInterface.tsx`
    - Import `resolveTier` from `@/lib/tierResolver` and `TIER_LIMITS`, `TierName` from `@/config/pricing`
    - Replace `activeTier` state (currently `"free" | "pro"`) with computed `TierName` using `resolveTier({ isLoaded, isSignedIn, isPro })`
    - Replace all hardcoded limit numbers (5, 50) with `TIER_LIMITS[currentTier].dailyCleanLimit` and `.maxBatchSize`
    - Update limit-reached modal text to show the correct per-tier limit
    - Update clean-count badge and used-today text to reflect current tier limit
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 7.2 Add translation-resilience attributes to controls
    - Add `translate="no"` attribute and `className="notranslate"` to Output_Format `<select>`, its label, and all `<option>` elements
    - Add same attributes to Camera_Profile `<select>`, its label, and all `<option>` elements
    - Ensure `htmlFor` / `id` association is maintained so label activation moves focus to control
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 7.3 Disable quality slider for PNG and anchor options block layout
    - Disable the Export_Quality slider (`disabled` attribute + visual indication) when `exportFormat === "image/png"`
    - Add visible text indicating quality does not apply to PNG
    - Restructure left column as `flex flex-col` with Options_Block wrapper getting `mt-auto`
    - Conditionally render Options_Block only when `files.length > 0`
    - Ensure minimum 16px gap between image queue and Options_Block
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 7.4 Wire real sample image and EXIF profile pass-through
    - Import `createSampleFile` from `@/lib/sampleImage`
    - Replace `handleUseSample` to use `createSampleFile()` and feed it through `handleFilesAdded` so it goes through the real audit pipeline
    - Pass selected camera profile as `ExifProfile` to `purifyImage` options (map `spoofProfile` to `CAMERA_PROFILES` or `undefined` for "none")
    - Update `getSafeSpoofedMetadata` display logic to reflect that EXIF is now real (injected), not just displayed
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6, 7.7, 5.1, 5.2_

  - [ ]* 7.5 Write component tests for CleanerInterface
    - Test translation attributes: query controls for `translate="no"` and `.notranslate` class
    - Test PNG slider disable: set format to PNG, verify slider has `disabled` attribute
    - Test options block ordering: verify child elements appear in correct order
    - Test options block hidden when zero files
    - _Requirements: 1.3, 8.3, 9.3, 9.6_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The EXIF injector (task 3) and sample image (task 4) are independent and can be built in parallel
- Config (task 1) must complete before tier resolver (task 2)
- Canvas engine changes (task 6) depend on the EXIF injector (task 3)
- CleanerInterface integration (task 7) depends on all prior tasks

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "4.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "3.2", "3.3", "4.2"] },
    { "id": 2, "tasks": ["2.2", "2.3", "6.1"] },
    { "id": 3, "tasks": ["6.2", "6.3", "6.4", "7.1", "7.2"] },
    { "id": 4, "tasks": ["7.3", "7.4"] },
    { "id": 5, "tasks": ["7.5"] }
  ]
}
```
