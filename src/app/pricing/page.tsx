"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Ticker } from "../../components/Ticker";
import { 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Lock, 
  CreditCard,
  HelpCircle
} from "lucide-react";
import { useAppAuth } from "../../hooks/useAppAuth";

export default function PricingPage() {
  const { isSignedIn } = useAppAuth();

  const handleSimulateUpgrade = () => {
    alert("✓ Subscription simulation initialized. To upgrade or manage your tier in MVP mode, please visit your Profile Dashboard.");
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink font-body transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink bg-bg select-none">
        
        {/* Editorial Title Section */}
        <div className="p-8 lg:p-12 border-b border-ink text-center max-w-4xl mx-auto">
          <div className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold mb-2">
            ✦ ScrubAI Subscription Catalog
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl font-black uppercase tracking-tight text-ink mb-4 leading-none">
            Choose Your <span className="text-accent">Edition</span>
          </h1>
          <p className="font-body text-[14px] text-n500 leading-relaxed max-w-xl mx-auto">
            Maintain complete control of your creative metadata and bypass digital suppressions. Tiers are integrated securely with Clerk Authentication and Stripe Checkout.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-ink border-b border-ink bg-n100">
          
          {/* Card 1: Free Plan */}
          <div className="p-8 bg-bg flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-n400 font-bold mb-1.5">
                Standard Circulation
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase text-ink">
                Free Edition
              </h3>
              <div className="h-1 bg-ink my-3.5 w-12" />
              <div className="font-serif text-4xl font-black text-ink mb-4">
                $0<span className="text-sm font-normal text-n500"> / month</span>
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed">
                Standard local metadata analysis and single-file canvas purification engine. Recommended for hobbyist creators and single uploads.
              </p>
            </div>

            <div className="mt-8">
              <Link 
                href="/" 
                className="w-full block bg-n100 text-ink border-2 border-ink py-3 font-sans text-[10px] font-bold tracking-widest uppercase text-center hover:bg-ink hover:text-bg transition-colors"
              >
                Go to Workspace
              </Link>
              <div className="text-center font-mono text-[8px] text-n400 uppercase tracking-wider mt-2.5">
                No credit card required
              </div>
            </div>
          </div>

          {/* Card 2: Pro Plan */}
          <div className="p-8 bg-bg flex flex-col justify-between min-h-[420px] relative">
            <div className="absolute top-8 right-8 bg-accent text-white font-mono text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase">
              POPULAR
            </div>
            
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold mb-1.5">
                ✦ High Frequency
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase text-ink">
                Pro Monthly
              </h3>
              <div className="h-1 bg-accent my-3.5 w-12" />
              <div className="font-serif text-4xl font-black text-ink mb-4">
                $5<span className="text-sm font-normal text-n500"> / month</span>
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed">
                Unlock advanced batch metadata stripping, multiple simultaneous file queues, absolute ZIP exports, and camera profile footprints to fully bypass tracking databases.
              </p>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleSimulateUpgrade}
                className="w-full bg-ink text-bg border-2 border-ink py-3 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-colors"
              >
                Upgrade to Pro
              </button>
              <div className="text-center font-mono text-[8px] text-n400 uppercase tracking-wider mt-2.5">
                Secure checkout with Stripe
              </div>
            </div>
          </div>

          {/* Card 3: Lifetime Plan */}
          <div className="p-8 bg-bg flex flex-col justify-between min-h-[420px]">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-n400 font-bold mb-1.5">
                Infinite Access
              </div>
              <h3 className="font-serif text-2xl font-bold uppercase text-ink">
                Lifetime Pass
              </h3>
              <div className="h-1 bg-ink my-3.5 w-12" />
              <div className="font-serif text-4xl font-black text-ink mb-4">
                $20<span className="text-xs font-normal text-n500"> one-time</span>
              </div>
              <p className="font-body text-xs text-n500 leading-relaxed">
                Complete unrestricted digital ownership. Access all present and future local processing engines, custom camera presets, and premium canvas updates forever.
              </p>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleSimulateUpgrade}
                className="w-full border-2 border-ink text-ink bg-transparent py-3 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-ink hover:text-bg transition-colors"
              >
                Acquire Lifetime
              </button>
              <div className="text-center font-mono text-[8px] text-n400 uppercase tracking-wider mt-2.5">
                Billed once, valid forever
              </div>
            </div>
          </div>

        </div>

        {/* Feature Comparison Table Section (From User's Reference Image) */}
        <div className="p-8 lg:p-12 bg-bg border-t border-ink">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-black uppercase tracking-tight text-ink">
              Full Feature Comparison
            </h2>
            <div className="h-1 bg-ink my-3 w-16 mx-auto" />
            <p className="font-mono text-[9px] text-n500 uppercase tracking-wider">
              Line-by-line detailed technical matrix
            </p>
          </div>

          <div className="border border-ink overflow-hidden bg-bg max-w-4xl mx-auto shadow-sm">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-n100 border-b border-ink font-mono text-[9px] uppercase tracking-wider text-n500">
                  <th className="p-4 w-1/2">Feature</th>
                  <th className="p-4 text-center w-1/4">Free</th>
                  <th className="p-4 text-center w-1/4 text-accent font-bold">Pro</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-ink/10">
                {/* CATEGORY 1: TOOLS INCLUDED */}
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-widest text-n500 font-bold">
                  <td colSpan={3} className="p-3 bg-n100/60 border-y border-ink/10 pl-4">
                    Tools Included
                  </td>
                </tr>
                
                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Privacy Analyzer</div>
                    <div className="text-[10px] text-n500 mt-0.5">EXIF extraction, JUMBF metadata claims, risk alerts & color space markers</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Content Credentials Checker</div>
                    <div className="text-[10px] text-n500 mt-0.5">Decrypt JUMBF blocks, signatures verification, certificate trust metrics & raw manifest code blocks</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Diff Tool</div>
                    <div className="text-[10px] text-n500 mt-0.5">Side-by-side or slider pixel grid analysis to confirm spatial equivalence</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Invisible Watermark</div>
                    <div className="text-[10px] text-n500 mt-0.5">Embed & inspect robust spatial-frequency watermarks (DWT-DCT steganography)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Format Converter</div>
                    <div className="text-[10px] text-n500 mt-0.5">Convert between 10+ standard photography and web-optimized formats (HEIC, WebP, AVIF...)</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Image Resizer & Compressor</div>
                    <div className="text-[10px] text-n500 mt-0.5">Downscale pixels, set custom quality factors, and enforce resolution profiles</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Batch EXIF Editor</div>
                    <div className="text-[10px] text-n500 mt-0.5">Batch edit metadata, customize camera make/model profiles, and strip tags</div>
                  </td>
                  <td className="p-4 text-center text-green-800"><Check size={16} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>

                {/* CATEGORY 2: USAGE & LIMITS */}
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-widest text-n500 font-bold">
                  <td colSpan={3} className="p-3 bg-n100/60 border-y border-ink/10 pl-4">
                    Usage & Limits
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Daily usage limit</div>
                    <div className="text-[10px] text-n500 mt-0.5">Max processed images allowed per 24 hours</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2 py-0.5 font-mono text-[9px] font-bold text-n600">10 / DAY</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-green-800/10 border border-green-800/30 text-green-800 px-2 py-0.5 font-mono text-[9px] font-bold">UNLIMITED</span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Batch processing</div>
                    <div className="text-[10px] text-n500 mt-0.5">Number of images purified simultaneously in one drag-drop action</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-n100 border border-ink/20 px-2 py-0.5 font-mono text-[9px] font-bold text-n600">5 AT ONCE</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 font-mono text-[9px] font-bold">10 AT ONCE</span>
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Max file size</div>
                    <div className="text-[10px] text-n500 mt-0.5">Maximum permitted size per individual image upload</div>
                  </td>
                  <td className="p-4 text-center font-mono text-[10px] text-n600 font-bold">10 MB</td>
                  <td className="p-4 text-center font-mono text-[10px] text-accent font-bold border border-accent/20 bg-accent/2">20 MB</td>
                </tr>

                {/* CATEGORY 3: SUPPORT */}
                <tr className="bg-n100/50 font-mono text-[9px] uppercase tracking-widest text-n500 font-bold">
                  <td colSpan={3} className="p-3 bg-n100/60 border-y border-ink/10 pl-4">
                    Support
                  </td>
                </tr>

                <tr className="hover:bg-n100/30">
                  <td className="p-4">
                    <div className="font-bold text-ink">Priority support</div>
                    <div className="text-[10px] text-n500 mt-0.5">Direct developer assistance & high-priority feature requests queue</div>
                  </td>
                  <td className="p-4 text-center text-n400"><X size={14} className="mx-auto" /></td>
                  <td className="p-4 text-center text-accent"><Check size={16} className="mx-auto" /></td>
                </tr>
              </tbody>
            </table>
            
            {/* Table Footer */}
            <div className="p-4 bg-n100 border-t border-ink text-center font-mono text-[9px] text-n500 uppercase tracking-wider flex flex-col sm:flex-row justify-between items-center gap-2">
              <span>Already have an account? <Link href="/dashboard" className="text-ink font-bold hover:underline">Sign in</Link></span>
              <span className="flex items-center gap-1 font-bold text-ink">
                🔒 SECURE PAYMENTS POWERED BY STRIPE
              </span>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
