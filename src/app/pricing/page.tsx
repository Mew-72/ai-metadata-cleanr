"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Check, X, Sparkles } from "lucide-react";
import { useAppAuth } from "../../hooks/useAppAuth";
import { SignInButton } from "@clerk/nextjs";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function PricingPage() {
  const { isSignedIn, isPro, userId, isLoaded } = useAppAuth();
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    posthog.capture("pricing_page_viewed");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink font-body transition-colors duration-200">
      {/* Navigation Header */}
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink bg-bg select-none animate-fadeIn">
        {/* Editorial Title Section */}
        <div className="p-8 lg:p-16 border-b-4 border-ink text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent font-black mb-3 select-none flex items-center gap-1.5 animate-pulse">
            <span className="text-[6px]">●</span> SCRUBAI LIFETIME OFFERS
          </div>
          <h1 className="font-serif text-[42px] lg:text-[62px] font-black uppercase tracking-tight text-ink mb-6 leading-none">
            PAY ONCE, <span className="text-accent">OWN FOREVER</span>
          </h1>
          <p className="font-body text-[13px] md:text-[14px] text-n500 leading-relaxed max-w-xl mx-auto">
            Say goodbye to monthly subscriptions. Access full client-side batch
            purification capabilities for a one-time fee. Integrated securely
            with Clerk Authentication and PayPal Checkout.
          </p>
        </div>

        {/* Two-column pricing: Free + Lifetime Pro */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink border-b-4 border-ink bg-n100/10">
          {/* Card 1: Free Plan */}
          <div className="p-10 bg-bg flex flex-col justify-between min-h-[480px] hover:bg-n100/5 transition-colors duration-200">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-n400 font-bold mb-2">
                STANDARD CIRCULATION
              </div>
              <h2 className="font-serif text-3xl font-black uppercase text-ink tracking-tight mb-3">
                FREE EDITION
              </h2>
              <div className="h-[2px] bg-ink/30 my-4 w-12" />
              <div className="font-serif text-[42px] font-black text-ink mb-5 tracking-tight">
                $0
                <span className="text-sm font-normal text-n500 tracking-normal">
                  {" "}
                  / forever
                </span>
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed mb-6">
                Standard local metadata analysis and single-file canvas
                purification engine. Recommended for hobbyist creators and
                single uploads.
              </p>

              {/* Free features list */}
              <ul className="space-y-2.5 mb-6">
                {[
                  "1 image at a time",
                  "5 canvas cleans per day",
                  "5 C2PA scans per day",
                  "10 MB max file size",
                  "EXIF & C2PA scrubbing engines",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-n500"
                  >
                    <Check
                      size={13}
                      className="text-green-700 stroke-[3px] mt-0.5 shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
                {[
                  "Batch processing",
                  "Priority support",
                  "All future tools",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-n400"
                  >
                    <X
                      size={13}
                      className="opacity-40 stroke-[3px] mt-0.5 shrink-0"
                    />
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

          {/* Card 2: Lifetime Pro Plan */}
          <div className="p-10 bg-bg flex flex-col justify-between min-h-[480px] relative hover:bg-n100/5 transition-colors duration-200 border-t-4 md:border-t-0 border-accent">
            <div className="absolute top-10 right-10 bg-accent text-white font-mono text-[8px] font-black px-2.5 py-1 tracking-widest uppercase shadow-sm">
              LIFETIME DEAL
            </div>

            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-accent font-black mb-2 flex items-center gap-1">
                <span className="text-[6px]">●</span> UNLIMITED MEMBERSHIP
              </div>
              <h2 className="font-serif text-3xl font-black uppercase text-ink tracking-tight mb-3">
                LIFETIME PRO
              </h2>
              <div className="h-[2px] bg-accent my-4 w-12" />
              <div className="font-serif text-[42px] font-black text-ink mb-1 tracking-tight transition-all duration-200">
                $24.99
                <span className="text-sm font-normal text-n500 tracking-normal">
                  {" "}
                  one-time
                </span>
              </div>
              <div className="font-mono text-[9px] text-accent uppercase tracking-wider mb-5">
                PAY ONCE. USE FOREVER. NO RECURRING FEES.
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed mb-6">
                Batch metadata stripping, 50-image queues, ZIP exports, camera
                profile bypass, and early-adopter access to all future tool
                expansions.
              </p>

              {/* Pro features list */}
              <ul className="space-y-2.5 mb-6">
                {[
                  "Clean up to 50 images at once",
                  "Unlimited cleans & C2PA scans",
                  "Increased file size (20 MB)",
                  "All future tools included at no extra cost",
                  "Batch ZIP export",
                  "Priority developer support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-xs text-n500"
                  >
                    <Check
                      size={13}
                      className="text-accent stroke-[3px] mt-0.5 shrink-0"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              {!isLoaded ? (
                <button
                  disabled
                  className="w-full bg-n100 text-n400 border-2 border-ink/20 py-4 font-sans text-[11px] font-black tracking-widest uppercase cursor-not-allowed shadow-sm animate-pulse"
                >
                  Loading…
                </button>
              ) : isPro ? (
                <button className="w-full bg-n100 text-n400 border-2 border-ink/20 py-4 font-sans text-[11px] font-black tracking-widest uppercase cursor-not-allowed shadow-sm">
                  LIFETIME PRO ACTIVE
                </button>
              ) : isSignedIn ? (
                <div className="w-full">
                  {!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                    <div className="w-full border-2 border-ink/20 py-4 px-3 text-center">
                      <p className="font-sans text-[11px] text-n500 uppercase tracking-wider">
                        Checkout is temporarily unavailable. Please try again
                        later.
                      </p>
                    </div>
                  ) : (
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                        currency: "USD",
                        intent: "capture",
                        components: "buttons",
                        "disable-funding": "paylater,credit",
                      }}
                    >
                      <div className="relative z-10">
                        <PayPalButtons
                          style={{
                            layout: "vertical",
                            label: "buynow",
                            height: 48,
                          }}
                          createOrder={async () => {
                            try {
                              const response = await fetch(
                                "/api/paypal/create-order",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                },
                              );
                              const orderData = await response.json();

                              if (!orderData.success) {
                                throw new Error(
                                  orderData.error || "Failed to create order",
                                );
                              }

                              return orderData.orderId;
                            } catch (err) {
                              console.error(
                                "Error creating PayPal order:",
                                err,
                              );
                              alert(
                                "Failed to initialize PayPal transaction. Please try again.",
                              );
                              throw err;
                            }
                          }}
                          onApprove={async (data) => {
                            try {
                              const response = await fetch(
                                "/api/paypal/capture-order",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    orderId: data.orderID,
                                  }),
                                },
                              );

                              const resData = await response.json();
                              if (resData.success) {
                                posthog.capture("checkout_completed", {
                                  plan: "pro",
                                  period: "lifetime",
                                  payment_provider: "paypal",
                                });
                                window.location.href = "/thank-you";
                              } else {
                                alert(
                                  "Payment could not be completed: " +
                                    (resData.error ||
                                      "Unknown error. Please contact support."),
                                );
                              }
                            } catch (err) {
                              console.error("Payment capture error:", err);
                              alert(
                                "An error occurred processing your payment. Please contact support.",
                              );
                            }
                          }}
                          onError={(err) => {
                            console.error("[PayPal] Button error:", err);
                            alert(
                              "PayPal checkout encountered an error. Please try again or use a different browser.",
                            );
                          }}
                        />
                      </div>
                    </PayPalScriptProvider>
                  )}
                </div>
              ) : (
                <SignInButton mode="modal" signUpForceRedirectUrl="/pricing">
                  <button className="w-full bg-accent text-white border-2 border-accent py-4 font-sans text-[11px] font-black tracking-widest uppercase cursor-pointer hover:bg-ink hover:border-ink transition-colors duration-150 shadow-sm">
                    LOG IN TO UPGRADE
                  </button>
                </SignInButton>
              )}
              <div className="text-center font-mono text-[8px] text-n400 uppercase tracking-widest mt-3">
                SECURE CHECKOUT WITH PAYPAL
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

          {/* ─── MOBILE COMPARISON CARDS (visible below md) ─── */}
          <div className="md:hidden border-4 border-ink bg-bg max-w-4xl mx-auto shadow-heavy select-none">
            {/* Column Labels Header */}
            <div className="bg-n100 border-b-2 border-ink">
              <div className="px-4 pt-3 pb-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-n500 font-bold">
                FEATURE / SPECIFICATION
              </div>
              <div className="grid grid-cols-2 divide-x-2 divide-ink/20 border-t-2 border-ink/20">
                <div className="p-2.5 text-center font-mono text-[8px] uppercase tracking-[0.1em] text-n500 font-bold">
                  FREE EDITION
                </div>
                <div className="p-2.5 text-center font-mono text-[8px] uppercase tracking-[0.1em] text-accent font-black">
                  PRO
                </div>
              </div>
            </div>

            {/* SYSTEM CAPABILITIES */}
            <div className="px-4 py-2.5 bg-n100/60 border-y border-ink/10 font-mono text-[8px] uppercase tracking-[0.15em] text-ink font-black">
              SYSTEM CAPABILITIES
            </div>

            {/* Canvas Purification Engine */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Canvas Purification Engine
                </div>
                <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                  Re-draws image pixels on sandboxed browser canvas to destroy
                  deep tracking signatures
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-green-700 stroke-[3px]"
                  />
                </div>
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-accent stroke-[3px]"
                  />
                </div>
              </div>
            </div>

            {/* Image Privacy Analyzer */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Image Privacy Analyzer
                </div>
                <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                  Inspects inbound EXIF, IPTC, XMP metadata structures and tags
                  before stripping
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-green-700 stroke-[3px]"
                  />
                </div>
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-accent stroke-[3px]"
                  />
                </div>
              </div>
            </div>

            {/* C2PA Credentials Inspector */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  C2PA Credentials Inspector
                </div>
                <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                  Scans for JUMBF block signatures and cryptographically signed
                  provenance manifests
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-green-700 stroke-[3px]"
                  />
                </div>
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-accent stroke-[3px]"
                  />
                </div>
              </div>
            </div>

            {/* USAGE & ENTITLEMENTS */}
            <div className="px-4 py-2.5 bg-n100/60 border-y border-ink/10 font-mono text-[8px] uppercase tracking-[0.15em] text-ink font-black">
              USAGE &amp; ENTITLEMENTS
            </div>

            {/* Batch Processing Queue */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Batch Processing Queue
                </div>
                <div className="text-[10px] text-n500 mt-0.5">
                  Process multiple files simultaneously in one drag-and-drop
                  batch
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <span className="bg-n100 border border-ink/20 px-2 py-1 font-mono text-[8px] font-bold text-n600">
                    1 AT ONCE
                  </span>
                </div>
                <div className="p-3 text-center">
                  <span className="bg-accent/10 border border-accent/30 text-accent px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wider">
                    50 AT ONCE
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Purification Capacity */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Daily Purification Capacity
                </div>
                <div className="text-[10px] text-n500 mt-0.5">
                  Max processed images allowed per day
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <span className="bg-n100 border border-ink/20 px-2 py-1 font-mono text-[8px] font-bold text-n600">
                    5 / DAY
                  </span>
                </div>
                <div className="p-3 text-center">
                  <span className="bg-green-800/10 border border-green-800/30 text-green-800 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wider">
                    UNLIMITED
                  </span>
                </div>
              </div>
            </div>

            {/* Daily C2PA Scans */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Daily C2PA Scans
                </div>
                <div className="text-[10px] text-n500 mt-0.5">
                  Max verified images via C2PA scanner per day
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <span className="bg-n100 border border-ink/20 px-2 py-1 font-mono text-[8px] font-bold text-n600">
                    5 / DAY
                  </span>
                </div>
                <div className="p-3 text-center">
                  <span className="bg-green-800/10 border border-green-800/30 text-green-800 px-2 py-1 font-mono text-[8px] font-black uppercase tracking-wider">
                    UNLIMITED
                  </span>
                </div>
              </div>
            </div>

            {/* Max File Size Limit */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Max File Size Limit
                </div>
                <div className="text-[10px] text-n500 mt-0.5">
                  Maximum permitted binary upload size per individual image
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center font-mono text-[10px] text-n600 font-bold">
                  10 MB
                </div>
                <div className="p-3 text-center font-mono text-[10px] text-accent font-black">
                  20 MB
                </div>
              </div>
            </div>

            {/* SUPPORT & EXPANSIONS */}
            <div className="px-4 py-2.5 bg-n100/60 border-y border-ink/10 font-mono text-[8px] uppercase tracking-[0.15em] text-ink font-black">
              SUPPORT &amp; EXPANSIONS
            </div>

            {/* Priority Developer Support */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Priority Developer Support
                </div>
                <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                  Direct developer assistance and high-priority feature requests
                  (Clerk: priority_support)
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <X size={14} className="mx-auto opacity-40 stroke-[3px]" />
                </div>
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-accent stroke-[3px]"
                  />
                </div>
              </div>
            </div>

            {/* Future Tool Expansions */}
            <div className="border-b border-ink/10">
              <div className="px-4 py-3">
                <div className="font-bold text-ink text-xs">
                  Future Tool Expansions
                </div>
                <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                  Complementary early-adopters access to all future tool
                  expansions (e.g. spatial watermarks, DIFF sliders)
                </div>
              </div>
              <div className="grid grid-cols-2 divide-x divide-ink/10 border-t border-ink/10 bg-n100/10">
                <div className="p-3 text-center">
                  <X size={14} className="mx-auto opacity-40 stroke-[3px]" />
                </div>
                <div className="p-3 text-center">
                  <Check
                    size={14}
                    className="mx-auto text-accent stroke-[3px]"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Comparison Table Footer */}
            <div className="p-5 bg-n100 border-t-2 border-ink font-mono text-[9px] text-n500 uppercase tracking-widest flex flex-col items-center gap-3 text-center">
              <span>
                ALREADY HAVE AN ACCOUNT?{" "}
                <Link
                  href="/dashboard"
                  className="text-ink font-black hover:underline hover:text-accent transition-colors"
                >
                  SIGN IN
                </Link>
              </span>
              <span className="flex items-center gap-1.5 font-black text-ink">
                ● SECURE PAYMENTS POWERED BY PAYPAL
              </span>
            </div>
          </div>

          {/* ─── DESKTOP TABLE (hidden below md) ─── */}
          <div className="hidden md:block border-4 border-ink overflow-x-auto bg-bg max-w-4xl mx-auto shadow-heavy select-none">
            <table className="w-full min-w-[550px] text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-n100 border-b-2 border-ink font-mono text-[9px] uppercase tracking-[0.15em] text-n500 font-bold">
                  <th className="p-4 w-1/2">FEATURE / SPECIFICATION</th>
                  <th className="p-4 text-center w-1/4">FREE EDITION</th>
                  <th className="p-4 text-center w-1/4 text-accent font-black">
                    PRO
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-ink/10">
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-[0.15em] text-ink font-black border-y border-ink/10">
                  <td colSpan={3} className="p-3.5 pl-4 bg-n100/60 font-black">
                    SYSTEM CAPABILITIES
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Canvas Purification Engine
                    </div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                      Re-draws image pixels on sandboxed browser canvas to
                      destroy deep tracking signatures
                    </div>
                  </td>
                  <td className="p-4 text-center text-green-800">
                    <Check
                      size={16}
                      className="mx-auto text-green-700 stroke-[3px]"
                    />
                  </td>
                  <td className="p-4 text-center text-accent">
                    <Check
                      size={16}
                      className="mx-auto text-accent stroke-[3px]"
                    />
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Image Privacy Analyzer
                    </div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                      Inspects inbound EXIF, IPTC, XMP metadata structures and
                      tags before stripping
                    </div>
                  </td>
                  <td className="p-4 text-center text-green-800">
                    <Check
                      size={16}
                      className="mx-auto text-green-700 stroke-[3px]"
                    />
                  </td>
                  <td className="p-4 text-center text-accent">
                    <Check
                      size={16}
                      className="mx-auto text-accent stroke-[3px]"
                    />
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      C2PA Credentials Inspector
                    </div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                      Scans for JUMBF block signatures and cryptographically
                      signed provenance manifests
                    </div>
                  </td>
                  <td className="p-4 text-center text-green-800">
                    <Check
                      size={16}
                      className="mx-auto text-green-700 stroke-[3px]"
                    />
                  </td>
                  <td className="p-4 text-center text-accent">
                    <Check
                      size={16}
                      className="mx-auto text-accent stroke-[3px]"
                    />
                  </td>
                </tr>

                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-[0.15em] text-ink font-black border-y border-ink/10">
                  <td colSpan={3} className="p-3.5 pl-4 bg-n100/60 font-black">
                    USAGE &amp; ENTITLEMENTS
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Batch Processing Queue
                    </div>
                    <div className="text-[10px] text-n500 mt-0.5">
                      Process multiple files simultaneously in one drag-and-drop
                      batch
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2.5 py-1 font-mono text-[9px] font-bold text-n600">
                      1 AT ONCE
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-accent/10 border border-accent/30 text-accent px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm select-none">
                      50 AT ONCE
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Daily Purification Capacity
                    </div>
                    <div className="text-[10px] text-n500 mt-0.5">
                      Max processed images allowed per day
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2.5 py-1 font-mono text-[9px] font-bold text-n600">
                      5 / DAY
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-green-800/10 border border-green-800/30 text-green-800 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm select-none">
                      UNLIMITED
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Daily C2PA Scans</div>
                    <div className="text-[10px] text-n500 mt-0.5">
                      Max verified images via C2PA scanner per day
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2.5 py-1 font-mono text-[9px] font-bold text-n600">
                      5 / DAY
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-green-800/10 border border-green-800/30 text-green-800 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded-sm select-none">
                      UNLIMITED
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Max File Size Limit
                    </div>
                    <div className="text-[10px] text-n500 mt-0.5">
                      Maximum permitted binary upload size per individual image
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono text-[10px] text-n600 font-bold">
                    10 MB
                  </td>
                  <td className="p-4 text-center font-mono text-[10px] text-accent font-black border border-accent/20 bg-accent/2">
                    20 MB
                  </td>
                </tr>

                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-[0.15em] text-ink font-black border-y border-ink/10">
                  <td colSpan={3} className="p-3.5 pl-4 bg-n100/60 font-black">
                    SUPPORT &amp; EXPANSIONS
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Priority Developer Support
                    </div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                      Direct developer assistance and high-priority feature
                      requests (Clerk: priority_support)
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <X size={16} className="mx-auto opacity-40 stroke-[3px]" />
                  </td>
                  <td className="p-4 text-center">
                    <Check
                      size={16}
                      className="mx-auto text-accent stroke-[3px]"
                    />
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">
                      Future Tool Expansions
                    </div>
                    <div className="text-[10px] text-n500 mt-1 leading-normal italic">
                      Complementary early-adopters access to all future tool
                      expansions (e.g. spatial watermarks, DIFF sliders)
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <X size={16} className="mx-auto opacity-40 stroke-[3px]" />
                  </td>
                  <td className="p-4 text-center">
                    <Check
                      size={16}
                      className="mx-auto text-accent stroke-[3px]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="p-5 bg-n100 border-t-2 border-ink text-center font-mono text-[9px] text-n500 uppercase tracking-widest flex flex-col sm:flex-row justify-between items-center gap-4">
              <span>
                ALREADY HAVE AN ACCOUNT?{" "}
                <Link
                  href="/dashboard"
                  className="text-ink font-black hover:underline hover:text-accent transition-colors"
                >
                  SIGN IN
                </Link>
              </span>
              <span className="flex items-center gap-1.5 font-black text-ink">
                ● SECURE PAYMENTS POWERED BY PAYPAL
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
