/**
 * Bundled sample JPEG with real EXIF, GPS, and C2PA-like (APP11 JUMBF) metadata.
 *
 * The image is a 64x64 pixel warm gradient. It carries genuine, parseable metadata:
 * - EXIF: Make="SampleCam", Model="SC-100", Software="AI Studio v3.1",
 *         DateTimeOriginal="2025:06:15 14:30:00"
 * - GPS:  Latitude=40.7128 N (NYC), Longitude=74.006 W
 * - C2PA: APP11 JUMBF marker (minimal superbox with "jumb"/"jumd" structure)
 *
 * Total file size: 696 bytes. Base64: 928 chars.
 * Passes ExifReader.load() and surfaces EXIF, GPS, and JUMBF/C2PA tags in audits.
 */

/**
 * Base64-encoded JPEG (696 bytes) with real EXIF, GPS, and C2PA-like JUMBF metadata.
 *
 * Binary structure:
 *   SOI (FF D8)
 *   APP1 (FF E1) - EXIF/TIFF with IFD0 + ExifSubIFD + GPS IFD
 *   APP11 (FF EB) - JUMBF superbox (C2PA-like marker)
 *   DQT + SOF0 + DHT + SOS + entropy-coded pixels + EOI
 */
// prettier-ignore
export const SAMPLE_IMAGE_BASE64 =
    "/9j/4QEeRXhpZgAASUkqAAgAAAAGAA8BAgAKAAAAngAAABABAgAHAAAAqAAAADEBAgAPAAAArwAAADIBAgAUAAAAvgAAAGmHBAABAAAAVgAAACWIBAABAAAAaAAAAAAAAAABAAOQAgAUAAAA0gAAAAAAAAAEAAEAAgACAAAATgAAAAIABQADAAAA5gAAAAMAAgACAAAAVwAAAAQABQADAAAA/gAAAAAAAABTYW1wbGVDYW0AU0MtMTAwAEFJIFN0dWRpbyB2My4xADIwMjU6MDY6MTUgMTQ6MzA6MDAAMjAyNTowNjoxNSAxNDozMDowMAAoAAAAAQAAACoAAAABAAAAABIAAGQAAABKAAAAAQAAAAAAAAABAAAAcAgAAGQAAAD/6wAoSlAAAAABAAAAAQAAABxqdW1iAAAAFGp1bWRjMnBhABEAEIAAAKr/2wBDACgcHiMeGSgjISMtKygwPGRBPDc3PHtYXUlkkYCZlo+AjIqgtObDoKrarYqMyP/L2u71////m8H////6/+b9//j/2wBDASstLTw1PHZBQXb4pYyl+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj/wAARCABAAEADASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAgEE/8QAFRABAQAAAAAAAAAAAAAAAAAAAAH/xAAXAQEBAQEAAAAAAAAAAAAAAAACAQQD/8QAFhEBAQEAAAAAAAAAAAAAAAAAAAER/9oADAMBAAIRAxEAPwCRYMWOONlpxYMWDg2nFgxYmDaUKDFg4NrJCgQo04tpRYMKJiWlFgxYODacWDFiYNrLFgxY0YulCgxYmDpQoEKDg6UWDCiYmskWDCjRi2lFgxYmDacWDFiYNpQoMWDg2v/Z";

/**
 * Decode the base64 sample image into a File object ready for the audit pipeline.
 * The filename simulates a DALL-E/AI-generated camera studio export.
 */
export function createSampleFile(): File {
    const binaryStr = atob(SAMPLE_IMAGE_BASE64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return new File(
        [bytes],
        "DALL\u00B7E 2026_Camera_Studio_Export.jpg",
        { type: "image/jpeg" }
    );
}
