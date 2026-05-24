"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { ShieldCheck, Calendar, ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink font-body transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink grid grid-cols-1 lg:grid-cols-12 bg-bg select-none">
        {/* Left Side: Policy Navigation Sidebar (col-span-3) */}
        <div className="col-span-1 lg:col-span-3 p-8 border-b lg:border-b-0 lg:border-r border-ink flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/" 
              className="w-8 h-8 border border-ink flex items-center justify-center font-mono text-xs hover:bg-ink hover:text-bg transition-colors"
              title="Back to Purifier"
            >
              <ArrowLeft size={14} />
            </Link>
            <div className="font-mono text-[9px] uppercase tracking-widest text-n500">
              Workspace Portal
            </div>
          </div>

          <div className="border border-ink p-5 bg-n100">
            <div className="font-mono text-[9px] uppercase tracking-widest text-n500 mb-4 pb-2 border-b border-ink/10">
              Legal Framework
            </div>
            <ul className="list-none flex flex-col gap-3.5">
              <li>
                <Link
                  href="/privacy"
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-accent border-l-2 border-accent pl-2.5"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-ink hover:text-accent border-l-2 border-transparent pl-2.5"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-ink hover:text-accent border-l-2 border-transparent pl-2.5"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/security"
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-ink hover:text-accent border-l-2 border-transparent pl-2.5"
                >
                  Security Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="border border-ink p-5 bg-bg font-mono text-[9px] leading-relaxed uppercase text-n500">
            🛡️ ALL SCRUB·AI OPERATIONS RUN 100% LOCALLY IN YOUR CLIENT BROWSER SANDBOX MEMORY.
          </div>
        </div>

        {/* Right Side: Editorial Content (col-span-9) */}
        <div className="col-span-1 lg:col-span-9 p-8 lg:p-12 overflow-hidden">
          {/* Header Block */}
          <div className="pb-8 mb-8 double-border-bottom">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={12} className="text-accent" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-n500">
                Last Updated: May 23, 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl lg:text-6xl font-black uppercase tracking-tight text-ink mb-1.5 leading-none">
              Privacy Policy
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              Privacy by Design &middot; Local-First Architecture
            </p>
          </div>

          {/* Legal Content */}
          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">01.</span>
                Our Commitment to Your Absolute Privacy
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 drop-cap">
                At ScrubAI, we believe that privacy is not a setting—it is a fundamental architecture. Most image utilities force you to upload your files to remote cloud servers, exposing your proprietary client work, personal photographs, and metadata to data harvesting and security breaches.
              </p>
              <p className="font-body text-[14px] leading-relaxed text-n700 mt-4">
                ScrubAI is built on a "local-first" execution paradigm. <strong>Your images never leave your computer.</strong> All file processing, metadata sanitization, and name scrambling happen locally in your web browser’s memory.
              </p>
            </div>

            {/* Section 2 */}
            <div className="border border-ink bg-n100 p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">02.</span>
                Information We Do NOT Collect (The Data Core)
              </h2>
              <p className="font-body text-[13px] leading-relaxed text-n600">
                Because we operate completely client-side, we have designed our system to guarantee that we cannot access, view, or retain your media:
              </p>
              <ul className="list-none flex flex-col gap-3 font-sans text-[12px] text-ink pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>No Media Uploads:</strong> Your images are processed entirely on your device’s browser via the HTML5 Canvas API and localized scripts.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>No Image Storage:</strong> We do not own, operate, or rent any backend servers that store user-uploaded images.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>No Metadata Harvesting:</strong> We do not read, compile, or analyze your files' original EXIF, IPTC, XMP, or C2PA provenance markers.
                  </div>
                </li>
              </ul>
              <div className="font-mono text-[9px] uppercase tracking-wider text-n500 mt-2 border-t border-ink/5 pt-2.5">
                💡 Once you close your browser tab or clear your browser's session, any temporary image data in memory is permanently destroyed.
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">03.</span>
                Information We Do Collect (And Why)
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 mb-4">
                To manage your account, process payments, and ensure our site functions properly, we collect minimal and highly transparent categories of data:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="border border-ink/15 p-5 bg-bg flex flex-col gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold pb-1.5 border-b border-ink/10">
                    A. Account & Billing Information
                  </div>
                  <ul className="list-none flex flex-col gap-2 font-body text-[12px] text-n600">
                    <li>
                      <strong>Authentication:</strong> We use Clerk to secure your account. When you create an account, Clerk registers your email address, name, and profile details.
                    </li>
                    <li className="mt-1">
                      <strong>Billing Details:</strong> If you purchase a Pro subscription ($5/month or $33/year), your payment is processed directly by Stripe via Clerk Billing. Your credit credentials are processed entirely on Stripe's PCI-compliant servers.
                    </li>
                  </ul>
                </div>

                <div className="border border-ink/15 p-5 bg-bg flex flex-col gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold pb-1.5 border-b border-ink/10">
                    B. Technical Telemetry & Analytics
                  </div>
                  <ul className="list-none flex flex-col gap-2 font-body text-[12px] text-n600">
                    <li>
                      <strong>Performance Aggregate Metrics:</strong> We use PostHog to analyze overall traffic and application errors. We track anonymous aggregate actions to optimize performance.
                    </li>
                    <li className="mt-1">
                      <strong>Zero PII in Analytics:</strong> We route telemetry through our domain proxy (<code>/ingest</code>). This protects your data, runs free of ad-blockers, and guarantees no personal identifying information (PII) is transmitted.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4 */}
            <div className="border border-ink p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">04.</span>
                How Your Images are Processed (Technical Pipeline)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="font-serif text-md font-bold text-ink flex items-center gap-1.5">
                    <span className="w-5 h-5 border border-ink flex items-center justify-center font-mono text-[9px] bg-n100">01</span>
                    File Ingestion
                  </div>
                  <p className="font-body text-[12px] text-n600 leading-relaxed">
                    Your file is read locally in your browser memory using the secure HTML5 JavaScript File API.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="font-serif text-md font-bold text-ink flex items-center gap-1.5">
                    <span className="w-5 h-5 border border-ink flex items-center justify-center font-mono text-[9px] bg-n100">02</span>
                    Local Canvas Drawing
                  </div>
                  <p className="font-body text-[12px] text-n600 leading-relaxed">
                    The image is painted onto an offscreen <code>&lt;canvas&gt;</code> element in your browser's private sandbox memory space.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="font-serif text-md font-bold text-ink flex items-center gap-1.5">
                    <span className="w-5 h-5 border border-ink flex items-center justify-center font-mono text-[9px] bg-n100">03</span>
                    Pristine Export
                  </div>
                  <p className="font-body text-[12px] text-n600 leading-relaxed">
                    The browser regenerates the image from raw pixel coordinates, discarding all hidden tracking segments and signatures.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="pb-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">05.</span>
                Your Rights and Data Control
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                Because of our client-side architecture, you maintain total control over your digital footprint:
              </p>
              <ul className="list-none flex flex-col gap-2.5 font-sans text-[12px] text-ink mt-3 pl-1">
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&middot;</span>
                  <span><strong>Immediate Sanitization:</strong> Simply close the browser window to instantly wipe all temporary file footprints from memory.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&middot;</span>
                  <span><strong>Account Deletion:</strong> You can delete your account, session profiles, and billing logs at any time via your user dashboard.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
