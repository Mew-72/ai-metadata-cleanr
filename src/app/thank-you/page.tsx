"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useAppAuth } from "../../hooks/useAppAuth";
import posthog from "posthog-js";
import {
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Heart,
  Zap,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

export default function ThankYouPage() {
  const { isPro, isLoaded } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isPro) {
      router.replace("/pricing");
    }
  }, [isLoaded, isPro, router]);

  useEffect(() => {
    if (isPro) {
      posthog.capture("pro_subscription_thankyou_viewed");
      try {
        const bc = new BroadcastChannel("scrubai-auth");
        bc.postMessage({ type: "upgrade", at: Date.now() });
        bc.close();
      } catch {
        /* BroadcastChannel unsupported — safe to ignore. */
      }
    }
  }, [isPro]);

  if (!isLoaded || !isPro) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="relative w-full hero-gradient">
          <div className="max-w-[820px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-12 lg:pb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent-soft px-3 py-1 text-[12px] font-medium text-accent mb-6">
              <Sparkles size={12} strokeWidth={2.4} />
              Lifetime Pro · Confirmed
            </div>

            <h1 className="font-sans text-[36px] sm:text-[44px] lg:text-[56px] font-semibold tracking-tight leading-[1.05] text-ink mb-5">
              Welcome to{" "}
              <span className="text-accent">Lifetime Pro.</span>
            </h1>

            <p className="font-sans text-[15px] lg:text-[16px] text-n500 leading-relaxed max-w-xl mx-auto">
              Your payment was processed by PayPal and Pro features are unlocked
              on your account for life. Unlimited cleans, batches up to 50 images,
              ZIP exports, and every future tool we ship.
            </p>
          </div>
        </section>

        {/* What's unlocked */}
        <section className="w-full bg-surface border-y border-muted-border">
          <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-2 font-medium">
                What&apos;s unlocked
              </div>
              <h2 className="font-sans text-[26px] lg:text-[32px] font-semibold tracking-tight text-ink">
                Everything in one upgrade.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {[
                {
                  icon: Zap,
                  title: "Unlimited cleans",
                  body: "No daily caps. Process as many images as you need.",
                },
                {
                  icon: ShieldCheck,
                  title: "Batch processing",
                  body: "Drag up to 50 images per batch. Download the result as a single ZIP.",
                },
                {
                  icon: Heart,
                  title: "Priority support",
                  body: "Direct developer help and early access to new tools.",
                },
              ].map((f) => (
                <div key={f.title} className="card-soft p-6">
                  <span className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-3.5">
                    <f.icon size={18} strokeWidth={2} />
                  </span>
                  <h3 className="font-sans text-[15.5px] font-semibold tracking-tight text-ink mb-1.5">
                    {f.title}
                  </h3>
                  <p className="font-sans text-[13.5px] leading-relaxed text-n500">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Note from the dev */}
        <section className="w-full bg-bg">
          <div className="max-w-[820px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
            <div className="surface-card p-7 lg:p-10">
              <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3 font-medium">
                A note from the developer
              </div>

              <div className="flex flex-col gap-4">
                <p className="font-sans text-[14.5px] text-n600 leading-relaxed">
                  Thank you for upgrading. ScrubAI started as a side project
                  born out of frustration. I kept seeing creators get their
                  reach silently crushed on Instagram and Pinterest because
                  their AI-generated images carried C2PA provenance tags and
                  EXIF fingerprints platforms use to suppress content.
                </p>
                <p className="font-sans text-[14.5px] text-n600 leading-relaxed">
                  Most existing metadata removers just strip basic EXIF tags.
                  They don&apos;t touch C2PA cryptographic manifests, they
                  don&apos;t redraw pixels to disrupt embedded watermarks, and
                  they don&apos;t inject safe camera profiles so your images
                  blend in. ScrubAI does all of that, 100% in your browser.
                </p>
                <p className="font-sans text-[14.5px] text-n600 leading-relaxed">
                  Your purchase funds continued development. Every dollar goes
                  toward new format support, better detection engines, and
                  keeping ScrubAI independent and ad-free. No VC, no trackers
                  on your uploads, no compromise.
                </p>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-muted-border">
                <div className="w-10 h-10 rounded-full bg-ink text-bg flex items-center justify-center font-sans text-[14px] font-semibold">
                  M
                </div>
                <div>
                  <div className="font-sans text-[14px] font-semibold text-ink">
                    Mayank
                  </div>
                  <div className="font-sans text-[12px] text-n500">
                    Solo developer · ScrubAI
                  </div>
                </div>
                <a
                  href="https://github.com/Mew-72"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto w-9 h-9 rounded-md border border-muted-border bg-bg flex items-center justify-center text-n500 hover:bg-ink hover:text-bg hover:border-ink transition-colors"
                  title="GitHub"
                  aria-label="Visit GitHub"
                >
                  <ExternalLink size={14} strokeWidth={2.2} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full bg-bg">
          <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
            <div className="surface-card p-8 lg:p-12 text-center hero-gradient">
              <h2 className="font-sans text-[26px] lg:text-[32px] font-semibold tracking-tight text-ink mb-2">
                Pro features are live.
              </h2>
              <p className="font-sans text-[14.5px] text-n500 max-w-lg mx-auto mb-7">
                Jump back into the workspace or open your dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <Link href="/" className="btn-accent">
                  <Sparkles size={13} strokeWidth={2.2} />
                  Go to workspace
                  <ArrowRight size={13} strokeWidth={2.2} />
                </Link>
                <Link href="/dashboard" className="btn-secondary">
                  <LayoutDashboard size={13} strokeWidth={2.2} />
                  Open dashboard
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
