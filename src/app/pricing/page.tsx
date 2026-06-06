"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Check, X, ArrowRight } from "lucide-react";
import { useAppAuth } from "../../hooks/useAppAuth";
import { SignInButton } from "@clerk/nextjs";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PRICING } from "../../config/pricing";

interface Row {
  label: string;
  hint?: string;
  free: React.ReactNode;
  pro: React.ReactNode;
}

interface Group {
  title: string;
  rows: Row[];
}

const yes = <Check size={15} className="mx-auto text-emerald-600" strokeWidth={2.5} />;
const no = <X size={15} className="mx-auto text-n400" strokeWidth={2.5} />;
const tag = (text: string, tone: "neutral" | "accent" | "success" = "neutral") => {
  const cls =
    tone === "accent"
      ? "bg-accent-soft text-accent"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-n100 text-n600";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 font-mono text-[11px] font-medium ${cls}`}
    >
      {text}
    </span>
  );
};

const COMPARISON: Group[] = [
  {
    title: "Core engine",
    rows: [
      {
        label: "Canvas pixel redraw",
        hint: "Re-draws image pixels on a sandboxed canvas to destroy deep tracking signatures",
        free: yes,
        pro: yes,
      },
      {
        label: "Metadata inspector",
        hint: "Surfaces EXIF, IPTC, XMP structures before stripping",
        free: yes,
        pro: yes,
      },
      {
        label: "C2PA / JUMBF detection",
        hint: "Spots cryptographically signed Content Credentials",
        free: yes,
        pro: yes,
      },
    ],
  },
  {
    title: "Limits",
    rows: [
      {
        label: "Batch queue",
        hint: "Process multiple files in one drag-and-drop",
        free: tag("1 at a time"),
        pro: tag("50 at once", "accent"),
      },
      {
        label: "Daily cleans",
        hint: "Images cleaned per day",
        free: tag("5 / day"),
        pro: tag("Unlimited", "success"),
      },
      {
        label: "Daily C2PA scans",
        hint: "Verified images via the C2PA scanner per day",
        free: tag("5 / day"),
        pro: tag("Unlimited", "success"),
      },
      {
        label: "Max file size",
        hint: "Per individual image",
        free: tag("10 MB"),
        pro: tag("20 MB", "accent"),
      },
    ],
  },
  {
    title: "Support & extras",
    rows: [
      {
        label: "Priority support",
        hint: "Direct help and high-priority feature requests",
        free: no,
        pro: yes,
      },
      {
        label: "Future tools",
        hint: "Early access to every new tool we ship",
        free: no,
        pro: yes,
      },
    ],
  },
];

export default function PricingPage() {
  const { isSignedIn, isPro, isLoaded } = useAppAuth();

  useEffect(() => {
    posthog.capture("pricing_page_viewed");
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <main className="flex-1 w-full">
        {/* ── HEADER ─────────────────────────────────────── */}
        <section className="hero-gradient">
          <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-12 lg:pb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-muted-border bg-bg px-3 py-1 text-[12px] font-medium text-n600 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              Lifetime access — no subscriptions
            </div>
            <h1 className="font-sans text-[40px] sm:text-[52px] lg:text-[60px] font-semibold tracking-tight leading-[1.05] text-ink mb-5">
              Pay once.{" "}
              <span className="text-n400">Use forever.</span>
            </h1>
            <p className="font-sans text-[16px] lg:text-[17px] text-n500 max-w-xl mx-auto leading-relaxed">
              Start free with single-image cleaning. Upgrade once for batch
              processing, ZIP exports, and every future tool we build —
              with no recurring charges.
            </p>
          </div>
        </section>

        {/* ── PLAN CARDS ─────────────────────────────────── */}
        <section className="w-full">
          <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Free */}
              <div className="card-soft p-8 lg:p-10 flex flex-col">
                <div className="font-sans text-[12px] uppercase tracking-wider text-n500 mb-3">
                  Free
                </div>
                <div className="mb-1">
                  <span className="font-sans text-[44px] font-semibold tracking-tight text-ink">$0</span>
                  <span className="font-sans text-[14px] text-n500 ml-2">/ forever</span>
                </div>
                <p className="font-sans text-[14px] text-n500 leading-relaxed mb-7 mt-2">
                  Single-image metadata removal for hobbyists and one-off cleans.
                  No account needed to start.
                </p>

                <ul className="flex flex-col gap-2.5 mb-8">
                  {[
                    "1 image at a time",
                    "5 cleans per day",
                    "5 C2PA scans per day",
                    "10 MB max file size",
                    "EXIF, GPS, IPTC, XMP, C2PA stripping",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-n600">
                      <Check size={14} className="text-emerald-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                  {["Batch processing", "Priority support", "All future tools"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-n400 line-through">
                      <X size={14} className="text-n300 mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/#workspace"
                  className="mt-auto inline-flex items-center justify-center gap-2 w-full rounded-lg border border-muted-border py-3 font-sans text-[14px] font-medium text-ink hover:bg-n100 transition-colors"
                >
                  Open the workspace
                  <ArrowRight size={14} strokeWidth={2.2} />
                </Link>
                <p className="font-sans text-[12px] text-n500 text-center mt-3">
                  No credit card. No sign-up.
                </p>
              </div>

              {/* Pro */}
              <div className="relative card-soft p-8 lg:p-10 flex flex-col border-accent/40 shadow-[0_24px_60px_-30px_rgba(225,29,72,0.35)]">
                <div className="absolute -top-3 right-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent text-white px-3 py-1 font-sans text-[11px] font-semibold">
                    Lifetime
                  </span>
                </div>

                <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3">
                  Pro
                </div>
                <div className="mb-1">
                  <span className="font-sans text-[44px] font-semibold tracking-tight text-ink">
                    {PRICING.displayPrice}
                  </span>
                  <span className="font-sans text-[14px] text-n500 ml-2">one-time</span>
                </div>
                <p className="font-sans text-[14px] text-n500 leading-relaxed mb-7 mt-2">
                  Built for creators with workflows. Batch up to 50 images,
                  unlimited daily cleans, ZIP exports, and every future tool —
                  for life.
                </p>

                <ul className="flex flex-col gap-2.5 mb-8">
                  {[
                    "Up to 50 images in one batch",
                    "Unlimited cleans & C2PA scans",
                    "20 MB max file size",
                    "ZIP exports",
                    "Priority support",
                    "All future tools included",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[14px] text-n700">
                      <Check size={14} className="text-accent mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  {!isLoaded ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-n100 text-n400 py-3 font-sans text-[14px] font-medium animate-pulse"
                    >
                      Loading…
                    </button>
                  ) : isPro ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 font-sans text-[14px] font-medium"
                    >
                      Lifetime Pro active
                    </button>
                  ) : isSignedIn ? (
                    !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                      <div className="w-full rounded-lg border border-muted-border py-3 px-3 text-center font-sans text-[13px] text-n500">
                        Checkout is temporarily unavailable. Please try again later.
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
                              height: 46,
                              shape: "rect",
                            }}
                            createOrder={async () => {
                              try {
                                const response = await fetch("/api/paypal/create-order", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                });
                                const data = await response.json();
                                if (!data.success) {
                                  throw new Error(data.error || "Failed to create order");
                                }
                                return data.orderId;
                              } catch (err) {
                                console.error("Error creating PayPal order:", err);
                                alert("Failed to initialize PayPal transaction. Please try again.");
                                throw err;
                              }
                            }}
                            onApprove={async (data) => {
                              try {
                                const response = await fetch("/api/paypal/capture-order", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ orderId: data.orderID }),
                                });
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
                                    (resData.error || "Unknown error. Please contact support."),
                                  );
                                }
                              } catch (err) {
                                console.error("Payment capture error:", err);
                                alert("An error occurred processing your payment. Please contact support.");
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
                    )
                  ) : (
                    <SignInButton mode="modal" signUpForceRedirectUrl="/pricing">
                      <button className="w-full rounded-lg bg-ink text-bg py-3 font-sans text-[14px] font-medium hover:bg-accent transition-colors cursor-pointer">
                        Sign in to upgrade
                      </button>
                    </SignInButton>
                  )}
                  <p className="font-sans text-[12px] text-n500 text-center mt-3">
                    Secure checkout via PayPal
                  </p>
                </div>
              </div>
            </div>

            {/* ── COMPARISON TABLE ─────────────────────── */}
            <div className="mt-20">
              <div className="text-center mb-10">
                <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3">
                  Plan comparison
                </div>
                <h2 className="font-sans text-[28px] lg:text-[36px] font-semibold tracking-tight text-ink">
                  Everything you get on each plan
                </h2>
              </div>

              {/* Desktop table */}
              <div className="hidden md:block card-soft overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-muted-border bg-surface">
                      <th className="px-5 py-4 font-sans text-[13px] font-medium text-n500 w-1/2">
                        Feature
                      </th>
                      <th className="px-5 py-4 text-center font-sans text-[13px] font-medium text-n500 w-1/4">
                        Free
                      </th>
                      <th className="px-5 py-4 text-center font-sans text-[13px] font-medium text-accent w-1/4">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((group) => (
                      <React.Fragment key={group.title}>
                        <tr className="border-y border-muted-border bg-n100/40">
                          <td
                            colSpan={3}
                            className="px-5 py-2.5 font-sans text-[12px] uppercase tracking-wider text-n500 font-medium"
                          >
                            {group.title}
                          </td>
                        </tr>
                        {group.rows.map((row, i) => (
                          <tr
                            key={row.label}
                            className={`${i < group.rows.length - 1 ? "border-b border-muted-border" : ""}`}
                          >
                            <td className="px-5 py-4 align-top">
                              <div className="font-sans text-[14px] font-medium text-ink">
                                {row.label}
                              </div>
                              {row.hint && (
                                <div className="font-sans text-[12px] text-n500 mt-1 leading-snug">
                                  {row.hint}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-center align-middle">{row.free}</td>
                            <td className="px-5 py-4 text-center align-middle">{row.pro}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-5">
                {COMPARISON.map((group) => (
                  <div key={group.title} className="card-soft overflow-hidden">
                    <div className="px-5 py-3 bg-surface border-b border-muted-border font-sans text-[12px] uppercase tracking-wider text-n500 font-medium">
                      {group.title}
                    </div>
                    {group.rows.map((row, i) => (
                      <div
                        key={row.label}
                        className={`px-5 py-4 ${i < group.rows.length - 1 ? "border-b border-muted-border" : ""}`}
                      >
                        <div className="font-sans text-[14px] font-medium text-ink">
                          {row.label}
                        </div>
                        {row.hint && (
                          <div className="font-sans text-[12px] text-n500 mt-1 leading-snug mb-3">
                            {row.hint}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="rounded-lg border border-muted-border bg-bg px-3 py-2 text-center">
                            <div className="font-sans text-[11px] text-n500 mb-1">Free</div>
                            <div>{row.free}</div>
                          </div>
                          <div className="rounded-lg border border-accent/30 bg-accent-soft px-3 py-2 text-center">
                            <div className="font-sans text-[11px] text-accent mb-1">Pro</div>
                            <div>{row.pro}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-10 text-center font-sans text-[13px] text-n500">
                Already have an account?{" "}
                <Link href="/dashboard" className="text-ink font-medium hover:text-accent transition-colors">
                  Open the dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
