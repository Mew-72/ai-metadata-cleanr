"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Calendar, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
                  className="text-[11px] font-bold uppercase tracking-wider block transition-colors text-accent border-l-2 border-accent pl-2.5"
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
              Terms of Service
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
              User Agreement &middot; Acceptable Use Framework
            </p>
          </div>

          {/* Legal Content */}
          <div className="flex flex-col gap-10">
            {/* Section 1 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">01.</span>
                Contractual Relationship
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700 drop-cap">
                Welcome to ScrubAI (referred to as "the Service," "we," "us," or "our"). These Terms of Service constitute a legally binding agreement between you ("User," "you," or "your") and ScrubAI. By accessing our platform, using our client-side metadata clearing tools, or registering an account, you agree to abide by these Terms.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">02.</span>
                Eligibility & Account Security
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                To guarantee account integrity and manage subscriptions, we establish the following requirements:
              </p>
              <ul className="list-none flex flex-col gap-3 font-sans text-[12px] text-ink mt-4 pl-1">
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Authentication:</strong> To access premium features (such as bulk queue processing), you must create an account verified by our authentication partner, Clerk.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Credentials:</strong> You are solely responsible for keeping your login credentials confidential. You agree to notify us immediately if you discover any unauthorized use of your account.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-accent font-bold mt-0.5">&middot;</span>
                  <div>
                    <strong>Automated Use:</strong> Bots, spiders, and automated scrapers are not permitted to register accounts or execute high-volume processing interfaces on our web client without explicit API licensing.
                  </div>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="border border-ink bg-n100 p-6 flex flex-col gap-3">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">03.</span>
                Intellectual Property & Your Content
              </h2>
              <ul className="list-none flex flex-col gap-3 font-body text-[13px] text-n600">
                <li>
                  <strong>Retention of Rights:</strong> You retain 100% ownership, copyright, and intellectual property rights over any images, designs, or assets you process on ScrubAI.
                </li>
                <li>
                  <strong>No License Granted:</strong> Unlike legacy cloud-based services, <strong>we do not require, request, or claim any license to copy, distribute, host, or analyze your content.</strong> Because processing runs entirely in your local browser sandbox, your intellectual property remains private and within your custody at all times.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">04.</span>
                Billing, Plans, and Refunds
              </h2>
              <p className="font-body text-[14px] leading-relaxed text-n700">
                We offer a freemium pricing structure managed through Clerk Billing and Stripe:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="border border-ink/15 p-5 bg-bg flex flex-col gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold pb-1.5 border-b border-ink/10">
                    Free Tier
                  </div>
                  <p className="font-body text-[12px] text-n600">
                    Single image drag-and-drop processing with standard metadata removal completely free of charge.
                  </p>
                </div>

                <div className="border border-ink/15 p-5 bg-bg flex flex-col gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold pb-1.5 border-b border-ink/10">
                    Pro Tier ($5/mo)
                  </div>
                  <p className="font-body text-[12px] text-n600">
                    Billed recurringly. Unlocks batch uploads (up to 50 images simultaneously) and automated generic ZIP packaging.
                  </p>
                </div>

                <div className="border border-ink/15 p-5 bg-bg flex flex-col gap-2">
                  <div className="font-mono text-[9px] uppercase tracking-wider text-accent font-bold pb-1.5 border-b border-ink/10">
                    Pro Annual ($33/yr)
                  </div>
                  <p className="font-body text-[12px] text-n600">
                    Billed annually at $33 (equivalent to $2.75/mo). All Pro features at a 45% discount. Cancel anytime.
                  </p>
                </div>
              </div>

              <div className="mt-5 p-4 border border-ink/10 bg-n100 font-sans text-[11px] text-n600 flex flex-col gap-1">
                <div>&bull; <strong>Cancellation & Failures:</strong> You can manage or cancel your subscription at any time via your account portal.</div>
                <div>&bull; <strong>Refund Policy:</strong> If you are not satisfied with your purchase, you can contact our support channel within 14 days of payment for a full refund.</div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="border border-ink p-6 flex flex-col gap-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight border-b border-ink/10 pb-2.5 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">05.</span>
                Acceptable Use Policy
              </h2>
              <p className="font-body text-[13px] leading-relaxed text-n600">
                You agree not to use the Service to:
              </p>
              <ul className="list-none flex flex-col gap-2.5 font-sans text-[12px] text-ink pl-1">
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&middot;</span>
                  <span>Violate any local, national, or international laws.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&middot;</span>
                  <span>Intentionally strip metadata from copyrighted works that do not belong to you for the purpose of digital piracy or attribution fraud.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&middot;</span>
                  <span>Bypass legitimate, cryptographically signed legal evidence markers on sensitive documents.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-accent font-bold">&middot;</span>
                  <span>Reverse engineer, decompile, or attempt to extract the client-side code of our application interface.</span>
                </li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="pb-4">
              <h2 className="font-serif text-lg lg:text-xl font-bold text-ink uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="font-mono text-[10px] text-accent">06.</span>
                Limitation of Liability & No Warranties
              </h2>
              <ul className="list-none flex flex-col gap-4.5 font-body text-[13px] text-n700 pl-1">
                <li className="flex flex-col gap-1">
                  <strong>"As-Is" Service:</strong> 
                  <span className="text-n600">ScrubAI is provided "as is" and "as available" without any warranties of any kind, either express or implied.</span>
                </li>
                <li className="flex flex-col gap-1 border-l-2 border-accent pl-4 py-1">
                  <strong className="text-accent">Algorithmic Changes Disclaimer:</strong> 
                  <span className="text-n600">Social platforms (such as Meta, Instagram, and Pinterest) constantly update their automated detection systems. While ScrubAI removes 100% of image-level metadata, EXIF headers, and C2PA manifests, we cannot guarantee that social platforms will not deploy computer vision pixel-level analysis to flag your content. We are not liable for changes in reach, shadowbans, or traffic drops on third-party networks.</span>
                </li>
                <li className="flex flex-col gap-1">
                  <strong>Indirect Damages:</strong> 
                  <span className="text-n600">In no event shall ScrubAI be liable for any indirect, incidental, special, or consequential damages resulting from your use of the tool.</span>
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
