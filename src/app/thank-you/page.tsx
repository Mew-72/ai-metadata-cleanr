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
  Shield,
  Zap,
  ExternalLink,
} from "lucide-react";

export default function ThankYouPage() {
  const { isPro, isLoaded } = useAppAuth();
  const router = useRouter();

  // Gate: redirect non-Pro users to pricing
  useEffect(() => {
    if (isLoaded && !isPro) {
      router.replace("/pricing");
    }
  }, [isLoaded, isPro, router]);

  useEffect(() => {
    if (isPro) {
      posthog.capture("pro_subscription_thankyou_viewed");
      // Notify any other tabs (e.g. the Workspace) that the user just upgraded
      // so their in-progress queue can flip to Pro entitlements without a reload.
      try {
        const bc = new BroadcastChannel("scrubai-auth");
        bc.postMessage({ type: "upgrade", at: Date.now() });
        bc.close();
      } catch {
        /* BroadcastChannel unsupported — safe to ignore. */
      }
    }
  }, [isPro]);

  // Show nothing while auth loads or if redirecting
  if (!isLoaded || !isPro) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink font-body transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink bg-bg select-none animate-fadeIn">
        {/* Hero Section */}
        <div className="border-b-4 border-ink">
          <div className="p-8 lg:p-16 text-center max-w-3xl mx-auto flex flex-col items-center">
            {/* Animated Sparkle Badge */}
            <div className="w-20 h-20 border-2 border-accent bg-accent/5 flex items-center justify-center mb-8 animate-pulse">
              <Sparkles size={36} className="text-accent" />
            </div>

            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent font-black mb-4 flex items-center gap-1.5">
              <span className="text-[6px]">●</span> MEMBERSHIP CONFIRMED
            </div>

            <h1 className="font-serif text-[42px] lg:text-[56px] font-black uppercase tracking-tight text-ink mb-6 leading-[0.95]">
              WELCOME TO <span className="text-accent">LIFETIME PRO</span>
            </h1>

            <div className="h-[3px] bg-ink w-20 mx-auto mb-6 double-border-bottom" />

            <p className="font-body text-[14px] md:text-[15px] text-n500 leading-relaxed max-w-xl mx-auto mb-4">
              Your payment has been processed securely through PayPal. All Pro
              features are now unlocked on your account for life — unlimited daily
              cleans, batch processing up to 50 images, ZIP exports, and
              priority support.
            </p>

            <p className="font-mono text-[9px] text-accent uppercase tracking-widest font-bold">
              ✦ Your session is live. Start scrubbing immediately.
            </p>
          </div>
        </div>

        {/* What&apos;s Unlocked Grid */}
        <div className="border-b-4 border-ink bg-n100/10">
          <div className="p-8 lg:p-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight text-ink">
                WHAT&apos;S NOW UNLOCKED
              </h2>
              <div className="h-[2px] bg-ink w-12 mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-ink divide-y md:divide-y-0 md:divide-x divide-ink">
              <div className="p-6 bg-bg flex flex-col items-center text-center">
                <Zap size={20} className="text-accent mb-3" />
                <div className="font-serif text-sm font-bold text-ink uppercase tracking-wide mb-1">
                  Unlimited Cleans
                </div>
                <p className="font-mono text-[9px] text-n500 uppercase tracking-wider leading-relaxed">
                  No more daily limits. Process as many images as you need,
                  every day.
                </p>
              </div>

              <div className="p-6 bg-bg flex flex-col items-center text-center">
                <Shield size={20} className="text-accent mb-3" />
                <div className="font-serif text-sm font-bold text-ink uppercase tracking-wide mb-1">
                  Batch Processing
                </div>
                <p className="font-mono text-[9px] text-n500 uppercase tracking-wider leading-relaxed">
                  Drag up to 50 images at once. Export everything as a single
                  ZIP.
                </p>
              </div>

              <div className="p-6 bg-bg flex flex-col items-center text-center">
                <Heart size={20} className="text-accent mb-3" />
                <div className="font-serif text-sm font-bold text-ink uppercase tracking-wide mb-1">
                  Priority Support
                </div>
                <p className="font-mono text-[9px] text-n500 uppercase tracking-wider leading-relaxed">
                  Direct developer assistance and early access to new features.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About the Creator */}
        <div className="border-b-4 border-ink">
          <div className="p-8 lg:p-12 max-w-3xl mx-auto">
            <div className="border-2 border-ink bg-n100/30 p-8 md:p-10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-ink/20">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent font-black flex items-center gap-1.5">
                  <span className="text-[6px]">●</span> A NOTE FROM THE
                  DEVELOPER
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <p className="font-body text-[13px] text-n500 leading-relaxed">
                  Hey — thank you for subscribing. Seriously. ScrubAI started as
                  a side project born out of frustration. I kept seeing creators
                  get their reach silently crushed on Instagram and Pinterest
                  because their AI-generated images carried C2PA provenance tags
                  and EXIF fingerprints that platforms use to suppress content.
                </p>

                <p className="font-body text-[13px] text-n500 leading-relaxed">
                  The existing &quot;metadata removers&quot; out there just
                  strip basic EXIF tags. They don&apos;t touch C2PA
                  cryptographic manifests, they don&apos;t re-draw pixels to
                  destroy embedded watermarks, and they certainly don&apos;t
                  inject safe camera profiles so your images blend in naturally.
                  ScrubAI does all of that — and it does it 100% in your
                  browser. Your images never touch a server.
                </p>

                <p className="font-body text-[13px] text-n500 leading-relaxed">
                  Your Pro purchase directly funds the continued development
                  of this tool. Every dollar goes toward new format support,
                  better detection engines, and keeping ScrubAI independent and
                  ad-free. No VC, no trackers harvesting your uploads, no
                  compromise.
                </p>

                <div className="flex items-center gap-4 mt-2 pt-4 border-t border-ink/15">
                  <div className="w-10 h-10 border border-ink bg-ink text-bg flex items-center justify-center font-mono text-sm font-bold uppercase">
                    M
                  </div>
                  <div>
                    <div className="font-serif text-sm font-bold text-ink">
                      Mayank
                    </div>
                    <div className="font-mono text-[9px] text-n500 uppercase tracking-wider">
                      Solo Developer · ScrubAI
                    </div>
                  </div>
                  <a
                    href="https://github.com/Mew-72"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto w-9 h-9 border border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-bg transition-all"
                    title="GitHub"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="p-8 lg:p-12 bg-bg">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-black uppercase tracking-tight text-ink">
                GET STARTED
              </h2>
              <div className="h-[2px] bg-accent w-12 mx-auto mt-2 mb-3" />
              <p className="font-mono text-[9px] text-n500 uppercase tracking-widest">
                Your Pro features are active right now
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/"
                className="bg-accent text-bg border-2 border-accent px-8 py-5 font-sans text-[11px] font-black tracking-widest uppercase text-center hover:bg-ink hover:border-ink hover:text-bg transition-colors duration-150 flex items-center justify-center gap-2.5 shadow-sm group"
              >
                <Sparkles size={14} className="group-hover:animate-pulse" />
                Go to Workspace
                <ArrowRight size={12} />
              </Link>

              <Link
                href="/dashboard"
                className="bg-ink text-bg border-2 border-ink px-8 py-5 font-sans text-[11px] font-black tracking-widest uppercase text-center hover:bg-accent hover:border-accent hover:text-bg transition-colors duration-150 flex items-center justify-center gap-2.5 shadow-sm"
              >
                <LayoutDashboard size={14} />
                Open Dashboard
              </Link>
            </div>

            <div className="text-center mt-6 font-mono text-[9px] text-n400 uppercase tracking-widest">
              🔒 Order processed securely via PayPal · Lifetime Pro Membership
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
