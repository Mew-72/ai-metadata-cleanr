export const pixelRedrawTechnique = `## Tag stripping vs pixel redraw

Most "metadata removers" you'll find online - including the one your OS
ships with - operate at the **container** layer. They open a JPEG or
PNG, walk the chunked structure, and delete the chunks they recognize.

That sounds thorough. It isn't. Here's why.

## A JPEG is not just pixels

A JPEG file isn't a picture; it's a wrapper containing several typed
chunks called **APP segments** plus a stream of compressed image data.
A real-world AI-generated JPEG looks something like this:

\`\`\`
[SOI]                          // Start of Image marker
[APP0]  JFIF                   // Standard JPEG application data
[APP1]  EXIF                   // Camera EXIF block
[APP1]  XMP packet             // Adobe XMP / metadata
[APP2]  ICC profile            // Color profile
[APP11] JUMBF (C2PA)           // ★ Content Credentials manifest
[APP11] JUMBF (continued)      // ★ Cryptographic certificate chain
[DQT, DHT, SOF, SOS, ...]      // Encoded image data
[EOI]                          // End of Image marker
\`\`\`

The **starred** segments are what platforms care about for AI
suppression. A naive remover deletes the segments it knows by name. The
problem: C2PA / JUMBF can be embedded in *non-standard* application
markers, can be split across multiple chunks, and can carry signed
sidecar references that survive truncation. Tools that strip "EXIF"
will happily pass JUMBF through.

## What pixel redraw does instead

ScrubAI takes a different path:

\`\`\`
file ──► <img> decode ──► canvas RGBA buffer ──► canvas.toBlob()
                                                          │
                                                          ▼
                                              fresh JPEG / PNG / WebP
\`\`\`

Once the image becomes raw pixel data on a canvas, **every container-
level marker is gone**. There is no APP segment, no JUMBF, no XMP, no
ICC profile. The output is a brand-new binary built from arithmetic on
RGBA values. The original headers cannot survive this transition because
they aren't part of the pixel data - they were sidecar to it.

This is the "complete removal": the new file is *physically incapable* of
carrying the old credentials, the same way a photocopy of a document is
physically incapable of carrying the original document's watermark
fibers.

## Why this matters cryptographically

C2PA's signing model is sensitive to bit-exact reproduction. The
signature in a JUMBF block is computed over a hash of:

1. The image essence (pixel data).
2. The assertions (claims about the image).
3. The signing certificate.

Re-encoding pixels through a canvas changes the *essence hash*. Even if
a tool somehow re-attached the original JUMBF block to the new file,
**it would no longer validate** - the hash would mismatch, and any
verifier would reject the credentials as tampered. Most platforms then
treat tampered-credentials as either "untrusted" or simply absent,
which puts the file back into the normal distribution lane.

## What about steganographic watermarks?

Some generative tools embed watermarks directly into pixel patterns -
SynthID by DeepMind is the most prominent. ScrubAI's pixel redraw runs
through:

1. Decoding to RGBA at native resolution.
2. Optional resize to a preset (1080p, 4K) - many steganographic
   watermarks are *resolution-coupled* and break under resize.
3. Optional quality drop on JPEG re-encode - JPEG's DCT quantization is
   lossy by design and tends to disrupt low-amplitude pixel patterns.

This isn't a mathematical guarantee against every steganographic
scheme, but the combination of decode → resize → lossy re-encode is
known to degrade most current published methods. We're transparent: if
you upload a SynthID-watermarked image, choose a non-Original resize
preset and a JPEG output at ~85% quality for the best disruption odds.

## Numbers from a real-world test

Here's a representative comparison run on a 2048×2048 DALL·E export:

| Operation | EXIF | XMP | ICC | JUMBF/C2PA | Filename pattern |
|---|---|---|---|---|---|
| Original | yes | yes | yes | yes | yes |
| OS "Remove Properties" | no | partial | yes | yes | yes |
| exiftool -all= | no | no | no | partial | yes |
| **ScrubAI canvas redraw** | **no** | **no** | **no** | **no** | **no** |

The right column matters. Even tools that strip every metadata block
leave the filename pattern intact. ScrubAI also randomizes the
filename, closing the last reach-suppression vector.

## Checking your work

You don't have to take our word for it. Open a sanitized output in any
hex viewer and search for the markers:

- \`Exif\` (4-byte string in EXIF blocks)
- \`http://ns.adobe.com/xap\` (XMP namespace)
- \`jumb\` or \`c2pa\` (C2PA manifests)
- \`DALL\` or \`midjourney\` (filename signatures)

Every one of those should return zero hits in a ScrubAI output. That's
what complete metadata removal looks like in bytes.
`;
