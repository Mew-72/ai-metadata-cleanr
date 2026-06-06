"use client";

import React, { useEffect } from "react";
import posthog from "posthog-js";
import { X, Sparkles, Check } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { useAppAuth } from "../hooks/useAppAuth";
import { PRICING } from "../config/pricing";

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const { isSignedIn, isPro, refreshAuth } = useAppAuth();

  useEffect(() => {
    if (!isOpen) return;
    refreshAuth();
  }, [isOpen, refreshAuth]);

  useEffect(() => {
    if (isOpen && isPro) onClose();
  }, [isOpen, isPro, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative surface-card w-full max-w-[460px] p-7 lg:p-8 z-10 animate-scaleUp max-h-full overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-md text-n400 hover:text-ink hover:bg-n100 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1 font-sans text-[12px] font-medium mb-3">
            <Sparkles size={12} strokeWidth={2.4} />
            Upgrade required
          </span>
          <h3 className="font-sans text-[22px] font-semibold tracking-tight text-ink mb-1.5">
            Unlock batch cleaning
          </h3>
          <p className="font-sans text-[13.5px] text-n500 leading-relaxed">
            Free tier handles one image at a time. Lifetime Pro unlocks batches
            of 50, ZIP exports, and unlimited daily cleans.
          </p>
        </div>

        <div className="rounded-xl border border-accent/30 bg-accent-soft/40 p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[12px] uppercase tracking-wider text-accent font-medium">
              Lifetime Pro
            </span>
            <span className="pill pill-accent">Pay once</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-sans text-[32px] font-semibold tracking-tight text-ink">
              {PRICING.displayPrice}
            </span>
            <span className="font-sans text-[13px] text-n500">one-time</span>
          </div>
          <ul className="flex flex-col gap-2 mb-1">
            {[
              "Up to 50 images per batch",
              "Unlimited cleans &amp; C2PA scans",
              "ZIP exports",
              "All future tools included",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 font-sans text-[13px] text-n700"
              >
                <Check
                  size={13}
                  className="text-accent mt-0.5 shrink-0"
                  strokeWidth={2.5}
                />
                <span dangerouslySetInnerHTML={{ __html: f }} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-2.5">
          {isSignedIn ? (
            <button
              onClick={() => {
                posthog.capture("upgrade_clicked", { plan: "lifetime_pro" });
                window.location.href = "/pricing";
              }}
              className="btn-accent w-full"
            >
              Get Lifetime Pro · {PRICING.displayPrice}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="btn-accent w-full">Sign in to upgrade</button>
            </SignInButton>
          )}
          <button onClick={onClose} className="btn-secondary w-full">
            Maybe later
          </button>
        </div>

        <p className="font-sans text-[11.5px] text-n500 text-center mt-4">
          Secure checkout via PayPal · No subscription
        </p>
      </div>
    </div>
  );
}
