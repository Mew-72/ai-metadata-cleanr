export const localFirstProcessing = `## Why browser-local processing matters

When you use ScrubAI to strip metadata from an image, the entire operation happens **in your browser**. The file never leaves your device. No upload to our servers. No temporary storage in the cloud. No network round-trip.

This isn't marketing. It's an architectural decision that makes certain privacy guarantees possible.

## How the pipeline works

Here's what actually happens when you drop an image into ScrubAI:

1. **File selection** - you choose a file through the browser's file picker. The browser gives our JavaScript a local reference to the file, but only in a sandboxed environment that can't access your filesystem outside that selection.

2. **Decode to canvas** - the image is decoded into raw RGBA pixel data on an HTML5 \`<canvas>\` element. This happens entirely in the browser's rendering engine. No network. No server.

3. **Pixel manipulation (optional)** - if you chose a resize preset or quality adjustment, those operations run on the canvas. Still local. Still sandboxed.

4. **Re-encode to blob** - the canvas is re-encoded as a new JPEG, PNG, or WebP using \`canvas.toBlob()\`. This generates a fresh binary in memory - a JavaScript \`Blob\` object - with no container metadata from the original file.

5. **Download** - the browser's download API (\`URL.createObjectURL\` + an \`<a download>\` trigger) lets you save the blob to your filesystem. At no point does the file or any part of it leave the JavaScript sandbox.

That's the whole flow. If you open your browser's Network tab (F12 → Network), you'll see **zero outbound requests** carrying image data during processing.

## What stays on your device

Everything:

- **Image bytes** - the raw pixel data, the JPEG/PNG stream, every byte of the input and output file.
- **Metadata** - EXIF, GPS, XMP, IPTC, C2PA manifests, ICC profiles, thumbnails - all decoded and discarded in memory, never transmitted.
- **Filenames** - the name of your original file, the generated output filename.
- **Processing parameters** - what format you chose, what quality slider position, what resize preset.

None of these are logged. None are sent to us. None appear in our server access logs, because they never hit the server.

## What we do collect (and why)

ScrubAI is not a zero-data product. We collect **anonymous usage analytics** to understand how the product is used and where it breaks. Here's exactly what that means:

**UI events we track** (via PostHog):

- Page views - which routes users visit (homepage, pricing, docs, scanner).
- Button clicks - "process image," "download," "view pricing," "checkout started."
- Errors - when processing fails, what error code was returned (but not the filename or image).
- Conversion milestones - file selected → processing completed → download completed → Pro purchased.

**What we explicitly do NOT track**:

- Image bytes or any part of the pixel data.
- Filenames - neither the original name you uploaded nor the generated output name.
- Extracted metadata - no GPS coordinates, no EXIF camera models, no XMP fields, nothing read from the file's headers.
- IP addresses beyond what standard web server logs capture (and those are anonymized in PostHog).

If you want to verify this, you can:

1. Open your browser's DevTools (F12) and check the Network tab while processing an image. Filter for "Fetch/XHR" - you'll see PostHog analytics events like \`/e/\` or \`/decide/\`, but no image data.
2. Inspect the outgoing request payloads. You'll see event names like \`processing_completed\` or \`download_clicked\`, but no file content.
3. Use a local proxy or browser extension that logs outbound traffic. The only requests leaving the page are analytics events, font/asset loads, and payment API calls (if you purchase Pro).

## The technical boundaries

The privacy model rests on a few hard constraints:

**JavaScript sandbox** - modern browsers isolate JavaScript from the host operating system. Our code can only read a file you explicitly selected, and it can only write through the download API. It cannot scan your filesystem, cannot exfiltrate data to other origins without your network seeing it, and cannot persist data outside browser storage (which you control through DevTools or clearing site data).

**No server-side processing** - there is no backend service that receives your image, processes it, and sends it back. The server that hosts ScrubAI (scrubai.app) only serves static HTML, CSS, JavaScript, and assets. The /api routes handle authentication, payment webhooks, and usage limits - none of them receive image data.

**Content Security Policy** - the site uses CSP headers that restrict which external origins JavaScript can communicate with. PostHog and Stripe are the only third-party endpoints our code is allowed to contact. You can inspect the \`Content-Security-Policy\` header in DevTools → Network → Headers.

**No cloud processing, no "optimization" detours** - some tools claim local processing but send thumbnails or hashes to a server for "quality checks" or "AI enhancement." We don't. The pixel pipeline is a pure client-side loop. If a step required server contact, the entire privacy model would break, so we simply don't add those steps.

## How this compares to upload-based tools

Most online metadata removers work like this:

1. You upload your image to their server.
2. The server processes it (strips metadata, resizes, re-encodes).
3. The server sends back the cleaned file or a download link.

What that means:

- **Full data exposure** - the service has your image bytes, metadata, and filename in plaintext on their infrastructure.
- **Logging risk** - even if they promise not to store files, server logs typically capture request metadata, IP, timestamps, and may inadvertently log filenames or error details.
- **Third-party access** - if the service uses cloud storage (S3, GCS) or a CDN, those providers also see your data in transit or at rest, depending on encryption.
- **Retention policies** - you're trusting the service to actually delete the file after processing. Some keep temporary copies for hours or days. Some don't document their retention at all.
- **Jurisdiction and legal access** - the data crossed a network and landed in a jurisdiction where it may be subject to legal requests, surveillance, or breach.

Browser-local processing sidesteps all of this. The image never enters the network. There's no server to log it, no jurisdiction to subpoena it, no cloud bucket to breach.

## Limitations and trade-offs

Local processing is not cost-free:

- **Device performance** - large images or batch processing can be slow on older devices. Everything runs on your CPU/GPU, so a 50 MP JPEG may take a few seconds to decode and re-encode.
- **Limited format support** - we're constrained by what the browser's canvas API supports. Exotic formats like HEIC, TIFF, and RAW require extra libraries; some are not feasible in pure JavaScript.
- **No server-side enhancements** - features like advanced AI-based watermark removal or pixel-forensics analysis are computationally expensive and would require server-side processing. We don't offer them because we won't break the local-first boundary.
- **Browser compatibility** - older browsers or browsers with strict site permissions can break parts of the pipeline. We test on modern Chrome, Firefox, Safari, and Edge; anything older is unsupported.

If those trade-offs don't work for you - if you need faster processing, exotic formats, or server-side features - an upload-based tool may be a better fit. We built ScrubAI for people who value the privacy guarantee over those features.

## What about AI detection?

Some tools claim to detect AI-generated images by analyzing pixel patterns, compression artifacts, or frequency-domain signatures. ScrubAI is **not** an AI detection tool. We focus on **metadata removal**, not pixel forensics.

However, by decoding and re-encoding an image through the canvas pipeline, we do change its pixel-level characteristics:

- **Re-quantization** - JPEG re-encoding at a different quality level changes DCT coefficients, which can disrupt some forensic signatures.
- **Resampling** - if you resize the image, pixel patterns tied to the original resolution are lost.
- **Compression artifacts** - the new file has the artifact signature of the browser's encoder, not the original tool (Photoshop, Midjourney, DALL·E).

This is a **side effect**, not a promise. ScrubAI is designed to remove **metadata containers** (EXIF, JUMBF, XMP), not to evade pixel-based classifiers. Some AI detection tools are robust to re-encoding; others are not. We don't track the efficacy of evasion because that's not what the product is for.

## Verifying privacy yourself

If you're skeptical - good. Here's how to verify our claims:

1. **Network inspection** - open DevTools (F12), go to the Network tab, and process an image. Check every outbound request. You'll see analytics events (PostHog /e/ calls with event names like \`processing_completed\`), but no image payloads.

2. **Code audit** - ScrubAI is not open-source, but the client-side JavaScript is unobfuscated and readable in DevTools → Sources. Search for \`fetch(\`, \`XMLHttpRequest\`, or \`navigator.sendBeacon\` - these are the APIs that send data over the network. Trace what they send.

3. **Local packet capture** - use Wireshark, Charles Proxy, or mitmproxy to inspect all traffic from your browser while using ScrubAI. You should see no HTTPS requests containing image data (you'll see HTML, JS, CSS, fonts, analytics events, and payment API calls if you purchase).

4. **Offline test** - disconnect your network after the page loads (or use browser DevTools → Network → Offline). You can still process images and download them, because the canvas pipeline runs entirely client-side. Only the usage-limit check and analytics will fail (gracefully).

If any of these tests contradicts what we've documented here, we want to know. Email us at **hello@scrubai.app** with the evidence.

## The limits of "local-first"

Browser-local processing is a strong privacy boundary, but it's not absolute anonymity:

- **Standard web traffic** - your browser still loads the ScrubAI page over HTTPS, so your ISP and any intermediaries see that you visited \`scrubai.app\`. They don't see what you processed or downloaded, but they see the domain.
- **Browser fingerprinting** - like every website, we receive standard HTTP headers (user-agent, viewport size, language preferences) and browser features exposed through JavaScript. We don't use these for tracking beyond PostHog's anonymous cohort analytics, but they exist.
- **Payment data** - if you purchase Lifetime Pro, Stripe handles the payment and receives your email, payment method, and billing address. We receive a webhook confirming the purchase and your email for account lookup. That's separate from image processing, but it's still data we touch.
- **Local storage and cookies** - we use \`localStorage\` to remember your usage count, session tokens (if signed in), and UI preferences. We use cookies for PostHog session persistence. You can clear these anytime in DevTools or browser settings.

If your threat model requires hiding even the fact that you visited ScrubAI, use Tor Browser or a VPN. If you don't want any analytics events, block PostHog in uBlock Origin or use the browser's built-in tracking protection. The image processing will still work - it has no server dependency.

## Why we built it this way

Privacy as a feature, not a promise we could break.

We didn't want to tell users "trust us, we delete your images" or "we promise not to log metadata." Those are policy commitments, and policies can change. Infrastructure can be breached. Logs can be subpoenaed.

By keeping the entire pipeline in the browser, we **architecturally cannot** access your image data. We can't betray your trust because we never have the data in the first place. That's the strongest guarantee a service can give: **not "we won't," but "we can't."**

It costs us in features and speed. It limits what we can build. But it's the right trade-off for a tool whose purpose is **removing things you didn't consent to** from files **you should have full control over.**
`;
