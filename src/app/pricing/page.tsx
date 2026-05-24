"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import {
  Check,
  X,
  ShieldCheck,
  Sparkles,
  Zap,
  Lock,
  ArrowRight
} from "lucide-react";
import { useAppAuth } from "../../hooks/useAppAuth";
import { SignInButton } from "@clerk/nextjs";
import { CheckoutButton, useSubscription } from "@clerk/nextjs/experimental";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const PRO_PLAN_ID = "cplan_3E8abrF3w9d3015ds749d5IHUaT";

export default function PricingPage() {
  const { isSignedIn, has } = useAppAuth();
  const { data: subscription } = useSubscription();

  // Billing period toggle: "month" | "annual"
  const [billingPeriod, setBillingPeriod] = useState<"month" | "annual">("month");

  useEffect(() => {
    posthog.capture("pricing_page_viewed");
  }, []);

  const isProActive = has ? (has({ plan: "pro" }) || has({ feature: "batch_processing" })) : false;

  // Determine if active plan is monthly or annual
  const activePeriod = subscription?.subscriptionItems?.[0]?.planPeriod; // "month" or "annual"
  const isMonthlyActive = isProActive && activePeriod === "month";
  const isAnnualActive = isProActive && activePeriod === "annual";

  // Derived pricing for the toggle
  const proPrice = billingPeriod === "month" ? "$5" : "$33";
  const proPeriodLabel = billingPeriod === "month" ? "/ month" : "/ year";
  const proSubtext = billingPeriod === "month"
    ? "Billed monthly. Cancel anytime."
    : "Billed annually at $33 ($2.75/mo). Save 45%.";

  const isCurrentPeriodActive = billingPeriod === "month" ? isMonthlyActive : isAnnualActive;
  const isOtherPeriodActive = billingPeriod === "month" ? isAnnualActive : isMonthlyActive;

  // CTA text logic
  const getProCtaText = () => {
    if (isCurrentPeriodActive) return "CURRENT ACTIVE PLAN";
    if (isOtherPeriodActive) return billingPeriod === "month" ? "SWITCH TO MONTHLY" : "SWITCH TO ANNUAL";
    return "UPGRADE TO PRO";
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink font-body transition-colors duration-200">
      {/* Navigation Header */}
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink bg-bg select-none animate-fadeIn">
        
        {/* Editorial Title Section */}
        <div className="p-8 lg:p-16 border-b-4 border-ink text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent font-black mb-3 select-none flex items-center gap-1.5 animate-pulse">
            <span className="text-[6px]">●</span> SCRUBAI SUBSCRIPTION CATALOG
          </div>
          <h1 className="font-serif text-[42px] lg:text-[62px] font-black uppercase tracking-tight text-ink mb-6 leading-none">
            CHOOSE YOUR <span className="text-accent">EDITION</span>
          </h1>
          <p className="font-body text-[13px] md:text-[14px] text-n500 leading-relaxed max-w-xl mx-auto">
            Maintain complete control of your creative metadata and bypass digital suppressions. Tiers are integrated securely with Clerk Authentication and Stripe Checkout.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="mt-8 flex items-center gap-0 border-2 border-ink bg-n100/30 select-none">
            <button
              onClick={() => {
                setBillingPeriod("month");
                posthog.capture("billing_period_toggled", { period: "month" });
              }}
              className={`px-6 py-2.5 font-mono text-[10px] font-black tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                billingPeriod === "month"
                  ? "bg-ink text-bg"
                  : "bg-transparent text-n500 hover:text-ink hover:bg-n100/50"
              }`}
            >
              MONTHLY
            </button>
            <button
              onClick={() => {
                setBillingPeriod("annual");
                posthog.capture("billing_period_toggled", { period: "annual" });
              }}
              className={`px-6 py-2.5 font-mono text-[10px] font-black tracking-widest uppercase transition-all duration-150 cursor-pointer relative ${
                billingPeriod === "annual"
                  ? "bg-ink text-bg"
                  : "bg-transparent text-n500 hover:text-ink hover:bg-n100/50"
              }`}
            >
              ANNUAL
              <span className="absolute -top-2.5 -right-2 bg-accent text-white font-mono text-[7px] font-black px-1.5 py-0.5 tracking-wider">
                -45%
              </span>
            </button>
          </div>
        </div>

        {/* Two-column pricing: Free + Pro */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink border-b-4 border-ink bg-n100/10">
          
          {/* Card 1: Free Plan */}
          <div className="p-10 bg-bg flex flex-col justify-between min-h-[460px] hover:bg-n100/5 transition-colors duration-200">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-n400 font-bold mb-2">
                STANDARD CIRCULATION
              </div>
              <h2 className="font-serif text-3xl font-black uppercase text-ink tracking-tight mb-3">
                FREE EDITION
              </h2>
              <div className="h-[2px] bg-ink/30 my-4 w-12" />
              <div className="font-serif text-[42px] font-black text-ink mb-5 tracking-tight">
                $0<span className="text-sm font-normal text-n500 tracking-normal"> / month</span>
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed mb-6">
                Standard local metadata analysis and single-file canvas purification engine. Recommended for hobbyist creators and single uploads.
              </p>

              {/* Free features list */}
              <ul className="space-y-2.5 mb-6">
                {[
                  "1 image at a time",
                  "5 images per day",
                  "10 MB max file size",
                  "All tools included",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-n500">
                    <Check size={13} className="text-green-700 stroke-[3px] mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
                {[
                  "Batch processing",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-n400">
                    <X size={13} className="opacity-40 stroke-[3px] mt-0.5 shrink-0" />
                    <span className="line-through">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <Link 
                href="/" 
                className="w-full block bg-n100 text-ink border-2 border-ink py-4 font-sans text-[11px] font-black tracking-widest uppercase text-center hover:bg-ink hover:text-bg transition-colors duration-150 shadow-sm"
              >
                GO TO WORKSPACE
              </Link>
              <div className="text-center font-mono text-[8px] text-n400 uppercase tracking-widest mt-3">
                NO CREDIT CARD REQUIRED
              </div>
            </div>
          </div>

          {/* Card 2: Pro Plan — dynamically switches monthly/annual based on toggle */}
          <div className="p-10 bg-bg flex flex-col justify-between min-h-[460px] relative hover:bg-n100/5 transition-colors duration-200 border-t-4 md:border-t-0 border-accent">
            <div className="absolute top-10 right-10 bg-accent text-white font-mono text-[8px] font-black px-2.5 py-1 tracking-widest uppercase shadow-sm">
              {billingPeriod === "annual" ? "BEST VALUE" : "POPULAR"}
            </div>
            
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent font-black mb-2 flex items-center gap-1">
                <span className="text-[6px]">●</span> HIGH FREQUENCY
              </div>
              <h2 className="font-serif text-3xl font-black uppercase text-ink tracking-tight mb-3">
                PRO {billingPeriod === "annual" ? "ANNUAL" : "MONTHLY"}
              </h2>
              <div className="h-[2px] bg-accent my-4 w-12" />
              <div className="font-serif text-[42px] font-black text-ink mb-1 tracking-tight transition-all duration-200">
                {proPrice}<span className="text-sm font-normal text-n500 tracking-normal"> {proPeriodLabel}</span>
              </div>
              <div className="font-mono text-[9px] text-n400 uppercase tracking-wider mb-5">
                {proSubtext}
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed mb-6">
                Unlock advanced batch metadata stripping, multiple simultaneous file queues, absolute ZIP exports, and camera profile footprints to fully bypass tracking databases.
              </p>

              {/* Pro features list */}
              <ul className="space-y-2.5 mb-6">
                {[
                  "Up to 50 images at once",
                  "Unlimited daily processing",
                  "20 MB max file size",
                  "All tools included",
                  "Batch ZIP export",
                  "Priority support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-xs text-n500">
                    <Check size={13} className="text-accent stroke-[3px] mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              {isSignedIn ? (
                isCurrentPeriodActive ? (
                  <button className="w-full bg-n100 text-n400 border-2 border-ink/20 py-4 font-sans text-[11px] font-black tracking-widest uppercase cursor-not-allowed shadow-sm">
                    {getProCtaText()}
                  </button>
                ) : (
                  <CheckoutButton planId={PRO_PLAN_ID} planPeriod={billingPeriod} newSubscriptionRedirectUrl="/dashboard?upgraded=true">
                    <button
                      onClick={() => posthog.capture("checkout_started", { plan: "pro", period: billingPeriod })}
                      className="w-full bg-accent text-white border-2 border-accent py-4 font-sans text-[11px] font-black tracking-widest uppercase cursor-pointer hover:bg-ink hover:border-ink transition-colors duration-150 shadow-sm"
                    >
                      {getProCtaText()}
                    </button>
                  </CheckoutButton>
                )
              ) : (
                <SignInButton mode="modal" signUpForceRedirectUrl="/pricing">
                  <button className="w-full bg-accent text-white border-2 border-accent py-4 font-sans text-[11px] font-black tracking-widest uppercase cursor-pointer hover:bg-ink hover:border-ink transition-colors duration-150 shadow-sm">
                    LOG IN TO UPGRADE
                  </button>
                </SignInButton>
              )}
              <div className="text-center font-mono text-[8px] text-n400 uppercase tracking-widest mt-3">
                SECURE CHECKOUT WITH STRIPE
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table Section */}
        <div className="p-8 lg:p-16 bg-bg">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-black uppercase tracking-tight text-ink">
              FULL FEATURE COMPARISON
            </h2>
            <div className="h-[3px] bg-ink my-3 w-16 mx-auto double-border-bottom" />
            <p className="font-mono text-[9px] text-n500 uppercase tracking-[0.18em]">
              LINE-BY-LINE DETAILED TECHNICAL MATRIX
            </p>
          </div>

          <div className="border-4 border-ink overflow-hidden bg-bg max-w-4xl mx-auto shadow-heavy select-none">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-n100 border-b-2 border-ink font-mono text-[9px] uppercase tracking-[0.15em] text-n500 font-bold">
                  <th className="p-4 w-1/2">FEATURE / SPECIFICATION</th>
                  <th className="p-4 text-center w-1/4">FREE EDITION</th>
                  <th className="p-4 text-center w-1/4 text-accent font-black">PRO</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-ink/10">
                {/* CATEGORY 1: TOOLS INCLUDED */}
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-[0.15em] text-ink font-black border-y border-ink/10">
                  <td colSpan={3} className="p-3.5 pl-4 bg-n100/60 font-black">
                    TOOLS INCLUDED
                  </td>
                </tr>
                
                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Privacy Analyzer</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(EXIF extraction, JUMBF metadata claims, raw alerts &amp; color space markers)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Content Credentials Checker</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(Destroys JUMBF blocks, signatures verification, certificate trust metrics &amp; raw manifest code blocks)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image DIFF Tool</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(Side-by-side or slider pixel grid analysis to confirm spatial equivalence)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Invisible Watermark</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(Embed &amp; inspect robust spatial-frequency watermarks (DWT-DCT steganography))</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Format Converter</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(Convert between 10+ standard photography and web-optimized formats (HEIC, WebP, AVIF...))</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Resizer &amp; Compressor</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(Downscale pixels, set custom quality factors, and enforce resolution profiles)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Batch EXIF Editor</div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">(Batch edit metadata, customize camera make/model profiles, and strip tags)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto text-green-700 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>

                {/* CATEGORY 2: USAGE & LIMITS */}
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-[0.15em] text-ink font-black border-y border-ink/10">
                  <td colSpan={3} className="p-3.5 pl-4 bg-n100/60 font-black">
                    USAGE &amp; LIMITS
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Daily usage limit</div>
                    <div className="text-[10px] text-n500 mt-0.5">Max processed images allowed per 24 hours</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2.5 py-1 font-mono text-[9px] font-bold text-n600">5 / DAY</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-green-800/10 border border-green-800/30 text-green-800 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm select-none">UNLIMITED</span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Batch processing</div>
                    <div className="text-[10px] text-n500 mt-0.5">Number of images purified simultaneously in one drag-and-drop action</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2.5 py-1 font-mono text-[9px] font-bold text-n600">1 AT ONCE</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-accent/10 border border-accent/30 text-accent px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm select-none">50 AT ONCE</span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Max file size</div>
                    <div className="text-[10px] text-n500 mt-0.5">Maximum permitted size per individual image upload</div>
                  </td>
                  <td className="p-4 text-center font-mono text-[10px] text-n600 font-bold">10 MB</td>
                  <td className="p-4 text-center font-mono text-[10px] text-accent font-black border border-accent/20 bg-accent/2">20 MB</td>
                </tr>

                {/* CATEGORY 3: SUPPORT */}
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-[0.15em] text-ink font-black border-y border-ink/10">
                  <td colSpan={3} className="p-3.5 pl-4 bg-n100/60 font-black">
                    SUPPORT
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Priority support</div>
                    <div className="text-[10px] text-n500 mt-0.5">Direct developer assistance &amp; high-priority feature requests queue</div>
                  </td>
                  <td className="p-4 text-center text-n400"><X size={14} className="mx-auto opacity-40 stroke-[3px]" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto text-accent stroke-[3px]" /></td>
                </tr>
              </tbody>
            </table>
            
            {/* Table Footer */}
            <div className="p-5 bg-n100 border-t-2 border-ink text-center font-mono text-[9px] text-n500 uppercase tracking-widest flex flex-col sm:flex-row justify-between items-center gap-4">
              <span>ALREADY HAVE AN ACCOUNT? <Link href="/dashboard" className="text-ink font-black hover:underline hover:text-accent transition-colors">SIGN IN</Link></span>
              <span className="flex items-center gap-1.5 font-black text-ink">
                ● SECURE PAYMENTS POWERED BY STRIPE
              </span>
            </div>
          </div>
        </div>

      </main>

      {/* Footer Accents */}
      <Footer />
    </div>
  );
}
