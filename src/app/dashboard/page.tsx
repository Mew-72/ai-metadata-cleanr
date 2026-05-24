"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import { useAppAuth, useAppUser } from "../../hooks/useAppAuth";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { 
  ShieldCheck, 
  CreditCard, 
  User, 
  ArrowLeft,
  Sparkles,
  Zap,
  UserX,
  Lock,
  ExternalLink,
  ChevronRight,
  ScanEye,
  Eraser
} from "lucide-react";
import posthog from "posthog-js";

// ── Obfuscated Rate-Limit Storage (mirrors CleanerInterface logic) ──
const _RK = {
  a: atob("X19zY3JiX3g5X2Q="),
  b: atob("X19zY3JiX3g5X3Y="),
  c: atob("X19zY3JiX3g5X2g="),
};

const _salt = (): number => {
  const d = new Date();
  return ((d.getFullYear() * 397) ^ ((d.getMonth() + 1) * 53) ^ (d.getDate() * 31)) >>> 0;
};

const _decode = (encoded: string): number => {
  try {
    const s = _salt();
    const scrambled = Number(atob(encoded));
    if (isNaN(scrambled)) return 0;
    return ((scrambled ^ s) - 3) / 7;
  } catch { return 0; }
};

const _hash = (date: string, count: number): string => {
  const payload = `${date}|${count}|${_salt()}|scrb`;
  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
};

const getPersistedCleanCount = (): number => {
  if (typeof window === "undefined") return 0;
  const today = new Date().toLocaleDateString("en-CA");

  try {
    const storedDate = localStorage.getItem(_RK.a);
    if (storedDate !== today) return 0;

    const raw = localStorage.getItem(_RK.b);
    const storedHash = localStorage.getItem(_RK.c);
    if (raw) {
      const decoded = _decode(raw);
      if (storedHash === _hash(today, decoded) && decoded >= 0 && decoded <= 999) {
        return decoded;
      }
      return 5; // Tamper detected
    }
  } catch {}

  return 0;
};

const getPersistedC2paScanCount = (): number => {
  if (typeof window === "undefined") return 0;
  const today = new Date().toLocaleDateString("en-CA");
  let localCount = 0;
  let cookieCount = 0;

  try {
    const lastDate = localStorage.getItem("scrubai_c2pa_scanned_date");
    if (lastDate !== today) {
      localCount = 0;
    } else {
      const localVal = localStorage.getItem("scrubai_c2pa_scanned_count");
      if (localVal) localCount = parseInt(localVal, 10) || 0;
    }
  } catch {}

  try {
    const cookies = document.cookie.split(";");
    let lastDate = "";
    for (const c of cookies) {
      const [name, val] = c.trim().split("=");
      if (name === "scrubai_c2pa_scanned_date") lastDate = val;
      if (name === "scrubai_c2pa_scanned_count")
        cookieCount = parseInt(val, 10) || 0;
    }
    if (lastDate !== today) cookieCount = 0;
  } catch {}

  return Math.max(localCount, cookieCount);
};

export default function Dashboard() {
  const { user } = useAppUser();
  const { has } = useAppAuth();
  const { openUserProfile } = useClerk();
  
  const isPro = has ? (has({ plan: "pro" }) || has({ feature: "unlimited_daily" })) : false;
  const [activeTier, setActiveTier] = useState<"free" | "pro">("free");
  const [cleanCount, setCleanCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  // Track previous Pro state to detect fresh upgrades
  const prevIsPro = useRef(isPro);

  useEffect(() => {
    if (isPro) {
      setActiveTier("pro");
    } else {
      setActiveTier("free");
    }
  }, [isPro]);

  useEffect(() => {
    setCleanCount(getPersistedCleanCount());
    setScanCount(getPersistedC2paScanCount());
  }, []);

  // Log PostHog dashboard visit
  useEffect(() => {
    posthog.capture("viewed_dashboard", { tier: activeTier });
  }, [activeTier]);

  // Detect fresh upgrade via Clerk state change (secure — not URL param)
  useEffect(() => {
    if (isPro && !prevIsPro.current) {
      alert("✨ Payment Successful! Your session has been secured and Pro features are fully unlocked.");
    }
    prevIsPro.current = isPro;
  }, [isPro]);

  const cleanPercentage = Math.min((cleanCount / 5) * 100, 100);
  const scanPercentage = Math.min((scanCount / 5) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-bg transition-colors duration-200">
      {/* Navigation Header */}
      <Header />

      {/* Main Dashboard Workspace */}
      <main className="max-w-[1280px] mx-auto w-full border-x border-ink flex-1 grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-ink">
        
        {/* Left column: Sidebar navigation */}
        <aside className="p-8 bg-n100 lg:col-span-1 flex flex-col justify-between select-none">
          <div>
            <div className="flex items-center gap-2 mb-6 pb-2.5 border-b border-ink">
              <User size={18} className="text-accent" />
              <h3 className="font-serif text-xl font-bold tracking-tight text-ink">
                User Central
              </h3>
            </div>

            <div className="flex flex-col gap-3 font-mono text-[10px] tracking-wider uppercase text-n500 mb-6">
              <div>Logged In As:</div>
              <div className="font-sans text-xs font-bold text-ink truncate">
                {user?.primaryEmailAddress?.emailAddress || "user@creator.com"}
              </div>
              
              <div className="mt-2.5">Subscription Status:</div>
              <div className={`text-[9px] font-mono px-2.5 py-0.5 border border-ink self-start inline-block font-bold ${
                activeTier === "pro" ? "bg-accent text-white" : "bg-bg text-ink"
              }`}>
                {activeTier === "pro" ? "PRO MEMBER" : "FREE PLAN"}
              </div>
            </div>

            <hr className="border-t border-ink/15 my-6" />

            <div className="flex flex-col gap-2.5">
              <Link
                href="/"
                className="font-mono text-[9px] uppercase tracking-wider bg-ink text-bg px-4 py-2.5 hover:bg-accent hover:text-white transition-colors text-center cursor-pointer select-none flex items-center justify-center gap-1"
              >
                Go to Purifier Workspace
                <ChevronRight size={10} />
              </Link>
              <Link
                href="/c2pa-scanner"
                className="font-mono text-[9px] uppercase tracking-wider border border-ink bg-bg text-ink px-4 py-2.5 hover:bg-n100 transition-colors text-center cursor-pointer select-none flex items-center justify-center gap-1"
              >
                Go to C2PA Scanner
                <ChevronRight size={10} />
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-ink/15 mt-8">
            <SignOutButton>
              <button className="w-full flex items-center justify-center gap-2 border border-accent/20 text-accent font-mono text-[9px] uppercase tracking-widest py-2.5 hover:bg-accent hover:text-white transition-colors cursor-pointer select-none">
                <UserX size={10} />
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </aside>

        {/* Center column: Dashboard controls (Span 3) */}
        <div className="lg:col-span-3 p-8 md:p-10 select-none">
          <div className="flex items-center justify-between pb-4 border-b border-ink mb-8">
            <h2 className="font-serif text-3xl font-black text-ink uppercase tracking-tight">
              Dashboard
            </h2>
            <Link
              href="/"
              className="font-mono text-[9px] uppercase tracking-wider text-n500 hover:text-accent flex items-center gap-1.5"
            >
              <ArrowLeft size={10} />
              Return Home
            </Link>
          </div>

          {/* Real-time Dynamic Usage Limits Tracker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Card 1: Canvas Cleans */}
            <div className="border border-ink p-6 bg-bg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-n500">Purifier Processing</span>
                  <Eraser size={14} className="text-accent" />
                </div>
                <h4 className="font-serif text-lg font-bold text-ink uppercase tracking-tight mb-2">
                  Canvas Cleans Limit
                </h4>
                <p className="font-body text-[11px] text-n500 leading-normal mb-5">
                  Client-side metadata purifications processed in the current daily period.
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-serif text-2xl font-black text-ink">
                    {activeTier === "pro" ? "Unlimited" : `${cleanCount} / 5`}
                  </span>
                  {activeTier !== "pro" && (
                    <span className="font-mono text-[8px] text-n400 uppercase">
                      {5 - cleanCount} remaining today
                    </span>
                  )}
                </div>
                {activeTier !== "pro" ? (
                  <div className="w-full h-2 bg-n100 border border-ink/20 overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${cleanPercentage}%` }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-2 bg-green-800/10 border border-green-800/20 overflow-hidden">
                    <div className="h-full bg-green-800 w-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: C2PA Scans */}
            <div className="border border-ink p-6 bg-bg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-n500">C2PA Verification</span>
                  <ScanEye size={14} className="text-accent" />
                </div>
                <h4 className="font-serif text-lg font-bold text-ink uppercase tracking-tight mb-2">
                  C2PA Scans Limit
                </h4>
                <p className="font-body text-[11px] text-n500 leading-normal mb-5">
                  Client-side cryptographical signature audits executed today.
                </p>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-serif text-2xl font-black text-ink">
                    {activeTier === "pro" ? "Unlimited" : `${scanCount} / 5`}
                  </span>
                  {activeTier !== "pro" && (
                    <span className="font-mono text-[8px] text-n400 uppercase">
                      {5 - scanCount} remaining today
                    </span>
                  )}
                </div>
                {activeTier !== "pro" ? (
                  <div className="w-full h-2 bg-n100 border border-ink/20 overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${scanPercentage}%` }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-2 bg-green-800/10 border border-green-800/20 overflow-hidden">
                    <div className="h-full bg-green-800 w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clerk Account Management & Billing Portal */}
          <div className="border border-ink p-6 md:p-8 bg-n100">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-ink flex items-center justify-center bg-bg shrink-0">
                <CreditCard size={18} className="text-ink" />
              </div>
              <div className="flex-1">
                <div className="font-mono text-[9px] tracking-widest uppercase text-accent font-bold mb-1">
                  ✦ Unified User Settings
                </div>
                <h4 className="font-serif text-xl font-bold text-ink">
                  Billing, Security & Receipts Portal
                </h4>
                <p className="font-body text-xs text-n500 mt-2 mb-6 max-w-xl leading-relaxed">
                  ScrubAI routes all account credentials and subscription processes directly through secure Clerk modules. Open your account modal below to download invoices, check Stripe receipts, change billing cards, switch subscription tiers, configure MFA, or update profiles.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => openUserProfile()}
                    className="bg-ink text-bg border-2 border-ink px-6 py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ExternalLink size={12} />
                    Manage Account & Billing
                  </button>

                  {activeTier === "free" && (
                    <Link
                      href="/pricing"
                      className="bg-accent text-white border-2 border-accent px-6 py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-ink hover:border-ink hover:text-bg transition-colors flex items-center justify-center gap-1.5 shadow-sm text-center"
                    >
                      <Zap size={12} />
                      Upgrade To Premium Pro
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
