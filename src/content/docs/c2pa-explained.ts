export const c2paExplained = `## What is C2PA?

The **Coalition for Content Provenance and Authenticity** (C2PA) is a technical standard that lets cameras, software, and AI models sign their outputs with a cryptographic certificate. When you see "Content Credentials" or a little (i) badge on an image, that's C2PA at work.

The idea sounds simple: prove where a file came from. But what it actually proves - and what it doesn't - matters if you're trying to understand whether a photo is real, human-made, or AI-generated.

## How C2PA signing works

A C2PA manifest is a data structure embedded in an image file (usually in a JUMBF block inside the JPEG or PNG container). It contains:

1. **Claims** - assertions about the image: who created it, what edits were made, what tools were used, whether it came from an AI model.
2. **A hash** - a cryptographic fingerprint computed over the pixel data and the claims themselves.
3. **A signature** - the hash is signed with a private key tied to a certificate, often from Adobe, OpenAI, Midjourney, or a camera manufacturer.

When you open the file in a validator (like ScrubAI's [C2PA scanner](/c2pa-scanner) or Adobe's Content Authenticity tool), the validator:

- Recomputes the hash from the current pixel data and manifest.
- Checks whether that hash matches the signed hash.
- Verifies the certificate chain leads to a trusted authority.

If all three steps pass, the credentials are **valid**. If the hash mismatches or the certificate is untrusted, they're flagged as **invalid** or **unverified**.

## What a valid C2PA signature proves

A valid signature proves **three things under a trust model**:

1. The signed claims were made by whoever holds the signing key (Adobe, OpenAI, a camera vendor).
2. The pixel data and claims have not been altered since signing - the hash still matches.
3. The certificate chain leads back to a recognized Certificate Authority.

It does **not** independently prove:

- That the image depicts a real scene. A completely synthetic render can carry valid C2PA credentials if the renderer signed it.
- That a human took the photo. Many AI tools sign their outputs with valid C2PA manifests; "valid" and "AI-generated" are compatible.
- That the claims inside are true. The signature proves the claims were signed by that key; it doesn't prove the claims themselves are accurate unless you trust the signer to tell the truth.

## What missing credentials prove

**Nothing.**

If an image has no C2PA manifest, you learn:

- The camera or software didn't embed one, or
- The file passed through a tool that stripped it (like ScrubAI), or
- It was re-encoded in a way that destroyed the manifest, or
- The original author chose not to sign it.

Absence of credentials is not proof of human authorship. It's not proof of AI origin. It's absence of data.

## How platforms use C2PA

Some social platforms and image hosts read C2PA manifests and use them to label content or adjust its distribution:

- **Instagram, Facebook, Threads** - show "Made with AI" labels when certain claims are present, and there's evidence they suppress reach on AI-signed content in some contexts.
- **Pinterest** - known to downrank or exclude images with AI-related C2PA claims from certain discovery feeds.
- **Adobe Stock, Shutterstock** - may show provenance badges or filter results based on signed origin claims.

The suppression is not universal. Some platforms only check for the presence of a manifest; others parse specific claims. The behavior changes over time and is not always documented.

If a file you upload has C2PA credentials and you don't want the platform reading them, you have two options: **strip the manifest** (what ScrubAI does by rebuilding the file from raw pixels), or **edit the image** (which breaks the hash and invalidates the signature, often causing the platform to ignore it or flag it as tampered).

## Limitations you should know

C2PA is a technical layer, not a silver bullet:

- **Certificate trust is centralized.** You're trusting Adobe, the camera vendor, or the AI company to issue certificates honestly and revoke them when compromised. If that trust model doesn't suit you, the system doesn't either.
- **Signing is optional.** Most cameras and tools don't sign by default. Even when they do, the user can turn it off. So unsigned files vastly outnumber signed ones.
- **Credentials don't survive re-encoding.** Export a signed JPEG at a different quality or through a photo editor that rebuilds the container, and the manifest either vanishes or becomes invalid. This is by design - it prevents credentials from surviving untracked edits - but it also means legitimate signed content often becomes unsigned in normal workflows.
- **They can be re-attached incorrectly.** Some tools try to preserve manifests during edits; if they fail to update the hash correctly, the result is invalid credentials that look present but fail validation.

The standard is built for **accountability** in professional publishing and legal contexts, where you need a verifiable chain of custody. It was not designed to tell everyday users "is this photo real?" or "did a human make this?"

## Checking C2PA credentials yourself

If you want to inspect an image's credentials:

1. Use a validator like [ScrubAI's C2PA scanner](/c2pa-scanner) (browser-local, nothing uploaded) or Adobe's Content Authenticity web tool.
2. Look at the **validation result** first: valid, invalid, or absent. Invalid often means the file was edited after signing.
3. Read the **claims** - who signed it, what tool was declared, what edits are listed. These are **assertions**, not verified facts. Trust them only if you trust the signer.
4. Check the **certificate chain**. If it's self-signed or issued by an unknown authority, treat it skeptically.

A green checkmark in a validator means the cryptography worked. It does not mean "this image is trustworthy." That judgment is yours.

## Removing C2PA credentials

If you want to strip Content Credentials from an image:

- **Pixel redraw** (what ScrubAI does) decodes the image to raw RGBA pixels and re-encodes it as a fresh file. The manifest cannot survive because it's tied to the original container and hash.
- **Tag stripping** tools (like exiftool) can delete JUMBF blocks by name, but C2PA manifests can be split across multiple chunks or embedded in non-standard markers, so simple tag deletion is less reliable.
- **Editing and re-exporting** in most photo apps will either strip the manifest or invalidate it by changing the hash. Invalidated credentials are often treated the same as absent ones by platforms.

Once removed, the file is just pixels and standard headers. The platform sees no provenance data to read.

## The bottom line

C2PA is a **cryptographic chain of custody**, not a truth oracle. A valid signature authenticates that the signer made certain claims and the file hasn't changed since. Missing credentials prove nothing about origin. If you're trying to avoid platform suppression tied to AI metadata, removing the manifest is one option; the other is not signing in the first place. But remember: platforms also use **pixel analysis**, **user signals**, and **behavioral patterns** to classify content. Metadata is just one input.
`;
