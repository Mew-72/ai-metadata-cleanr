# ScrubAI 🛡️✨

> **Reclaim your reach, bypass algorithmic suppression, and sanitize your digital assets with high-fidelity, browser-only metadata purification.**

ScrubAI is an editorial-grade, premium, high-performance local-first utility designed to neutralize algorithmic reach suppression on modern visual platforms. 

When digital creators upload files to platforms like Instagram, Pinterest, or Facebook, the platforms scan these files for hidden EXIF, XMP, IPTC headers, software-identifying tags (e.g., Midjourney, DALL-E signatures), and cryptographically signed Content Credentials (C2PA/JUMBF). ScrubAI neutralizes this tracking profile entirely in your browser's sandboxed environment, without your assets ever leaving your device.

---

## ⚡ Key Architectural Features

- 🎨 **Total Canvas Purification:** Draws raw image pixels onto a sandboxed, offline HTML5 canvas and re-compiles the image from scratch. All camera metrics, history tags, and cryptographically signed C2PA credentials are physically annihilated.
- 🔒 **100% Local-First Sandbox:** GDPR compliant by design. Your data never touches our servers. Exif header parsing and JSZip batch packaging are processed entirely in browser sandboxed memory.
- 🏷️ **Identifier Randomization:** Cleans platform-identifiable default labels, stripping filenames and structural footprint headers to bypass automatic algorithmic suppressions.
- ⚡ **Batch Queuing (Pro):** Instantly process queues of up to 50 assets at a time, performing pixel-perfect parallel purification in milliseconds, and exporting clean assets in structured `.zip` format.
- 💳 **Frictionless Clerk Billing:** Modern billing flows integrated directly into the dashboard interface with live checkouts via Stripe.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm, yarn, pnpm, or bun

### Local Development

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Mew-72/ai-metadata-cleanr.git
   cd aimetadatacleaner
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory (never commit this to version control!) with your Clerk or billing variables.

4. **Start the Development Server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to run the application locally.

---

## 📂 Project Structure

```
aimetadatacleaner/
├── src/
│   ├── app/                 # Next.js 15+ App Router layouts and routes
│   │   ├── docs/            # Privacy docs and technical briefing guides
│   │   └── dashboard/       # Subscriber portal and billing control flow
│   ├── components/          # Reusable React core interfaces (Cleaner, Header, Footer)
│   ├── hooks/               # Custom hooks for canvas processing and authentication
│   └── content/             # Documentation markdown sources
├── public/                  # Static assets and site icons
├── package.json             # Core dependency manifest
└── AGENTS.md                # ScrubAI Multi-Agent Developer Matrix
```

---

## 🔒 Security & Privacy Briefing

Unlike standard EXIF stripping software that merely updates or clears tag headers, **ScrubAI uses pixel redrawing**. By writing pure RGB pixel buffers to a fresh canvas element and downloading a freshly initiated image, we break the cryptographic hash chain of signed signatures (like C2PA). This is mathematically equivalent to taking a digital photograph of a printed photograph—destroying the provenance trail while keeping every line and tone visually perfect.

For a deeper dive into reaches, math, and suppression bypass techniques, explore our **[Technical Briefing Docs Hub](http://localhost:3000/docs)**.

---

*Crafted for premium editorial workflows and digital privacy.*
