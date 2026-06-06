export const reachPenalties = `## Why your reach is silently flatlining

You posted an image to Instagram. It looked great. Engagement died. You
post the next one. Same fate. Nothing about the picture changed - it's
the same camera, same composition, same caption rhythm. So what gives?

In most modern visual feeds, the *image binary itself* is now a
classification surface. Platforms read deep into the file headers, look
for cryptographic content credentials, and quietly route the post into a
demoted distribution lane. They don't tell you. They don't ban you.
They just stop showing the post.

This page lays out what those signals actually are, why they exist, and
why a "metadata remover" that only strips EXIF leaves you exposed.

## Three signals platforms scan for

### 1. Cryptographically signed AI provenance (C2PA)

Adobe, OpenAI, Microsoft, and Google have all rolled out signed Content
Credentials. When DALL·E or Firefly generates an image, it embeds a
**JUMBF** (JPEG Universal Metadata Box Format) chunk that contains:

- A signed manifest declaring the generative tool and version.
- An assertion that the image was \`c2pa.created\` or \`c2pa.converted\`.
- A certificate chain back to the issuing authority.

Instagram, Pinterest, LinkedIn, and TikTok all read these headers as of
2024–2026. When they detect a Content Credentials manifest pointing to a
generative tool, the post gets a "Made with AI" tag, *and* a quieter
distribution adjustment that most creators never notice.

### 2. EXIF / XMP fingerprints

Even without C2PA, the EXIF \`Software\` and \`CreatorTool\` tags are a
giveaway. Common patterns flagged in 2026:

- \`Software: DALL-E\`, \`Software: Midjourney\`, \`Software: Stable Diffusion\`
- \`CreatorTool: Adobe Firefly Image\`, \`CreatorTool: ComfyUI\`
- \`History\` blocks naming AI processors
- \`ImageDescription\` matching known generation prompt formats

XMP packets persist across most image edits - Photoshop, Lightroom, and
even file system copies preserve them. A "remove metadata" toggle in
Finder or File Explorer typically clears EXIF but leaves XMP and JUMBF
fully intact.

### 3. Filename pattern matching

Platforms also do dumb but effective name pattern matching:

- \`DALL·E 2026-05-23.png\` (the Unicode middle dot is a giveaway)
- \`midjourney_v6_xyz.png\`
- \`ComfyUI_00001_.png\`
- \`firefly-render-final.jpg\`

If you've been wondering why your posts feel suppressed: a generated
filename combined with a C2PA signature is a near-certain reach hit on
Pinterest in particular.

## Why the suppression exists

Platform side, it's a defensible choice:

1. **Spam control.** AI-image volume on Pinterest jumped >40x in 2024.
   Suppressing low-effort generations protects feed quality.
2. **Copyright risk.** Surfacing AI work less prominently dampens
   derivative-work liability claims.
3. **User-trust signaling.** Making "Made with AI" tags visible is part
   of the platforms' regulatory posture.

None of those are inherently bad goals. They just happen to penalize
*everyone* using AI tools, including legitimate professionals using
Firefly to generate concept frames or Midjourney for moodboards.

## What ScrubAI actually does about it

ScrubAI's pipeline is built specifically for this problem:

- **Canvas pixel redraw.** We decode the image, draw raw RGBA values on
  a fresh \`<canvas>\`, then re-encode. The output is a *brand new* binary
  with zero inherited headers - no JUMBF, no XMP, no EXIF, no \`Software\`
  tag.
- **Filename randomization.** Output files are named like
  \`img_a4q9c2_3.jpg\` so pattern-matchers find nothing.
- **Optional safe-spoof profile.** If you choose, ScrubAI injects a
  benign EXIF block (e.g. iPhone 15 Pro footprint) so the image looks
  like a normal phone capture instead of an empty file with no headers,
  which can itself be a weak signal.

Combined, these three steps neutralize the surface area platforms scan.

## What this isn't

ScrubAI is not a watermark remover for visible overlays, and it does
not claim to defeat *content-fingerprint* models that classify the
pixels themselves (e.g. PhotoDNA-style hashes for known datasets).
What it does defeat is the metadata-driven suppression layer - which,
in practice, is what costs creators the most reach today.

## Want to verify it yourself?

1. Generate an image in DALL·E or Firefly.
2. Run it through any major EXIF inspector (e.g. Phil Harvey's exiftool).
   You'll see C2PA, XMP, and EXIF blocks.
3. Run it through ScrubAI.
4. Re-inspect the output - those blocks are gone, the file size is
   smaller, and the binary has no inherited markers.

The numbers don't lie, and the reach data starts moving back to baseline
within a few posts.
`;
