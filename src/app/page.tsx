"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CleanerInterface } from "../components/CleanerInterface";
import { useAppAuth } from "../hooks/useAppAuth";
import {
  Lock,
  Layers,
  Fingerprint,
  Zap,
  Eye,
  ShieldCheck,
  Plus,
  ArrowRight,
} from "lucide-react";
import { PRICING } from "../config/pricing";

/**
 * v2 home - workspace-first, full-bleed.
 *
 * The workspace IS the page. Trust strip is a single line above it
 * (and only shows for non-Pro visitors). All marketing content lives
 * below the fold.
 */
export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const { isPro } = useAppAuth();

  const toggleFaq = (i: number) => setActiveFaq(activeFaq === i ? null : i);

  const faqs = [
    {
      q: "How does browser-only metadata removal work?",
      a: "When you load an image, ScrubAI draws its raw pixels onto an invisible HTML5 canvas, then re-exports those pixels as a brand-new file. Because the export is built from scratch, it carries none of the original EXIF, XMP, IPTC, or cryptographically signed C2PA credentials.",
    },
    {
      q: "Does this affect image quality?",
      a: "No. ScrubAI processes images in your browser's sandbox at a 95% quality threshold, preserving sharp edges and pixel-perfect detail. You get a clean export, not a degraded one.",
    },
    {
      q: "Does it remove 'Made with AI' tags and C2PA Content Credentials?",
      a: "Yes. Platforms like Instagram, Facebook, and Pinterest read image headers for software signatures, AI generation markers, and signed C2PA / JUMBF credentials. Pixel redraw rebuilds the file from scratch, so those embedded markers don't make it into the export.",
    },
    {
      q: "Are my images uploaded anywhere?",
      a: "Never. ScrubAI is a 100% local tool. Your files don't leave your device. All canvas work, EXIF parsing, and ZIP packaging runs inside your browser sandbox.",
    },
    {
      q: "Is Lifetime Pro really one-time?",
      a: `Yes. Lifetime Pro is a one-time ${PRICING.displayPrice} payment via PayPal. No monthly fees, no auto-renew. It unlocks batch processing up to 50 files, ZIP exports, and priority support - for life.`,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      {/* ═════ WORKSPACE (THE HERO) ═════════════════════════════════ */}
      <section className="relative w-full hero-gradient">
        <div className="max-w-[1440px] mx-auto w-full px-3 sm:px-5 lg:px-6 pt-5 lg:pt-7 pb-12 lg:pb-16">
          {/* Trust strip - hidden for Pro users (no daily limit applies) */}
          {!isPro && (
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-4 lg:mb-5">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-medium">100% in your browser</span>
              </span>
              <span className="hidden sm:inline text-n300">·</span>
              <span className="text-[12.5px] text-n500">No uploads, ever</span>
              <span className="hidden sm:inline text-n300">·</span>
              <span className="text-[12.5px] text-n500">No account to start</span>
              <span className="hidden sm:inline text-n300">·</span>
              <span className="text-[12.5px] text-n500">Free up to 5 images / day</span>
            </div>
          )}
          {isPro && (
            <div className="flex justify-center mb-4 lg:mb-5">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="font-medium">Pro · Unlimited cleans, batch up to 50</span>
              </span>
            </div>
          )}

          {/* Workspace surface */}
          <div className="surface-card overflow-hidden">
            <CleanerInterface />
          </div>

          {/* One-line caption underneath */}
          <p className="mt-5 text-center font-sans text-[13.5px] text-n500 max-w-3xl mx-auto leading-relaxed">
            Strips EXIF, GPS, IPTC, XMP, and C2PA Content Credentials by redrawing
            your photos pixel-by-pixel. Nothing leaves your device.
          </p>
        </div>
      </section>

      {/* ═════ HOW IT WORKS ════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="w-full bg-surface border-y border-muted-border"
      >
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-2 font-medium">
              How it works
            </div>
            <h2 className="font-sans text-[26px] lg:text-[34px] font-semibold tracking-tight text-ink">
              Three steps. No servers involved.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
            {[
              {
                step: "01",
                title: "Drop your image",
                body: "JPEG, PNG, WebP, AVIF, or HEIC from your phone. Up to 10 MB free, 20 MB on Pro.",
              },
              {
                step: "02",
                title: "We redraw the pixels",
                body: "An invisible HTML5 canvas renders raw RGB data. EXIF, GPS, XMP, JUMBF, C2PA - all of it lives in the file structure, not the pixels.",
              },
              {
                step: "03",
                title: "Download the clean file",
                body: "A fresh export at 95% quality. Bit-for-bit free of the original metadata.",
              },
            ].map((s) => (
              <div key={s.step} className="card-soft p-6">
                <div className="font-mono text-[12px] text-accent font-medium mb-3">
                  {s.step}
                </div>
                <h3 className="font-sans text-[16px] font-semibold tracking-tight text-ink mb-2">
                  {s.title}
                </h3>
                <p className="font-sans text-[13.5px] leading-relaxed text-n500">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════ FEATURES ════════════════════════════════════════════ */}
      <section id="features" className="w-full bg-bg">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-xl mb-10 lg:mb-14">
            <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-2 font-medium">
              Features
            </div>
            <h2 className="font-sans text-[26px] lg:text-[36px] font-semibold tracking-tight text-ink mb-3">
              Everything you can strip from a photo.
            </h2>
            <p className="font-sans text-[14.5px] lg:text-[15.5px] text-n500 leading-relaxed">
              Modern image files carry far more than the picture itself. ScrubAI
              removes the parts you didn't put there yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[
              {
                icon: Lock,
                title: "100% client-side",
                body: "Image bytes never go over the network. The canvas pipeline runs entirely inside your browser sandbox.",
              },
              {
                icon: Layers,
                title: "Pixel redraw, not tag deletion",
                body: "Most tools strip EXIF headers and stop. ScrubAI rebuilds the file from raw pixels, so JUMBF blocks and signed C2PA chains are gone too.",
              },
              {
                icon: Fingerprint,
                title: "C2PA & 'Made with AI' tags",
                body: "Cryptographically signed Content Credentials embedded by Adobe, OpenAI, and Midjourney are removed at the source.",
              },
              {
                icon: Zap,
                title: "Batch up to 50 images",
                body: "Pro users drag in queues, run them through the cleaner in one pass, and download a single ZIP. Built for workflows.",
              },
              {
                icon: Eye,
                title: "Live metadata inspector",
                body: "See exactly what's in your file before stripping it. EXIF, IPTC, XMP, and C2PA structures surfaced in plain language.",
              },
              {
                icon: ShieldCheck,
                title: "Zero telemetry on content",
                body: "We track UI events to improve the product. We never log image bytes, filenames, or extracted metadata. Period.",
              },
            ].map((f) => (
              <div key={f.title} className="card-soft p-6">
                <span className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-3.5">
                  <f.icon size={17} strokeWidth={2} />
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

      {/* ═════ FAQ ═════════════════════════════════════════════════ */}
      <section id="faq" className="w-full bg-surface border-y border-muted-border">
        <div className="max-w-[860px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-10">
            <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-2 font-medium">
              FAQ
            </div>
            <h2 className="font-sans text-[26px] lg:text-[32px] font-semibold tracking-tight text-ink">
              Frequently asked questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => {
              const open = activeFaq === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border bg-bg transition-colors ${open ? "border-n300 bg-surface" : "border-muted-border"
                    }`}
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                    aria-expanded={open}
                  >
                    <span className="font-sans text-[14.5px] font-medium text-ink">
                      {f.q}
                    </span>
                    <span
                      className={`w-7 h-7 rounded-full bg-n100 text-n600 flex items-center justify-center shrink-0 transition-transform ${open ? "rotate-45" : ""
                        }`}
                    >
                      <Plus size={14} strokeWidth={2.2} />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 font-sans text-[13.5px] leading-relaxed text-n600">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═════ CTA ════════════════════════════════════════════════ */}
      {!isPro && (
        <section className="w-full bg-bg">
          <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <div className="surface-card p-10 lg:p-12 text-center hero-gradient">
              <h2 className="font-sans text-[24px] lg:text-[30px] font-semibold tracking-tight text-ink mb-3">
                Need to clean a whole batch?
              </h2>
              <p className="font-sans text-[14.5px] text-n500 max-w-lg mx-auto mb-7">
                Lifetime Pro unlocks 50 images per batch, unlimited daily cleans,
                and ZIP exports. One-time {PRICING.displayPrice}. No subscription.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/pricing" className="btn-accent">
                  See pricing
                  <ArrowRight size={14} strokeWidth={2.2} />
                </Link>
                <Link href="/about" className="btn-secondary">
                  Why we built this
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
