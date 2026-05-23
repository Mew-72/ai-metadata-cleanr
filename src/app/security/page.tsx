"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Calendar, ArrowLeft } from "lucide-react";

export default function SecurityPolicyPage() {
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
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-ink hover:text-accent border-l-2 border-transparent pl-2.5"
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
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-accent border-l-2 border-accent pl-2.5"
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
              Security Policy
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              Security by Absence &middot; Client-Side Isolation Protocols
            </p>
          </div>

          {/* Legal Content */}
          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">01.</span>
                Data Minimization: Security by Absence
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 drop-cap">
                The ultimate security standard is data minimization: we cannot lose, leak, or compromise data we do not collect. Because ScrubAI runs entirely inside your browser's local sandbox memory, there is no centralized database of user images for malicious actors to breach or intercept.
              </p>
              <p className="font-body text-[14px] leading-relaxed text-n700 mt-4">
                If a hacker targeted our backend hosting provider, they would find only static, pre-compiled HTML, CSS, and client-side JavaScript—containing absolutely zero user files, media assets, or personal archives.
              </p>
            </div>

            {/* Section 2 */}
            <div className="border border-ink bg-n100 p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">02.</span>
                Authentication & Session Integrity (Clerk)
              </h2>
              <p className="font-body text-[13px] leading-relaxed text-n600">
                We delegate our complete identity management to Clerk, a leading developer-focused security framework. Clerk maintains state-of-the-art defenses to protect your profile:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="border border-ink/10 bg-bg p-4 flex flex-col gap-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold">Brute-Force Protection</div>
                  <p className="font-body text-[12px] text-n600">Monitored continuously against login threshold abuses and suspicious endpoint inquiries.</p>
                </div>
                <div className="border border-ink/10 bg-bg p-4 flex flex-col gap-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold">XSS Mitigation</div>
                  <p className="font-body text-[12px] text-n600">Secure, encrypted, <code>HttpOnly</code> cookies prevent client-side script cross-site hacking tokens access.</p>
                </div>
                <div className="border border-ink/10 bg-bg p-4 flex flex-col gap-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold">CSRF Mitigation</div>
                  <p className="font-body text-[12px] text-n600">Protected against cross-site request forgery through strict deployment of <code>SameSite</code> cookie tags.</p>
                </div>
                <div className="border border-ink/10 bg-bg p-4 flex flex-col gap-1">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold">Session Fixation Prevention</div>
                  <p className="font-body text-[12px] text-n600">Every sign in/out session token is completely regenerated and the old session immediately invalidated.</p>
                </div>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">03.</span>
                Financial and Checkout Security (Stripe)
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                Your credit card data is never transmitted, processed, or held on ScrubAI infrastructure. We integrate directly with Stripe (via Clerk Billing) to ensure maximum compliance:
              </p>
              
              <ul className="list-none flex flex-col gap-3 font-sans text-[12px] text-ink mt-4 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>PCI-DSS Level 1 Compliance:</strong> Stripe is a certified PCI Level 1 Service Provider—the most stringent security standard in the payment processing industry.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Encrypted Handshakes:</strong> Checkout sessions are encrypted in transit via Transport Layer Security (TLS 1.3) directly between your device and Stripe.
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="border border-ink p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">04.</span>
                Content Security Policies (CSP) & Invalidation
              </h2>
              <p className="font-body text-[13px] leading-relaxed text-n600">
                We implement a strict Content Security Policy (CSP) at our application’s header layer. This prevents malicious code injections and unauthorized network calls by restricting resource loading to a pre-approved list of domains:
              </p>
              
              <ul className="list-none flex flex-col gap-3 font-mono text-[10px] text-ink pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>connect-src:</strong> Authorized exclusively for first-party assets (<code>'self'</code>), Clerk API endpoints, Stripe's gateway, and our reverse telemetry proxy (<code>/ingest</code>).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>img-src:</strong> Authorized exclusively for local blobs (<code>blob:</code>), base64 indicators, and Clerk assets (<code>https://img.clerk.com</code>).
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>worker-src:</strong> Standardized to run secure browser web workers locally.
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="pb-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">05.</span>
                Reporting Vulnerabilities
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                We welcome security feedback. If you discover a potential vulnerability in our code, implementation, or setup, please email us immediately at <code>security@yourdomain.com</code> with reproducible steps.
              </p>
              <p className="font-body text-[14px] leading-relaxed text-n700 mt-4">
                We promise to review your disclosure within 48 hours and work with you to implement a fix immediately.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
