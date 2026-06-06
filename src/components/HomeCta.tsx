"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAppAuth } from "../hooks/useAppAuth";
import { PRICING } from "../config/pricing";

export function HomeCta() {
  const { isPro } = useAppAuth();

  if (isPro) return null;

  return (
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
  );
}
