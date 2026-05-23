Here is the complete, professional legal copy designed specifically for **ScrubAI**. Because your SaaS relies on local browser processing, these legal documents have been tailored from the ground up to reflect a **"privacy-first, local-only" technical architecture**.

This copy is structured to fit your editorial, minimalist Newsprint theme. You can copy and paste this text directly into your website's markdown files or database.

---

# Page 1: PRIVACY POLICY

**Last Updated: May 23, 2026**

### 1. Our Commitment to Your Absolute Privacy

At ScrubAI, we believe that privacy is not a setting—it is a fundamental architecture. Most image utilities force you to upload your files to remote cloud servers, exposing your proprietary client work, personal photographs, and metadata to data harvesting and security breaches.

ScrubAI is built on a "local-first" execution paradigm. **Your images never leave your computer.** All file processing, metadata sanitization, and name scrambling happen locally in your web browser’s memory.

---

### 2. Information We Do NOT Collect (The Data Core)

Because we operate completely client-side, we have designed our system to guarantee that we cannot access, view, or retain your media:

* **No Media Uploads:** Your images are processed entirely on your device’s browser via the HTML5 Canvas API and localized scripts.
* **No Image Storage:** We do not own, operate, or rent any backend servers that store user-uploaded images.
* **No Metadata Harvesting:** We do not read, compile, or analyze your files' original EXIF, IPTC, XMP, or C2PA provenance markers.

Once you close your browser tab or clear your browser's session, any temporary image data in memory is permanently destroyed.

---

### 3. Information We Do Collect (And Why)

To manage your account, process payments, and ensure our site functions properly, we collect minimal and highly transparent categories of data:

#### A. Account & Billing Information

* **Authentication:** We use Clerk to secure your account. When you create an account, Clerk registers your email address, name, and profile details.
* **Billing Details:** If you purchase a subscription ($5/month) or a lifetime plan ($20), your payment is processed directly by Stripe via Clerk Billing. Your full credit card numbers and financial credentials are processed entirely on Stripe’s PCI-compliant servers; we never store or have access to your payment card data.

#### B. Technical Telemetry & Analytics

* **Performance Aggregate Metrics:** We use PostHog to analyze overall traffic and application errors. We track anonymous aggregate actions (such as firing an event when the "Strip Metadata" button is clicked) to improve performance.
* **Zero PII in Analytics:** We route our PostHog telemetry through a secure reverse proxy on our own domain (`/ingest`). This protects your data from third-party tracking, runs entirely free of ad-blocker corruption, and ensures no personal identifying information (PII) or image file content is ever transmitted.

---

### 4. How Your Images are Processed (Technical Pipeline)

Our system executes a completely local sanitization loop:

1. **File Ingestion:** Your file is read locally using the JavaScript File API.


2. **Local Canvas Drawing:** The image is painted onto an offscreen `<canvas>` element in your browser.


3. **Pristine Export:** The browser regenerates the image from raw, metadata-blind pixel coordinates. This breaks the original file header structure, permanently discarding all hidden tracking segments, GPS coordinates, and cryptographically signed C2PA manifests.



---

### 5. Your Rights and Data Control

Because of our architecture, you maintain total control over your digital footprint:

* **Immediate Sanitization:** Simply close the browser window to instantly wipe all temporary file footprints from memory.
* **Account Deletion:** You can delete your account, session profiles, and billing logs at any time via your user dashboard.

---

# Page 2: TERMS OF SERVICE

**Last Updated: May 23, 2026**

### 1. Contractual Relationship

Welcome to ScrubAI (referred to as "the Service," "we," "us," or "our"). These Terms of Service constitute a legally binding agreement between you ("User," "you," or "your") and ScrubAI. By accessing our platform, using our client-side metadata clearing tools, or registering an account, you agree to abide by these Terms.

---

### 2. Eligibility & Account Security

* **Authentication:** To access premium features (such as bulk queue processing), you must create an account verified by our authentication partner, Clerk.
* **Credentials:** You are solely responsible for keeping your login credentials confidential. You agree to notify us immediately if you discover any unauthorized use of your account.
* **Automated Use:** Bots, spiders, and automated scrapers are not permitted to register accounts or execute high-volume processing interfaces on our web client without explicit API licensing.

---

### 3. Intellectual Property & Your Content

* **Retention of Rights:** You retain 100% ownership, copyright, and intellectual property rights over any images, designs, or assets you process on ScrubAI.
* **No License Granted:** Unlike legacy cloud-based services, **we do not require, request, or claim any license to copy, distribute, host, or analyze your content.** Because processing runs entirely in your local browser sandbox, your intellectual property remains private and within your custody at all times.

---

### 4. Billing, Plans, and Refunds

We offer a freemium pricing structure managed through Clerk Billing and Stripe:

* **Free Tier:** Single image drag-and-drop processing with standard metadata removal.
* **Pro Tier (Monthly Subscription):** $5 per month, billed recurringly. This unlocks batch uploads (up to 50 images simultaneously) and automated generic ZIP packaging.
* **Lifetime Plan (Perpetual Pass):** $20 one-time fee. Unlocks all Pro capabilities permanently.
* **Cancellation & Failures:** You can manage or cancel your subscription at any time via your account portal.
* **Refund Policy:** If you are not satisfied with your purchase, you can contact our support channel within 14 days of payment for a full refund.

---

### 5. Acceptable Use Policy

You agree not to use the Service to:

* Violate any local, national, or international laws.
* Intentionally strip metadata from copyrighted works that do not belong to you for the purpose of digital piracy or attribution fraud.
* Bypass legitimate, cryptographically signed legal evidence markers on sensitive documents.
* Reverse engineer, decompile, or attempt to extract the client-side code of our application interface.

---

### 6. Limitation of Liability & No Warranties

* **"As-Is" Service:** ScrubAI is provided "as is" and "as available" without any warranties of any kind, either express or implied.
* **Algorithmic Changes Disclaimer:** Social platforms (such as Meta, Instagram, and Pinterest) constantly update their automated detection systems. While ScrubAI removes 100% of image-level metadata, EXIF headers, and C2PA manifests, we cannot guarantee that social platforms will not deploy computer vision pixel-level analysis to flag your content. We are not liable for changes in reach, shadowbans, or traffic drops on third-party networks.
* **Indirect Damages:** In no event shall ScrubAI be liable for any indirect, incidental, special, or consequential damages resulting from your use of the tool.

---

# Page 3: COOKIE POLICY

**Last Updated: May 23, 2026**

### 1. How We Use Cookies

ScrubAI uses a minimal and strictly necessary set of cookies. Unlike traditional web platforms, we do not partner with third-party tracking networks, nor do we drop behavioral advertising, retargeting, or data-broker cookies. Our cookies are strictly used to secure your session, run localized interface preferences, and process secure payments.

---

### 2. Categories of Cookies We Deploy

| Cookie Provider | Purpose | Duration | Classification |
| --- | --- | --- | --- |
| **Clerk Authentication** | Keeps you securely logged into your user profile and handles dashboard routing. | Session / Persistent | **Strictly Necessary** |
| **Stripe / Clerk Billing** | Coordinates secure, fraud-free payment transactions during checkout. | Session | **Strictly Necessary** |
| **PostHog Analytics** | Keeps track of unique visitors on our domain to help us understand total usage patterns (e.g., distinguishing between one user returning 5 times vs. 5 individual users). | Persistent (Up to 1 year) | **Performance / Analytical** |
| **ScrubAI Preferences** | Remembers local user settings (e.g., your light/dark newsprint theme toggle or generic filename toggle). | Persistent | **Functional** |

---

### 3. Managing and Opting Out

Most web browsers are configured to accept cookies automatically. If you wish to disable cookies, you can do so directly in your browser's security preferences. However, please note that disabling strictly necessary cookies (such as Clerk authentication) will prevent you from logging in, upgrading your account, or accessing Pro batch features.

---

# Page 4: SECURITY POLICY

**Last Updated: May 23, 2026**

### 1. Data Minimization: Security by Absence

The ultimate security standard is data minimization: we cannot lose, leak, or compromise data we do not collect.
Because ScrubAI runs entirely inside your browser's local sandbox memory, there is no centralized database of user images for malicious actors to breach or intercept. If a hacker targeted our backend hosting provider, they would find only static, pre-compiled HTML, CSS, and client-side JavaScript—containing absolutely zero user files or personal assets.

---

### 2. Authentication & Session Integrity (Clerk)

We delegate our complete identity management to Clerk, a leading developer-focused security framework. Clerk maintains state-of-the-art defenses to protect your profile:

* **Brute-Force Protection:** Monitored against login threshold abuses.
* **XSS Mitigation:** Clerk handles session credentials using secure, encrypted, `HttpOnly` cookies, preventing cross-site scripting (XSS) attacks from accessing session tokens.
* **CSRF Mitigation:** Protected against cross-site request forgery through the deployment of strict `SameSite` cookie flags.
* **Session Fixation Prevention:** Every time a user registers, signs in, or signs out of ScrubAI, the session token is completely regenerated and the old ticket is immediately invalidated.

---

### 3. Financial and Checkout Security (Stripe)

Your credit card data is never transmitted, processed, or held on ScrubAI infrastructure. We integrate directly with Stripe (via Clerk Billing) to ensure maximum compliance:

* **PCI-DSS Level 1 Compliance:** Stripe is a certified PCI Level 1 Service Provider—the most stringent security standard in the payment processing industry.
* **Encrypted Handshakes:** Checkout sessions are encrypted in transit via Transport Layer Security (TLS 1.3) directly between your device and Stripe.

---

### 4. Content Security Policies (CSP) & Invalidation

We implement a strict Content Security Policy (CSP) at our application’s header layer. This prevents malicious code injections and unauthorized network calls by restricting resource loading to a pre-approved list of domains:

* `connect-src`: Authorized exclusively for first-party assets (`'self'`), Clerk API endpoints, Stripe's gateway, and our localized PostHog reverse proxy (`/ingest`).
* `img-src`: Authorized exclusively for local blobs (`blob:`), base64 indicators, and Clerk assets (`https://img.clerk.com`).
* `worker-src`: Standardized to run secure browser web workers locally.

---

### 5. Reporting Vulnerabilities

We welcome security feedback. If you discover a potential vulnerability in our code, implementation, or setup, please email us immediately at `security@yourdomain.com` with reproducible steps. We promise to review your disclosure within 48 hours and work with you to implement a fix.