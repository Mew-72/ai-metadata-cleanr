"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Calendar, ArrowLeft } from "lucide-react";

export default function CookiePolicyPage() {
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
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-accent border-l-2 border-accent pl-2.5"
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
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-ink hover:text-accent border-l-2 border-transparent pl-2.5"
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
              <Calendar size={12} className="text-accent" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-n500">
                Last Updated: May 23, 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl lg:text-6xl font-black uppercase tracking-tight text-ink mb-1.5 leading-none">
              Cookie Policy
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              Transparent Telemetry &middot; Strictly Necessary Cookies Only
            </p>
          </div>

          {/* Legal Content */}
          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">01.</span>
                How We Use Cookies
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 drop-cap">
                ScrubAI uses a minimal and strictly necessary set of cookies. Unlike traditional web platforms, we do not partner with third-party tracking networks, nor do we drop behavioral advertising, retargeting, or data-broker cookies. Our cookies are strictly used to secure your session, run localized interface preferences, and process secure payments.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">02.</span>
                Categories of Cookies We Deploy
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 mb-6">
                Below is a comprehensive audit of all cookies set on our platform:
              </p>

              {/* Newsprint Themed Table */}
              <div className="border border-ink bg-bg overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-ink bg-n100 font-mono text-[9px] uppercase tracking-widest text-n500 font-bold">
                      <th className="p-3 border-r border-ink/10">Cookie Provider</th>
                      <th className="p-3 border-r border-ink/10">Purpose</th>
                      <th className="p-3 border-r border-ink/10">Duration</th>
                      <th className="p-3">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10 font-sans text-[11px] text-ink">
                    <tr>
                      <td className="p-3 border-r border-ink/10 font-bold">Clerk Authentication</td>
                      <td className="p-3 border-r border-ink/10 text-n600">Keeps you securely logged into your user profile and handles dashboard routing.</td>
                      <td className="p-3 border-r border-ink/10 font-mono text-[9px] uppercase text-n500">Session / Persistent</td>
                      <td className="p-3 font-mono text-[9px] font-bold text-accent uppercase">Strictly Necessary</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-ink/10 font-bold">Stripe / Clerk Billing</td>
                      <td className="p-3 border-r border-ink/10 text-n600">Coordinates secure, fraud-free payment transactions during checkout.</td>
                      <td className="p-3 border-r border-ink/10 font-mono text-[9px] uppercase text-n500">Session</td>
                      <td className="p-3 font-mono text-[9px] font-bold text-accent uppercase">Strictly Necessary</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-ink/10 font-bold">PostHog Analytics</td>
                      <td className="p-3 border-r border-ink/10 text-n600">Keeps track of unique visitors to help us understand total usage patterns (e.g. returns vs new).</td>
                      <td className="p-3 border-r border-ink/10 font-mono text-[9px] uppercase text-n500">Up to 1 year</td>
                      <td className="p-3 font-mono text-[9px] font-bold text-n500 uppercase">Performance / Analytical</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-ink/10 font-bold">ScrubAI Preferences</td>
                      <td className="p-3 border-r border-ink/10 text-n600">Remembers local user settings (e.g. light/dark newsprint theme or custom filename toggles).</td>
                      <td className="p-3 border-r border-ink/10 font-mono text-[9px] uppercase text-n500">Persistent</td>
                      <td className="p-3 font-mono text-[9px] font-bold text-n500 uppercase">Functional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3 */}
            <div className="pb-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">03.</span>
                Managing and Opting Out
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                Most web browsers are configured to accept cookies automatically. If you wish to disable cookies, you can do so directly in your browser's security preferences.
              </p>
              <p className="font-body text-[14px] leading-relaxed text-n700 mt-4 border-l-2 border-accent pl-4 py-1 text-n600">
                <strong>Important Notice:</strong> Disabling strictly necessary cookies (such as Clerk authentication) will prevent you from logging in, upgrading your account to Pro, or utilizing premium batch purification workspaces.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
