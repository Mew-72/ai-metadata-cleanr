"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PRICING } from "../config/pricing";

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

export function HomeFaq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (i: number) => setActiveFaq(activeFaq === i ? null : i);

  return (
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
  );
}
