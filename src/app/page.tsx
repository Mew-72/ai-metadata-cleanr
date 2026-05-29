"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticker } from "../components/Ticker";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CleanerInterface } from "../components/CleanerInterface";
import {
  Sparkles,
  HelpCircle,
  Flame,
  ArrowRight,
  UserCheck,
  Zap,
  Fingerprint,
  TrendingDown,
} from "lucide-react";
import { PRICING } from "../config/pricing";

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setEmailSubscribed(true);
    }
  };

  const faqs = [
    {
      q: "How does the browser-only metadata removal work?",
      a: "When you load an image, ScrubAI draws its raw pixels onto an invisible HTML5 canvas element. We then re-export these pixels to create a completely new binary file structure. Because the new file is built entirely from scratch, it contains none of the original EXIF, XMP, IPTC, or cryptographically signed C2PA credentials.",
    },
    {
      q: "Does this affect the quality or visual integrity of my photos?",
      a: "No. ScrubAI handles images directly in your browser's sandboxed memory without compressing or degrading them. We export standard JPEG, PNG, or WebP files at a premium 95% quality threshold, keeping sharp lines and pixel-perfect detail while fully removing metadata.",
    },
    {
      q: "Does this remove 'Made with AI' tags and C2PA Content Credentials?",
      a: "Yes. Platforms like Instagram, Facebook, and Pinterest read image binary headers for software signatures, AI generation metadata (such as DALL-E or Midjourney tags), and cryptographically signed Content Credentials (C2PA/JUMBF). ScrubAI rebuilds the image from raw pixels, so these embedded markers are not carried into the export.",
    },
    {
      q: "Are my images uploaded to a database or backend server?",
      a: "Never. ScrubAI is a 100% local-first tool. Under no circumstances are your files or images sent to a server. All canvas drawing, ExifReader parsing, and JSZip compilation happen entirely locally inside your browser's sandboxed environment.",
    },
    {
      q: "How do I upgrade to Lifetime Pro and is it a one-time fee?",
      a: `Yes. Lifetime Pro is a strictly one-time fee of ${PRICING.displayPrice} processed securely via PayPal. There are no monthly subscription charges and no hidden recurring costs. Upgrading instantly unlocks batch image processing up to 50 files, ZIP exports, and priority support for life.`,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg transition-colors duration-200">
      {/* Navigation Header */}
      <Header /> {/* HERO SECTION */}
      <section className="w-full border-b-4 border-ink bg-bg">
        <div className="max-w-[1280px] mx-auto w-full border-x border-ink bg-bg">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-ink">
            {/* Main Hero Column (Left) */}
            <div className="p-10 md:p-14 lg:p-20 flex flex-col justify-between h-full bg-bg">
              <div className="flex-1 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 font-mono text-[10px] font-black tracking-widest uppercase text-ink mb-6 select-none">
                  <span className="text-accent">■</span> Private by design ·
                  100% in your browser
                </div>

                <h1 className="font-serif text-[42px] md:text-[54px] lg:text-[68px] font-black leading-[0.9] tracking-tighter text-ink mb-8 uppercase select-none flex flex-col">
                  <span>REMOVE IMAGE</span>
                  <span>METADATA.</span>
                  <span className="mt-2.5">
                    <span className="bg-accent text-bg px-4 py-1.5 inline-block transform -rotate-1 font-serif font-black tracking-tighter">
                      TAKE BACK PRIVACY
                    </span>
                  </span>
                </h1>

                <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-n700 mb-8 max-w-[520px]">
                  ScrubAI strips EXIF, GPS location, and C2PA Content
                  Credentials from your photos - completely inside your browser.
                  No uploads, no servers, no tracking. Your images never leave
                  your device.
                </p>

                <div className="flex flex-col sm:flex-row gap-3.5 max-w-[520px] mb-8">
                  <a
                    href="#workspace"
                    className="bg-ink text-bg border-2 border-ink py-4 px-6 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer text-center hover:bg-accent hover:border-accent transition-all select-none flex-1 flex items-center justify-center gap-2"
                  >
                    CLEAN MY IMAGES - FREE <span className="text-sm">→</span>
                  </a>
                  <a
                    href="#explain-product"
                    className="bg-transparent text-ink border-2 border-ink py-4 px-6 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer text-center hover:bg-ink hover:text-bg transition-all select-none flex-1 flex items-center justify-center"
                  >
                    SEE HOW IT WORKS
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] text-n500 uppercase tracking-widest select-none">
                  <span className="flex items-center gap-1">
                    🛡️ 100% Local Processing
                  </span>
                  <span className="text-n300 hidden sm:inline">|</span>
                  <span className="flex items-center gap-1">
                    🔒 Your data never leaves your browser
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column (Visual and Security Assurance Card) — hidden on mobile/tablet to avoid confusing users into clicking the mockup instead of the real workspace below. */}
            <div className="hidden lg:flex p-10 md:p-14 lg:p-20 flex-col justify-center bg-n100/10 relative overflow-hidden min-h-[500px]">
              {/* Background elegant red glow */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-red-500/10 blur-[100px] pointer-events-none" />

              {/* Framed Cleaner Interface Card Mockup */}
              <div className="relative border-2 border-ink rounded-3xl bg-bg p-8 shadow-[6px_6px_0px_0px_rgba(17,17,17,1)] flex flex-col gap-6 max-w-[440px] mx-auto w-full z-10">
                {/* Card header */}
                <div className="flex items-center justify-between border-b border-ink/10 pb-4 select-none">
                  <span className="font-serif text-[12px] font-black uppercase tracking-tight text-ink">
                    SCRUB<span className="text-accent">AI.</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>

                {/* Dropzone mockup */}
                <div className="border border-dashed border-ink/30 rounded-2xl p-6.5 flex flex-col items-center justify-center text-center gap-2.5 bg-n100/20 select-none">
                  <div className="w-9 h-9 rounded-full border border-ink/20 flex items-center justify-center bg-bg">
                    <span className="text-accent text-[15px] font-bold">+</span>
                  </div>
                  <span className="font-sans text-[11px] font-bold text-ink">
                    Drop images here to scan
                  </span>
                  <span className="font-mono text-[8px] text-n500 uppercase tracking-widest">
                    or click to browse
                  </span>
                </div>

                {/* Summarized metrics counters grid */}
                <div className="grid grid-cols-4 divide-x divide-ink/10 border-y border-ink/10 py-3.5 select-none">
                  <div className="flex flex-col items-center text-center px-1">
                    <span className="font-serif text-lg md:text-xl font-black text-ink">
                      24
                    </span>
                    <span className="font-mono text-[7px] text-n500 uppercase tracking-tight mt-1 leading-none">
                      Files Scanned
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center px-1">
                    <span className="font-serif text-lg md:text-xl font-black text-ink">
                      18
                    </span>
                    <span className="font-mono text-[7px] text-n500 uppercase tracking-tight mt-1 leading-none">
                      Metadata Removed
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center px-1">
                    <span className="font-serif text-lg md:text-xl font-black text-ink">
                      6
                    </span>
                    <span className="font-mono text-[7px] text-n500 uppercase tracking-tight mt-1 leading-none">
                      Tracking Endpoints
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center px-1">
                    <span className="font-serif text-lg md:text-xl font-black text-ink">
                      0
                    </span>
                    <span className="font-mono text-[7px] text-n500 uppercase tracking-tight mt-1 leading-none">
                      C2PA Signatures
                    </span>
                  </div>
                </div>

                {/* Recent files list mockup */}
                <div className="flex flex-col gap-2.5 select-none">
                  <span className="font-mono text-[8px] tracking-widest uppercase text-n500 mb-0.5">
                    Recent Files
                  </span>

                  <div className="flex items-center justify-between font-mono text-[8px] text-ink border-b border-ink/5 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-n400">📷</span> campaign_shot_01.jpg
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-n500">1.2 MB</span>
                      <span className="text-green-600 font-bold">✓ CLEAN</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[8px] text-ink border-b border-ink/5 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="text-n400">🖼️</span>{" "}
                      product_launch_hero.png
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-n500">2.4 MB</span>
                      <span className="text-green-600 font-bold">✓ CLEAN</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-[8px] text-ink">
                    <span className="flex items-center gap-1.5">
                      <span className="text-n400">👤</span>{" "}
                      influencer_post_v2.jpg
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-n500">1.8 MB</span>
                      <span className="text-green-600 font-bold">✓ CLEAN</span>
                    </span>
                  </div>
                </div>

                {/* Floating overlapping Security Assurance Overlay badge */}
                <div className="absolute -bottom-6 -right-6 md:-right-8 bg-bg border-2 border-ink p-4.5 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] flex items-center gap-3.5 max-w-[260px] z-20">
                  <div className="w-9 h-9 rounded-full border border-ink flex items-center justify-center bg-n100 shrink-0">
                    <span className="text-accent text-[15px]">🛡️</span>
                  </div>
                  <div>
                    <span className="font-mono text-[7px] tracking-widest uppercase text-n500 block mb-0.5">
                      Security Assurance
                    </span>
                    <h5 className="font-serif text-[10px] font-black text-ink leading-tight mb-0.5">
                      100% Local-First & GDPR Compliant
                    </h5>
                    <p className="font-mono text-[7px] tracking-tight text-n500 uppercase leading-none">
                      No Data Leaves Your Sandbox
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* METADATA CLEANER WORKSPACE */}
      <section id="workspace" className="w-full border-b-4 border-ink bg-bg">
        <div className="max-w-[1280px] mx-auto w-full border-x border-ink bg-bg">
          <div className="font-mono text-[10px] tracking-widest uppercase text-n500 p-4 px-8 border-b border-ink">
            ✦ Metadata Cleaner - Drop Your Images
          </div>
          <CleanerInterface />
        </div>
      </section>
      {/* CORE FEATURES */}
      <section
        id="features"
        className="w-full border-b-4 border-ink select-none bg-n100"
      >
        <div className="max-w-[1280px] mx-auto w-full border-x border-ink bg-bg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end p-10 md:p-14 border-b border-ink select-none bg-bg">
            <div>
              <h2 className="font-serif text-4xl lg:text-6xl font-black text-ink uppercase tracking-tight leading-none mb-3">
                Everything You Can Strip From a Photo
              </h2>
              <p className="font-mono text-[10px] tracking-widest uppercase text-accent font-bold">
                Take full control of your image metadata and privacy
              </p>
            </div>
            <div className="border border-ink px-4.5 py-1.5 font-mono text-[9px] tracking-widest uppercase text-n500 mt-4 md:mt-0">
              System Matrix v1.0
            </div>
          </div>

          {/* 4 Column Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-ink border-b border-ink">
            <div className="p-8 bg-bg hover:bg-n100 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 border border-ink flex items-center justify-center mb-5 bg-n100">
                  <UserCheck size={18} className="text-ink" />
                </div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink mb-3.5">
                  100% Client-Side
                </h3>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify">
                  Images never leave your browser sandbox. ScrubAI parses Exif
                  headers and operates Canvas RGB redraw locally, keeping your
                  source data completely protected from databases.
                </p>
              </div>
            </div>

            <div className="p-8 bg-bg hover:bg-n100 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 border border-ink flex items-center justify-center mb-5 bg-n100">
                  <Flame size={18} className="text-ink" />
                </div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink mb-3.5">
                  Total Metadata Removal
                </h3>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify">
                  Redrawing image pixels on an offline HTML5 canvas removes all
                  EXIF, XMP, IPTC headers and cryptographically signed C2PA
                  Content Credentials naturally from scratch.
                </p>
              </div>
            </div>

            <div className="p-8 bg-bg hover:bg-n100 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 border border-ink flex items-center justify-center mb-5 bg-n100">
                  <Fingerprint size={18} className="text-ink" />
                </div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink mb-3.5">
                  Strip AI &amp; Camera Signatures
                </h3>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify">
                  Activate the randomized filename toggle to remove
                  platform-identifiable default labels (like DALL-E or
                  Midjourney) and clear camera profile signatures from every
                  export.
                </p>
              </div>
            </div>

            <div className="p-8 bg-bg hover:bg-n100 transition-colors flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 border border-ink flex items-center justify-center mb-5 bg-n100">
                  <Zap size={18} className="text-ink" />
                </div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-ink mb-3.5">
                  Batch Queuing (Pro)
                </h3>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify">
                  Supercharge your workflow. Drag up to 50 photos into the
                  Purification queue, clean them with single-click ease, and
                  download a compressed ZIP package in seconds.
                </p>
              </div>
            </div>
          </div>

          {/* 3 Column Subfeatures */}
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-ink bg-bg">
            <div className="p-8 flex flex-col gap-2 hover:bg-n100 transition-colors">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                <span className="text-accent">▮</span> PayPal Secure Checkout
              </div>
              <p className="font-body text-[13px] leading-relaxed text-n700">
                Enjoy absolute peace of mind. PayPal-encrypted checkout handles
                payments securely. We never store payment details, and Clerk
                Auth syncs credentials locally.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-2 hover:bg-n100 transition-colors">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                <span className="text-accent">▮</span> Zero Data Logging
              </div>
              <p className="font-body text-[13px] leading-relaxed text-n700">
                Fully GDPR compliant. We do not track image hashes, log
                processing metrics, or execute background database writes,
                keeping operations absolutely anonymous.
              </p>
            </div>

            <div className="p-8 flex flex-col gap-2 hover:bg-n100 transition-colors">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink">
                <span className="text-accent">▮</span> Local-First Speed
              </div>
              <p className="font-body text-[13px] leading-relaxed text-n700">
                Sanitization is executed locally inside your browser sandbox in
                under 50ms. No account is required for single operations,
                allowing instant on-demand privacy.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* PRODUCT DEEP-DIVE: THE MECHANICS OF DIGITAL PRIVACY */}
      <section
        id="explain-product"
        className="w-full border-b-4 border-ink bg-bg"
      >
        <div className="max-w-[1280px] mx-auto w-full border-x border-ink bg-bg">
          <div className="p-10 md:p-14 border-b border-ink text-center select-none bg-bg">
            <div className="font-mono text-[10px] tracking-widest uppercase text-accent font-bold mb-3">
              ✦ How It Works
            </div>
            <h2 className="font-serif text-4xl lg:text-5xl font-black text-ink uppercase tracking-tight">
              How ScrubAI Removes Metadata
              <br />
              <em className="font-serif italic font-light text-accent">
                Completely.
              </em>
            </h2>
            <p className="font-body text-sm text-n500 mt-4 max-w-lg mx-auto leading-relaxed">
              Standard file properties tools fall short because tag headers are
              only a fraction of what is hidden in an image. Here is how ScrubAI
              gives you clean, private files.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-ink">
            {/* Column 1: Pixel Redraw */}
            <div className="p-10 md:p-14 flex flex-col justify-between hover:bg-n100/30 transition-colors select-none bg-bg">
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-accent font-bold mb-4">
                  01 / System Integrity
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-ink uppercase mb-5">
                  Why Pixel Redrawing Beats Tag Deletion
                </h3>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify mb-6">
                  Traditional metadata editors simply erase common tag headers
                  like EXIF, XMP, or IPTC. While this removes clear camera
                  settings, it leaves deeper tracking metrics completely
                  untouched. Crucially, cryptographically signed C2PA
                  credentials are woven into nested JUMBF structures which basic
                  tag-removers fail to detect or remove.
                </p>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify">
                  ScrubAI takes a fundamentally different path. When you load an
                  image, our offline processor draws the raw pixels onto a
                  sandboxed HTML5 canvas. We then export pure color channels to
                  compile a completely new binary structure from scratch. This
                  creates a clean break: since the new image features entirely
                  fresh binary markers, the original tracking data is physically
                  impossible to restore.
                </p>
              </div>
            </div>

            {/* Column 2: Neutralizing Bias */}
            <div className="p-10 md:p-14 flex flex-col justify-between hover:bg-n100/30 transition-colors select-none bg-bg">
              <div>
                <div className="font-mono text-[9px] tracking-widest uppercase text-accent font-bold mb-4">
                  02 / Content Credentials
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-ink uppercase mb-5">
                  Remove &quot;Made with AI&quot; Tags &amp; C2PA Data
                </h3>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify mb-6">
                  Many platforms scan image uploads for cryptographic signs of
                  generative origin. To tag posts as &quot;Made with AI&quot; and build
                  provenance catalogs, their servers examine inbound binary data
                  for signatures from OpenAI, Midjourney, and Adobe.
                </p>
                <p className="font-body text-[13px] leading-relaxed text-n700 text-justify">
                  ScrubAI removes these markers at the source. By rebuilding the
                  image from raw pixels, the C2PA proof chains and custom color
                  markers are gone, so the export carries no embedded
                  generation history. You decide what information travels with
                  your images - not the tools that made them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ SECTION */}
      <section id="faq" className="w-full border-b-4 border-ink bg-bg">
        <div className="max-w-[1280px] mx-auto w-full border-x border-ink bg-bg">
          <div className="p-14 border-b border-ink select-none">
            <h2 className="font-serif text-4xl lg:text-6xl font-black text-ink uppercase tracking-tight text-center">
              Frequently Asked
              <br />
              <em className="font-serif italic font-light text-accent">
                Questions
              </em>
            </h2>
          </div>

          <div className="flex flex-col divide-y divide-ink border-b border-ink bg-bg">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border-b border-ink last:border-b-0 bg-bg"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center p-6 text-left font-serif text-md font-bold text-ink hover:bg-n100 transition-colors cursor-pointer select-none"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span
                      className={`font-mono text-lg text-accent transition-transform duration-150 ${isOpen ? "rotate-45" : ""}`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                  >
                    <div className="overflow-hidden bg-bg">
                      <p className="p-6 pt-0 font-body text-[13px] leading-relaxed text-n700">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* NEWSLETTER */}
      <section className="w-full border-b-4 border-ink bg-bg">
        <div className="max-w-[1280px] mx-auto w-full border-x border-ink bg-bg grid grid-cols-1 md:grid-cols-2">
          <div className="p-10 md:p-14 border-b md:border-b-0 md:border-r border-ink select-none bg-bg">
            <div className="font-mono text-[9px] tracking-widest uppercase text-accent font-bold mb-3">
              ✦ Stay Genuinely Private
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-black text-ink uppercase tracking-tight leading-none mb-4 bg-bg">
              Product updates.
              <br />
              No noise. Just signal.
            </h2>
            <p className="font-body text-xs text-n700 leading-relaxed max-w-md bg-bg">
              Get our weekly briefing on digital privacy: new platform reach
              updates, local-first workflows, and software guides delivered
              directly to your inbox.
            </p>
          </div>

          <form
            onSubmit={handleSubscribe}
            className="p-10 md:p-14 flex flex-col justify-center gap-5 bg-bg"
          >
            {emailSubscribed ? (
              <div className="bg-green-800/10 border border-green-800 p-5 text-center select-none bg-bg">
                <span className="font-serif text-md font-bold text-green-800 block">
                  ✓ You&apos;re subscribed!
                </span>
                <span className="font-mono text-[9px] text-n500 uppercase tracking-widest mt-1 block">
                  Check your inbox this Thursday morning.
                </span>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 select-none bg-bg">
                  <label
                    className="font-mono text-[9px] tracking-widest uppercase text-n500 bg-bg"
                    htmlFor="nl-email"
                  >
                    Work Email Address
                  </label>
                  <input
                    id="nl-email"
                    type="email"
                    required
                    placeholder="you@creator.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none border-b-2 border-ink p-2.5 font-mono text-sm text-ink outline-none transition-all focus:bg-n100 focus:px-3.5 select-text"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-ink text-bg border-2 border-ink py-3.5 px-7 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors self-start select-none"
                >
                  Subscribe — It&apos;s Free
                </button>
                <div className="font-mono text-[9px] text-n400 uppercase tracking-widest select-none bg-bg">
                  Zero spam. One-click unsubscribe at any time.
                </div>
              </>
            )}
          </form>
        </div>
      </section>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
