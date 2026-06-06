export const platformsCheatsheet = `## Quick reference

This is the field-tested matrix for which metadata signals each major
visual platform reads as of 2026. Suppression patterns are based on
public algorithm disclosures, creator-side reach analytics, and
platform transparency reports.

| Platform | Reads EXIF \`Software\` | Reads XMP \`CreatorTool\` | Reads C2PA / JUMBF | Reads filename | Visible "Made with AI" tag |
|---|---|---|---|---|---|
| Instagram | yes | yes | yes | yes | yes |
| Pinterest | yes | yes | yes | **strict** | partial |
| Facebook | yes | yes | yes | yes | yes |
| TikTok | yes | partial | yes | yes | yes |
| LinkedIn | partial | partial | yes | partial | yes |
| X (Twitter) | partial | no | partial | partial | partial |
| Threads | yes | yes | yes | yes | yes |
| YouTube (thumbnails) | partial | partial | yes | partial | yes |

## Notes per platform

### Instagram & Threads
Same backend. Aggressive about C2PA - even a stripped EXIF file with an
intact JUMBF chunk is enough to trigger the "Made with AI" badge and
reduce explore-tab eligibility.

### Pinterest
The harshest platform for AI signals. They specifically deprioritize
filenames matching known AI tools, and their crawler reads C2PA
manifests during the pin enrichment step. A pin with both an AI
filename pattern *and* an embedded JUMBF block can be filtered out of
the home feed almost entirely.

### TikTok
Reads metadata on still uploads (carousel posts and image stories).
Does not currently appear to penalize pixel-only images that lack
detectable AI signatures.

### LinkedIn
Less aggressive overall but does respect C2PA. Most reach issues on
LinkedIn come from generic engagement patterns, not metadata - though
explicit AI tags can dampen reach in the Creator program.

### X (Twitter)
Lighter-touch on AI metadata as of 2026. Still recommended to clean
files because grok-driven content moderation reads them, and
third-party clients sometimes display credentials.

## What to clean for each

If you only have time to do one thing per platform:

- **Pinterest:** randomize the filename. Their pattern matcher is
  unusually strict.
- **Instagram, Threads, Facebook:** strip C2PA. The JUMBF block is the
  primary trigger.
- **TikTok carousel posts:** strip both EXIF and XMP \`Software\` tags.
- **X / LinkedIn:** general clean is enough; no platform-specific
  hot-spot.

ScrubAI's default settings handle all of the above in one pass.
`;
