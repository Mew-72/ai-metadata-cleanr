"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Calendar, ArrowLeft, RefreshCw } from "lucide-react";

export default function RefundPolicyPage() {
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
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-ink hover:text-accent border-l-2 border-transparent pl-2.5"
                >
                  Security Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-accent border-l-2 border-accent pl-2.5"
                >
                  Refund Policy
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
              <RefreshCw size={12} className="text-accent" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-n500">
                Last Updated: May 25, 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl lg:text-6xl font-black uppercase tracking-tight text-ink mb-1.5 leading-none">
              Refund Policy
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              Digital Goods &middot; Strict No-Refund Framework
            </p>
          </div>

          {/* Legal Content */}
          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">01.</span>
                Strict No-Refund Standard
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 drop-cap">
                All purchases and upgrades made on ScrubAI are final, legally binding, and <strong>strictly non-refundable</strong>. By purchasing our Pro Tier lifetime membership and completing checkout via our secure PayPal payment processor, you acknowledge and agree that you waive any right to a refund or chargeback.
              </p>
            </div>

            {/* Section 2 */}
            <div className="border border-ink bg-n100 p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">02.</span>
                Why We Enforce a Strict Policy
              </h2>
              <p className="font-body text-[13px] leading-relaxed text-n600">
                ScrubAI operates on a unique "local-first" client-side model. We do not store your images, and we do not utilize remote server queues to process your files. Once you upgrade your account:
              </p>
              <ul className="list-none flex flex-col gap-3 font-sans text-[12px] text-ink pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Instant Value Delivery:</strong> Access to premium features (including large-batch file queues, advanced compression, and customized export options) is unlocked instantly in your browser memory via your Clerk session profile.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Unlimited Utilization:</strong> Because files are processed purely client-side, subscribed users can instantly process hundreds or thousands of high-fidelity images immediately upon upgrading. There is no physical way to "return" or "revoke" the digital transformations and metadata-stripping actions executed locally on your device.
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">03.</span>
                Lifetime Membership &amp; Permanent Access
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                Because ScrubAI Pro is a one-time purchase, there are no cancellation procedures or monthly cycles to manage:
              </p>
              
              <ul className="list-none flex flex-col gap-3 font-sans text-[12px] text-ink mt-4 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>No Recurring Billing:</strong> Once purchased, your account is marked as a Pro Member for life. You will never be billed again, and no automatic card payments will occur.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Permanent Core Access:</strong> Your Pro features (including batch image purification, ZIP exports, and large size capabilities) remain permanently active on your account as long as your Clerk credentials remain active.
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="border border-ink p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">04.</span>
                Double-Charges & Technical Errors
              </h2>
              <p className="font-body text-[13px] leading-relaxed text-n600">
                We are committed to absolute billing accuracy. If you believe there has been a duplicate transaction or a technical credit error:
              </p>
              <ul className="list-none flex flex-col gap-2.5 font-sans text-[12px] text-ink pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <span><strong>Reporting Double Charges:</strong> If you see a duplicate charge, contact our billing channel at <code>billing@scrubai.app</code> with your invoice details and PayPal transaction IDs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <span><strong>Verified Resolution:</strong> If our billing systems verify an administrative or system-level double-charge, we will issue a credit or refund for the extra transaction back to your original payment method.</span>
                </li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="pb-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">05.</span>
                No Exceptions
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                To guarantee fairness, consistency, and operational simplicity for all creators on our platform, we make <strong>absolutely no exceptions</strong> to this policy. This includes, but is not limited to, claims regarding:
              </p>
              <ul className="list-none flex flex-col gap-2 font-sans text-[12px] text-n600 mt-3 pl-1">
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&bull;</span>
                  <span>Accidental purchase or upgrade.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&bull;</span>
                  <span>Unused features or under-utilization of the service.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&bull;</span>
                  <span>Changes in third-party platform algorithms (e.g. reach metrics on Instagram or Pinterest).</span>
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
