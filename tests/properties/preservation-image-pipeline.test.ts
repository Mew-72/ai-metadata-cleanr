/**
 * Property 2: Preservation - the image pipeline and its exported bytes are
 * unchanged, and nothing image derived leaves the browser.
 *
 * **Validates: Requirements 3.2, 3.3**
 *
 * Scope limitation, stated plainly: byte-for-byte export comparison needs a
 * real canvas encoder. jsdom has none, so encoding a JPEG, PNG or HEIC fixture
 * and diffing the output blob is not something this suite can honestly do. That
 * comparison belongs in the browser-backed suite (`tests/performance` already
 * drives a real browser) and is listed as an integration check.
 *
 * What this file does assert, and what actually protects requirements 3.2 and
 * 3.3 against THIS fix:
 *  1. the pipeline source is untouched, so encoder output cannot have moved -
 *     the design lists `useCanvasEngine.ts` and `exifInjector.ts` as not
 *     touched, and a content hash is the cheapest way to hold that,
 *  2. the format routing decision (`isHeic`) is behaviourally unchanged over
 *     generated filenames and mime types, exercising the real exported
 *     function,
 *  3. no module on the image data path can transmit anything: no fetch, no
 *     XHR, no beacon, no WebSocket, no analytics capture.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { baselineFor } from "../support/baseline";
import { isHeic } from "../../src/hooks/useCanvasEngine";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Modules the fix must not touch, per the design's Files Touched table. */
const IMAGE_PATH_MODULES = [
  "src/hooks/useCanvasEngine.ts",
  "src/lib/exifInjector.ts",
];

/** Outbound transports that would break the privacy invariant. */
const OUTBOUND_PATTERNS: [string, RegExp][] = [
  ["fetch", /\bfetch\s*\(/],
  ["XMLHttpRequest", /XMLHttpRequest/],
  ["sendBeacon", /sendBeacon/],
  ["WebSocket", /WebSocket/],
  ["EventSource", /EventSource/],
  ["posthog capture", /posthog[\s\S]{0,20}\.capture\s*\(/],
];

function sourceOf(relative: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, relative), "utf8");
}

function hashOf(relative: string): string {
  return crypto
    .createHash("sha256")
    // Normalize line endings so a checkout on another platform does not
    // register as a content change.
    .update(sourceOf(relative).replace(/\r\n/g, "\n"))
    .digest("hex");
}

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"];
const MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "",
];

function fakeFile(name: string, type: string): File {
  return new File([new Uint8Array([0])], name, { type });
}

describe("Property 2: the image data path is untouched", () => {
  it("keeps the pipeline modules byte-identical", () => {
    for (const relative of IMAGE_PATH_MODULES) {
      const hash = hashOf(relative);
      expect(hash, `${relative} changed, so exported bytes may have changed`).toEqual(
        baselineFor("imagePipeline", `sha256|${relative}`, hash),
      );
    }
  });

  it("keeps every outbound transport out of the image data path", () => {
    for (const relative of IMAGE_PATH_MODULES) {
      const source = sourceOf(relative);
      for (const [label, pattern] of OUTBOUND_PATTERNS) {
        expect(
          pattern.test(source),
          `${relative} gained an outbound ${label} call`,
        ).toBe(false);
      }
    }
  });
});

describe("Property 2: format routing is unchanged", () => {
  it("classifies HEIC by mime type or extension, and nothing else", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z0-9_ -]{1,16}$/),
        fc.constantFrom(...IMAGE_EXTENSIONS),
        fc.constantFrom(...MIME_TYPES),
        fc.boolean(),
        (stem, ext, mime, upperExt) => {
          const suffix = upperExt ? ext.toUpperCase() : ext;
          const name = `${stem}.${suffix}`;
          const expected =
            /^image\/(heic|heif|heic-sequence|heif-sequence)$/i.test(mime) ||
            /^(heic|heif)$/i.test(suffix);
          expect(isHeic(fakeFile(name, mime)), `${name} (${mime})`).toBe(
            expected,
          );
        },
      ),
      { numRuns: 200 },
    );
  });
});
