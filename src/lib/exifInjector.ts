/**
 * exifInjector.ts
 * ────────────────
 * Builds a minimal valid EXIF block (TIFF header + IFD0 + Exif Sub-IFD)
 * and injects it into JPEG or WebP byte streams. PNG is returned unchanged.
 *
 * All work is client-side in-memory ArrayBuffer operations.
 * No network requests. No partial writes - on any error the original blob
 * is returned unchanged.
 */

import type { ExportFormat } from "@/hooks/useCanvasEngine";

// ─── Public interfaces ───────────────────────────────────────────────

export interface ExifProfile {
    make: string;
    model: string;
    lensModel: string;
    software: string;
    dateTimeOriginal: string; // "YYYY:MM:DD HH:MM:SS"
}

export interface InjectResult {
    blob: Blob;
    injected: boolean;
    error?: string;
}

// ─── Camera profile constants ────────────────────────────────────────

export const CAMERA_PROFILES: Record<string, ExifProfile> = {
    iphone: {
        make: "Apple",
        model: "iPhone 15 Pro",
        lensModel: "iPhone 15 Pro back camera 6.86mm f/1.78",
        software: "17.4.1",
        dateTimeOriginal: "",
    },
    canon: {
        make: "Canon",
        model: "Canon EOS 5D Mark IV",
        lensModel: "EF24-70mm f/2.8L II USM",
        software: "Firmware Version 1.4.0",
        dateTimeOriginal: "",
    },
    sony: {
        make: "Sony",
        model: "ILCE-7RM5",
        lensModel: "FE 24-70mm F2.8 GM II",
        software: "ILCE-7RM5 v2.00",
        dateTimeOriginal: "",
    },
};

// ─── TIFF / IFD constants ────────────────────────────────────────────

const TIFF_LITTLE_ENDIAN = 0x4949; // "II"
const TIFF_MAGIC = 0x002a;
const TYPE_ASCII = 2;
const TYPE_LONG = 4;

// Tag IDs
const TAG_MAKE = 0x010f;
const TAG_MODEL = 0x0110;
const TAG_SOFTWARE = 0x0131;
const TAG_DATETIME = 0x0132;
const TAG_EXIF_IFD_PTR = 0x8769;
const TAG_LENS_MODEL = 0xa434;
const TAG_DATETIME_ORIGINAL = 0x9003;

// ─── Helpers ─────────────────────────────────────────────────────────

/** Encode a string as null-terminated ASCII bytes */
function asciiBytes(str: string): Uint8Array {
    const bytes = new Uint8Array(str.length + 1);
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i) & 0x7f;
    }
    bytes[str.length] = 0; // null terminator
    return bytes;
}

/**
 * Build a complete TIFF payload containing IFD0 and Exif Sub-IFD
 * with the given profile values.
 */
function buildTiffPayload(profile: ExifProfile): Uint8Array {
    // Pre-encode all string values (null-terminated ASCII)
    const makeBytes = asciiBytes(profile.make);
    const modelBytes = asciiBytes(profile.model);
    const softwareBytes = asciiBytes(profile.software);
    const datetimeBytes = asciiBytes(profile.dateTimeOriginal); // 20 bytes: "YYYY:MM:DD HH:MM:SS\0"
    const lensModelBytes = asciiBytes(profile.lensModel);
    const datetimeOrigBytes = asciiBytes(profile.dateTimeOriginal);

    // TIFF header: 8 bytes (II + magic + offset to IFD0)
    const tiffHeaderSize = 8;

    // IFD0: 5 entries
    // Structure: 2 bytes (entry count) + 5 * 12 bytes (entries) + 4 bytes (next IFD offset)
    const ifd0EntryCount = 5;
    const ifd0Size = 2 + ifd0EntryCount * 12 + 4;
    const ifd0Offset = tiffHeaderSize;

    // Sub-IFD (Exif): 2 entries
    const subIfdEntryCount = 2;
    const subIfdSize = 2 + subIfdEntryCount * 12 + 4;
    const subIfdOffset = ifd0Offset + ifd0Size;

    // String data area starts after both IFDs
    const dataAreaOffset = subIfdOffset + subIfdSize;

    // Calculate string data positions
    let dataPos = dataAreaOffset;

    const makeOffset = dataPos;
    dataPos += makeBytes.length;

    const modelOffset = dataPos;
    dataPos += modelBytes.length;

    const softwareOffset = dataPos;
    dataPos += softwareBytes.length;

    const datetimeOffset = dataPos;
    dataPos += datetimeBytes.length;

    const lensModelOffset = dataPos;
    dataPos += lensModelBytes.length;

    const datetimeOrigOffset = dataPos;
    dataPos += datetimeOrigBytes.length;

    const totalSize = dataPos;

    // Allocate buffer
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const u8 = new Uint8Array(buffer);

    let pos = 0;

    // ── TIFF Header ──
    view.setUint16(pos, TIFF_LITTLE_ENDIAN, false); // "II" as big-endian bytes 0x49 0x49
    pos += 2;
    view.setUint16(pos, TIFF_MAGIC, true); // 0x002A little-endian
    pos += 2;
    view.setUint32(pos, ifd0Offset, true); // Offset to IFD0
    pos += 4;

    // ── IFD0 ──
    view.setUint16(pos, ifd0EntryCount, true);
    pos += 2;

    // Helper to write an IFD entry
    function writeIfdEntry(
        tag: number,
        type: number,
        count: number,
        valueOrOffset: number,
    ) {
        view.setUint16(pos, tag, true);
        pos += 2;
        view.setUint16(pos, type, true);
        pos += 2;
        view.setUint32(pos, count, true);
        pos += 4;
        view.setUint32(pos, valueOrOffset, true);
        pos += 4;
    }

    // IFD entries must be sorted by tag value in ascending order
    // 0x010F Make, 0x0110 Model, 0x0131 Software, 0x0132 DateTime, 0x8769 ExifIFD
    writeIfdEntry(TAG_MAKE, TYPE_ASCII, makeBytes.length, makeOffset);
    writeIfdEntry(TAG_MODEL, TYPE_ASCII, modelBytes.length, modelOffset);
    writeIfdEntry(TAG_SOFTWARE, TYPE_ASCII, softwareBytes.length, softwareOffset);
    writeIfdEntry(TAG_DATETIME, TYPE_ASCII, datetimeBytes.length, datetimeOffset);
    writeIfdEntry(TAG_EXIF_IFD_PTR, TYPE_LONG, 1, subIfdOffset);

    // Next IFD offset = 0 (no more IFDs)
    view.setUint32(pos, 0, true);
    pos += 4;

    // ── Sub-IFD (Exif) ──
    view.setUint16(pos, subIfdEntryCount, true);
    pos += 2;

    // Entries sorted by tag: 0x9003 DateTimeOriginal, 0xA434 LensModel
    writeIfdEntry(
        TAG_DATETIME_ORIGINAL,
        TYPE_ASCII,
        datetimeOrigBytes.length,
        datetimeOrigOffset,
    );
    writeIfdEntry(TAG_LENS_MODEL, TYPE_ASCII, lensModelBytes.length, lensModelOffset);

    // Next IFD offset = 0
    view.setUint32(pos, 0, true);
    pos += 4;

    // ── String data area ──
    u8.set(makeBytes, makeOffset);
    u8.set(modelBytes, modelOffset);
    u8.set(softwareBytes, softwareOffset);
    u8.set(datetimeBytes, datetimeOffset);
    u8.set(lensModelBytes, lensModelOffset);
    u8.set(datetimeOrigBytes, datetimeOrigOffset);

    return u8;
}

// ─── JPEG injection ──────────────────────────────────────────────────

/**
 * Inject EXIF APP1 segment into a JPEG byte stream after the SOI marker.
 * APP1 format: FF E1 + length(2) + "Exif\0\0"(6) + TIFF payload
 */
function injectIntoJpeg(
    data: Uint8Array,
    tiffPayload: Uint8Array,
): Uint8Array {
    // Validate SOI marker
    if (data.length < 2 || data[0] !== 0xff || data[1] !== 0xd8) {
        throw new Error("Not a valid JPEG: missing SOI marker");
    }

    // APP1 segment: marker(2) + length(2) + "Exif\0\0"(6) + TIFF payload
    const exifHeader = new Uint8Array([
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    ]);
    const segmentDataLen = 2 + exifHeader.length + tiffPayload.length; // length field includes itself
    const app1Segment = new Uint8Array(2 + 2 + exifHeader.length + tiffPayload.length);
    const app1View = new DataView(app1Segment.buffer);

    let offset = 0;
    // FF E1 marker
    app1Segment[offset++] = 0xff;
    app1Segment[offset++] = 0xe1;
    // Segment length (big-endian) - includes the 2 length bytes + exif header + payload
    app1View.setUint16(offset, segmentDataLen, false);
    offset += 2;
    // "Exif\0\0"
    app1Segment.set(exifHeader, offset);
    offset += exifHeader.length;
    // TIFF payload
    app1Segment.set(tiffPayload, offset);

    // Construct output: SOI + APP1 + rest of original JPEG (after SOI)
    const result = new Uint8Array(2 + app1Segment.length + (data.length - 2));
    result[0] = 0xff;
    result[1] = 0xd8;
    result.set(app1Segment, 2);
    result.set(data.subarray(2), 2 + app1Segment.length);

    return result;
}

// ─── WebP injection ──────────────────────────────────────────────────

/**
 * Inject EXIF chunk into a WebP file.
 * WebP chunk: "EXIF"(4) + size(4 LE) + TIFF payload + optional pad byte
 * Also sets bit 3 (EXIF flag) in VP8X chunk if it exists.
 */
function injectIntoWebp(
    data: Uint8Array,
    tiffPayload: Uint8Array,
): Uint8Array {
    // Validate RIFF/WEBP header
    if (data.length < 12) {
        throw new Error("Not a valid WebP: too short");
    }

    const tag = (offset: number) =>
        String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);

    if (tag(0) !== "RIFF" || tag(8) !== "WEBP") {
        throw new Error("Not a valid WebP: missing RIFF/WEBP header");
    }

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    // Build the EXIF chunk
    const chunkSize = tiffPayload.length;
    const paddedSize = chunkSize + (chunkSize & 1); // pad to even
    const exifChunk = new Uint8Array(8 + paddedSize);
    const exifChunkView = new DataView(exifChunk.buffer);

    // "EXIF" FourCC
    exifChunk[0] = 0x45; // E
    exifChunk[1] = 0x58; // X
    exifChunk[2] = 0x49; // I
    exifChunk[3] = 0x46; // F
    // Chunk size (little-endian)
    exifChunkView.setUint32(4, chunkSize, true);
    // TIFF payload (no "Exif\0\0" prefix for WebP)
    exifChunk.set(tiffPayload, 8);
    // Pad byte is already 0 if needed

    // Find VP8X chunk to set EXIF flag
    let vp8xFlagPos = -1;
    let i = 12;
    while (i + 8 <= data.length) {
        const fourCC = tag(i);
        const size = view.getUint32(i + 4, true);
        const padded = size + (size & 1);

        if (fourCC === "VP8X" && i + 8 < data.length) {
            vp8xFlagPos = i + 8; // First byte of VP8X payload is the flags byte
        }
        i += 8 + padded;
    }

    // Construct output: original file + EXIF chunk appended
    const result = new Uint8Array(data.length + exifChunk.length);
    result.set(data);
    result.set(exifChunk, data.length);

    // Update RIFF size (file size - 8)
    const resultView = new DataView(result.buffer);
    resultView.setUint32(4, result.length - 8, true);

    // Set bit 3 (EXIF present) in VP8X flags if VP8X exists
    if (vp8xFlagPos >= 0 && vp8xFlagPos < result.length) {
        result[vp8xFlagPos] |= (1 << 3);
    }

    return result;
}

// ─── Main export ─────────────────────────────────────────────────────

/**
 * Inject a minimal valid EXIF block into a JPEG or WebP blob.
 * Returns the blob unchanged (with injected=false) for PNG or on error.
 */
export async function injectExif(
    blob: Blob,
    profile: ExifProfile,
    format: ExportFormat,
): Promise<InjectResult> {
    // PNG cannot carry EXIF in a standard way we support - return unchanged
    if (format === "image/png") {
        return { blob, injected: false };
    }

    try {
        const tiffPayload = buildTiffPayload(profile);
        const arrayBuffer = await blob.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);

        let result: Uint8Array;

        if (format === "image/jpeg") {
            result = injectIntoJpeg(data, tiffPayload);
        } else if (format === "image/webp") {
            result = injectIntoWebp(data, tiffPayload);
        } else {
            return { blob, injected: false, error: `Unsupported format: ${format}` };
        }

        const injectedBlob = new Blob(
            [new Uint8Array(result) as BlobPart],
            { type: format },
        );
        return { blob: injectedBlob, injected: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return { blob, injected: false, error: message };
    }
}
