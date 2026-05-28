"use client";

/**
 * useCanvasEngine
 * ─────────────────
 * Encapsulates the client-side image purification pipeline so that
 * `CleanerInterface.tsx` stays focused on UX state.
 *
 * Pipeline:
 *  1. HEIC / HEIF → JPEG conversion (dynamic-import heic2any so the bundle
 *     only pulls the dependency on demand and we don't blow up SSR).
 *  2. Optional canvas resize to a preset (Original / 1080p / 4K).
 *  3. Re-encode to PNG / JPEG / WebP.
 *  4. **Container scrub** — manually walk the encoded blob and strip every
 *     metadata segment / chunk the browser adds during step 3.
 *
 * Step 4 is what guarantees true annihilation. Browsers (especially
 * Chromium) embed an sRGB ICC profile, sometimes EXIF, in canvas-encoded
 * JPEGs. Chrome's bundled sRGB profile carries "Google Inc." vendor
 * strings, which is benign but is exactly the kind of thing an EXIF
 * reader will surface to a confused user. We strip it.
 */

import { useCallback } from "react";

export type ResizePreset = "original" | "1080p" | "4k";
export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

export interface PurifyOptions {
    /** 0.1–1.0. Ignored for PNG (always lossless). Defaults to 0.95. */
    quality?: number;
    /** Resize preset. Aspect ratio is always preserved. */
    resize?: ResizePreset;
    /** Output mime — defaults to the source mime, falling back to image/png. */
    format?: ExportFormat;
}

export interface PurifyResult {
    blob: Blob;
    width: number;
    height: number;
    format: ExportFormat;
}

const RESIZE_TARGETS: Record<ResizePreset, number | null> = {
    original: null,
    "1080p": 1920,
    "4k": 3840,
};

const HEIC_MIME_RE = /^image\/(heic|heif|heic-sequence|heif-sequence)$/i;
const HEIC_EXT_RE = /\.(heic|heif)$/i;

/** True if the file is HEIC/HEIF (iOS native format). */
export function isHeic(file: File): boolean {
    return HEIC_MIME_RE.test(file.type) || HEIC_EXT_RE.test(file.name);
}

async function convertHeicToJpeg(file: File): Promise<File> {
    const mod = await import("heic2any");
    const heic2any = mod.default ?? (mod as unknown as typeof import("heic2any").default);

    const out = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.95,
    });

    const blob = Array.isArray(out) ? out[0] : out;
    const renamed = file.name.replace(HEIC_EXT_RE, ".jpg");
    return new File([blob], renamed, { type: "image/jpeg" });
}

function computeResize(
    width: number,
    height: number,
    preset: ResizePreset,
): { width: number; height: number } {
    const cap = RESIZE_TARGETS[preset];
    if (!cap) return { width, height };

    const longest = Math.max(width, height);
    if (longest <= cap) return { width, height };

    const ratio = cap / longest;
    return {
        width: Math.round(width * ratio),
        height: Math.round(height * ratio),
    };
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) =>
            reject(new Error(`Image failed to load: ${String(e)}`));
        img.src = src;
    });
}

function pickFormat(source: string | undefined, requested?: ExportFormat): ExportFormat {
    if (requested) return requested;
    if (source === "image/jpeg" || source === "image/jpg") return "image/jpeg";
    if (source === "image/webp") return "image/webp";
    return "image/png";
}

// ──────────────────────────────────────────────────────────────────────
// Container metadata strippers
//
// All three formats (JPEG / PNG / WebP) have a chunked structure where
// metadata is segregated from the compressed pixel data. Removing the
// metadata-bearing segments is a byte-level rewrite — pixels are not
// re-decoded — so it's lossless for the image content.
// ──────────────────────────────────────────────────────────────────────

/**
 * Strip every JPEG APP segment that can carry metadata.
 *
 *   APP0  (FFE0)  JFIF              → kept (structural marker)
 *   APP1  (FFE1)  EXIF / XMP        → stripped
 *   APP2  (FFE2)  ICC profile       → stripped (this is where "Google Inc." lives)
 *   APP11 (FFEB)  JUMBF / C2PA      → stripped
 *   APP13 (FFED)  IPTC / Photoshop  → stripped
 *   APP14 (FFEE)  Adobe color       → stripped
 *   any other APP                   → stripped
 *
 * SOF, DHT, DQT, SOS, image data, EOI are copied verbatim.
 */
function stripJpegMetadata(buf: ArrayBuffer): ArrayBuffer {
    const u8 = new Uint8Array(buf);
    const view = new DataView(buf);
    if (u8.length < 4 || u8[0] !== 0xff || u8[1] !== 0xd8) return buf; // not a JPEG

    // Track ranges of bytes to keep, then concat at the end. This avoids
    // pushing one byte at a time which is unusably slow on large images.
    const keep: Array<[number, number]> = [[0, 2]]; // SOI
    let i = 2;

    while (i < u8.length - 1) {
        if (u8[i] !== 0xff) break; // malformed — stop scanning, copy remainder below

        const marker = u8[i + 1];

        // Padding / fill bytes
        if (marker === 0x00 || marker === 0xff) {
            keep.push([i, i + 2]);
            i += 2;
            continue;
        }

        // SOS = start of compressed data. From here to EOI we copy verbatim.
        if (marker === 0xda) {
            keep.push([i, u8.length]);
            i = u8.length;
            break;
        }

        // EOI hit before SOS (unlikely but defensive)
        if (marker === 0xd9) {
            keep.push([i, i + 2]);
            i += 2;
            break;
        }

        // Length-bearing segment
        if (i + 3 >= u8.length) break;
        const segLen = view.getUint16(i + 2);
        if (segLen < 2 || i + 2 + segLen > u8.length) break;

        const isApp = marker >= 0xe0 && marker <= 0xef;
        const isJfif = marker === 0xe0;

        if (!isApp || isJfif) {
            keep.push([i, i + 2 + segLen]);
        }
        // else: drop the entire APP segment

        i += 2 + segLen;
    }

    // If we bailed early due to malformed input, copy whatever's left
    if (i < u8.length && keep.length > 0 && keep[keep.length - 1][1] < u8.length) {
        keep.push([i, u8.length]);
    }

    return concatRanges(u8, keep);
}

/**
 * Strip every PNG ancillary chunk that can carry metadata.
 *
 * Critical chunks (uppercase first letter): IHDR, PLTE, IDAT, IEND       → kept
 * Ancillary structural: sRGB, gAMA, cHRM, pHYs, bKGD, sBIT, tRNS, hIST   → kept
 * Stripped:
 *   iCCP   → ICC profile (vendor strings, including Google sRGB)
 *   tEXt / zTXt / iTXt → free-form text including Adobe XMP packets
 *   eXIf   → embedded EXIF (yes, PNG can carry EXIF since 2017)
 *   cICP   → coding-independent code points (color tagging)
 */
function stripPngMetadata(buf: ArrayBuffer): ArrayBuffer {
    const u8 = new Uint8Array(buf);
    const view = new DataView(buf);

    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if (u8.length < 8 || u8[0] !== 0x89 || u8[1] !== 0x50 || u8[2] !== 0x4e) {
        return buf;
    }

    const STRIP = new Set(["iCCP", "tEXt", "zTXt", "iTXt", "eXIf", "cICP"]);
    const keep: Array<[number, number]> = [[0, 8]]; // PNG signature
    let i = 8;

    while (i + 8 <= u8.length) {
        const len = view.getUint32(i);
        const type = String.fromCharCode(u8[i + 4], u8[i + 5], u8[i + 6], u8[i + 7]);
        const total = 4 + 4 + len + 4; // length + type + data + crc

        if (i + total > u8.length) break;

        if (!STRIP.has(type)) {
            keep.push([i, i + total]);
        }

        i += total;
        if (type === "IEND") break;
    }

    return concatRanges(u8, keep);
}

/**
 * Strip metadata chunks from a WebP file.
 *
 * Riff structure: "RIFF" + 4-byte size + "WEBP" + chunks.
 * Each chunk: 4-byte FourCC + 4-byte size + data + 1-byte pad if size is odd.
 *
 * Strip: EXIF, XMP , ICCP. Keep: VP8 / VP8L / VP8X / ALPH / ANIM / ANMF.
 *
 * Note: when we strip ICCP/EXIF/XMP we should also clear the corresponding
 * flag bits in the VP8X header so decoders don't expect them. We do that
 * inline below.
 */
function stripWebpMetadata(buf: ArrayBuffer): ArrayBuffer {
    const u8 = new Uint8Array(buf);
    if (u8.length < 12) return buf;

    const tag = (offset: number) =>
        String.fromCharCode(u8[offset], u8[offset + 1], u8[offset + 2], u8[offset + 3]);

    if (tag(0) !== "RIFF" || tag(8) !== "WEBP") return buf;

    const STRIP = new Set(["EXIF", "XMP ", "ICCP"]);
    const view = new DataView(buf);

    // Header: RIFF + size (placeholder) + WEBP
    const keep: Array<[number, number]> = [[0, 12]];
    let i = 12;
    let vp8xOffset = -1;
    const stripped = new Set<string>();

    while (i + 8 <= u8.length) {
        const fourCC = tag(i);
        // WebP chunk sizes are little-endian
        const size = view.getUint32(i + 4, true);
        const padded = size + (size & 1); // pad to even
        const total = 8 + padded;

        if (i + total > u8.length) break;

        if (STRIP.has(fourCC)) {
            stripped.add(fourCC);
        } else {
            if (fourCC === "VP8X") vp8xOffset = i;
            keep.push([i, i + total]);
        }

        i += total;
    }

    const out = concatRanges(u8, keep);
    const outU8 = new Uint8Array(out);
    const outView = new DataView(out);

    // Patch RIFF size = file length - 8
    outView.setUint32(4, outU8.length - 8, true);

    // Patch VP8X feature flag bits if we stripped any of EXIF/XMP/ICCP.
    // VP8X chunk body: byte 0 is feature bitfield.
    //   bit 5 = ICC profile, bit 3 = EXIF, bit 2 = XMP
    if (vp8xOffset >= 0 && stripped.size > 0) {
        // After concat, vp8xOffset still points to the VP8X chunk header
        // (we kept everything before it, and the headers we stripped came
        // after it in our scan order so the position is unchanged).
        const flagPos = vp8xOffset + 8; // skip 4-byte FourCC + 4-byte size
        if (flagPos < outU8.length) {
            let flags = outU8[flagPos];
            if (stripped.has("ICCP")) flags &= ~(1 << 5);
            if (stripped.has("EXIF")) flags &= ~(1 << 3);
            if (stripped.has("XMP ")) flags &= ~(1 << 2);
            outU8[flagPos] = flags;
        }
    }

    return out;
}

function concatRanges(u8: Uint8Array, ranges: Array<[number, number]>): ArrayBuffer {
    const total = ranges.reduce((sum, [s, e]) => sum + (e - s), 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const [s, e] of ranges) {
        out.set(u8.subarray(s, e), off);
        off += e - s;
    }
    // Ensure we return a real ArrayBuffer, not a SharedArrayBuffer view.
    return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer;
}

async function scrubContainer(blob: Blob, format: ExportFormat): Promise<Blob> {
    const buf = await blob.arrayBuffer();
    let scrubbed: ArrayBuffer;
    switch (format) {
        case "image/jpeg":
            scrubbed = stripJpegMetadata(buf);
            break;
        case "image/png":
            scrubbed = stripPngMetadata(buf);
            break;
        case "image/webp":
            scrubbed = stripWebpMetadata(buf);
            break;
        default:
            return blob;
    }
    return new Blob([scrubbed], { type: format });
}

// ──────────────────────────────────────────────────────────────────────

export function useCanvasEngine() {
    const purifyImage = useCallback(
        async (file: File, opts: PurifyOptions = {}): Promise<PurifyResult> => {
            const {
                quality = 0.95,
                resize = "original",
                format,
            } = opts;

            const sourceFile = isHeic(file) ? await convertHeicToJpeg(file) : file;
            const objectUrl = URL.createObjectURL(sourceFile);

            try {
                const img = await loadImageElement(objectUrl);

                const { width, height } = computeResize(
                    img.naturalWidth,
                    img.naturalHeight,
                    resize,
                );

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Canvas 2D context unavailable in this browser");

                const outFormat = pickFormat(sourceFile.type, format);
                const safeQuality = Math.min(1, Math.max(0.1, quality));

                // JPEG cannot carry alpha. Pre-fill so browsers don't silently
                // demote the encode to PNG when the source has transparency.
                if (outFormat === "image/jpeg") {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, width, height);
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);

                const rawBlob = await new Promise<Blob | null>((resolve) => {
                    canvas.toBlob(resolve, outFormat, safeQuality);
                });

                if (!rawBlob) throw new Error("Canvas export returned null blob");

                const actualFormat = (rawBlob.type || outFormat) as ExportFormat;
                if (actualFormat !== outFormat) {
                    console.warn(
                        `[useCanvasEngine] Browser returned ${actualFormat} when ${outFormat} was requested.`,
                    );
                }

                // Final pass: strip every metadata segment / chunk the
                // browser inserted during canvas.toBlob. This is what
                // takes the output from "no source metadata" to "no
                // metadata at all" — including Chrome's bundled ICC
                // profile that carries "Google Inc." vendor strings.
                const blob = await scrubContainer(rawBlob, actualFormat);

                return { blob, width, height, format: actualFormat };
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        },
        [],
    );

    const normalizeForAudit = useCallback(async (file: File): Promise<File> => {
        if (isHeic(file)) return convertHeicToJpeg(file);
        return file;
    }, []);

    return { purifyImage, normalizeForAudit, isHeic };
}
