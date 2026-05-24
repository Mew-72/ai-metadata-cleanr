"use client";

import React from "react";
import posthog from "posthog-js";
import { X } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { useAppAuth } from "../hooks/useAppAuth";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BillingModal({ isOpen, onClose }: BillingModalProps) {
  const { isSignedIn } = useAppAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-ink/75 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-bg border-4 border-ink w-full max-w-[480px] p-6 md:p-8 z-10 shadow-2xl transition-colors duration-255 select-none max-h-full overflow-y-auto">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-ink hover:text-accent cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="font-mono text-[10px] tracking-widest uppercase text-accent font-bold mb-1">
            ✦ Upgrade Required
          </div>
          <h3 className="font-serif text-3xl font-bold tracking-tight text-ink">
            Unlock Batch Cleaning
          </h3>
          <div className="h-1 bg-ink my-3 w-16 mx-auto" />
          <p className="font-body text-xs text-n500 max-w-sm mx-auto leading-relaxed">
            Free tier is limited to 1 image at a time. Upgrade to the Pro Tier to sanitize up to 50 images in a single batch, unlock ZIP exports, and support serverless metadata annihilation.
          </p>
        </div>

        {/* Pricing Cards inside Modal */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* Pro Monthly */}
          <div className="border border-ink p-5 bg-n100 relative group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[9px] tracking-widest uppercase text-n500 font-bold">Pro Monthly</span>
                <span className="bg-accent text-white font-mono text-[9px] font-bold px-2 py-0.5 tracking-wider">POPULAR</span>
              </div>
              <div className="font-serif text-3xl font-black text-ink mb-1">
                $5<span className="text-sm font-normal text-n500"> / month</span>
              </div>
              <p className="font-body text-[11px] text-n500 leading-snug">
                Batch processing up to 50 files. Dedicated local-first engine and priority offline ZIP exports. Cancel anytime.
              </p>
            </div>
            <div className="mt-4">
              {isSignedIn ? (
                <button
                  onClick={() => {
                    posthog.capture("upgrade_clicked", { plan: "pro" });
                    if (hasClerkKey) {
                      window.location.href = "/pricing";
                    } else {
                      alert("Billing gateway offline.");
                    }
                  }}
                  className="w-full bg-ink text-bg border-2 border-ink py-2 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors select-none"
                >
                  Upgrade to Pro
                </button>
              ) : (
                hasClerkKey ? (
                  <SignInButton mode="modal">
                    <button className="w-full bg-ink text-bg border-2 border-ink py-2 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors select-none">
                      Log In to Upgrade
                    </button>
                  </SignInButton>
                ) : (
                  <button 
                    onClick={() => alert("MVP mode: Auto-signed in.")}
                    className="w-full bg-ink text-bg border-2 border-ink py-2 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors select-none"
                  >
                    Log In to Upgrade
                  </button>
                )
              )}
            </div>
          </div>

          {/* Pro Annual Tier */}
          <div className="border border-ink p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[9px] tracking-widest uppercase text-n500">Pro Annual (Save 45%)</span>
              </div>
              <div className="font-serif text-3xl font-black text-ink mb-1">
                $33<span className="text-xs font-normal text-n500"> / year</span>
              </div>
              <p className="font-body text-[11px] text-n500 leading-snug">
                Get all Pro batch processing benefits at a heavy discount. Billed annually at $33, saving you $27 per year!
              </p>
            </div>

            <div className="mt-4">
              {isSignedIn ? (
                <button
                  onClick={() => {
                    posthog.capture("upgrade_clicked", { plan: "pro_annual" });
                    if (hasClerkKey) {
                      window.location.href = "/pricing";
                    } else {
                      alert("Billing gateway offline.");
                    }
                  }}
                  className="w-full border-2 border-ink text-ink bg-transparent py-2 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-ink hover:text-bg transition-colors select-none"
                >
                  Acquire Pro Annual
                </button>
              ) : (
                hasClerkKey ? (
                  <SignInButton mode="modal">
                    <button className="w-full border-2 border-ink text-ink bg-transparent py-2 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-ink hover:text-bg transition-colors select-none">
                      Log In to Purchase
                    </button>
                  </SignInButton>
                ) : (
                  <button 
                    onClick={() => alert("MVP mode: Auto-signed in.")}
                    className="w-full border-2 border-ink text-ink bg-transparent py-2 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-ink hover:text-bg transition-colors select-none"
                  >
                    Log In to Purchase
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center font-mono text-[9px] text-n400 uppercase tracking-widest">
          🔒 100% secure Checkout with Stripe & Clerk Billing
        </div>
      </div>
    </div>
  );
}
