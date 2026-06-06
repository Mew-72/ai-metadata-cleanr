"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import { useAppAuth, useAppUser } from "../../hooks/useAppAuth";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import {
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Zap,
  ScanEye,
  Eraser,
  ExternalLink,
  LogOut,
  ArrowLeft,
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
  } catch {
    return 0;
  }
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
  } catch { }

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
  } catch { }

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
  } catch { }

  return Math.max(localCount, cookieCount);
};

export default function Dashboard() {
  const { user } = useAppUser();
  const { isPro } = useAppAuth();
  const { openUserProfile } = useClerk();

  const [cleanCount, setCleanCount] = useState(0);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    setCleanCount(getPersistedCleanCount());
    setScanCount(getPersistedC2paScanCount());
  }, []);

  useEffect(() => {
    posthog.capture("viewed_dashboard", { tier: isPro ? "pro" : "free" });
  }, [isPro]);

  const cleanPercentage = Math.min((cleanCount / 5) * 100, 100);
  const scanPercentage = Math.min((scanCount / 5) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-ink">
      <Header />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-sans text-[12.5px] text-n500 hover:text-ink transition-colors"
            >
              <ArrowLeft size={13} strokeWidth={2.2} />
              Back to workspace
            </Link>

            <div className="surface-card p-5 flex flex-col gap-4">
              <div>
                <div className="font-sans text-[11px] uppercase tracking-wider text-n500 font-medium mb-1.5">
                  Account
                </div>
                <div className="font-sans text-[13.5px] font-medium text-ink truncate">
                  {user?.primaryEmailAddress?.emailAddress || "—"}
                </div>
              </div>

              <div>
                <div className="font-sans text-[11px] uppercase tracking-wider text-n500 font-medium mb-1.5">
                  Plan
                </div>
                <span className={`pill ${isPro ? "pill-pro" : "pill-neutral"}`}>
                  {isPro ? "Lifetime Pro" : "Free"}
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-3 border-t border-muted-border">
                <Link href="/" className="btn-secondary w-full">
                  Open workspace
                  <ArrowRight size={13} strokeWidth={2.2} />
                </Link>
                <Link href="/c2pa-scanner" className="btn-secondary w-full">
                  C2PA scanner
                  <ArrowRight size={13} strokeWidth={2.2} />
                </Link>
              </div>
            </div>

            <SignOutButton>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-muted-border bg-surface px-3 py-2 font-sans text-[12.5px] font-medium text-n600 hover:text-danger hover:bg-danger-soft hover:border-danger/30 transition-colors cursor-pointer">
                <LogOut size={13} strokeWidth={2.2} />
                Sign out
              </button>
            </SignOutButton>
          </aside>

          {/* Body */}
          <div className="min-w-0">
            <header className="pb-6 mb-8 border-b border-muted-border">
              <h1 className="font-sans text-[34px] lg:text-[42px] font-semibold tracking-tight text-ink leading-[1.1] mb-2">
                Dashboard
              </h1>
              <p className="font-sans text-[14.5px] text-n500 leading-relaxed">
                Your usage today and account settings, all in one place.
              </p>
            </header>

            {/* Usage cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-8 lg:mb-10">
              <div className="surface-card p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[12px] uppercase tracking-wider text-n500 font-medium">
                    Image cleans
                  </span>
                  <span className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                    <Eraser size={15} strokeWidth={2} />
                  </span>
                </div>
                <h3 className="font-sans text-[16px] font-semibold text-ink mb-1">
                  Daily cleaner usage
                </h3>
                <p className="font-sans text-[13px] text-n500 leading-relaxed mb-5">
                  Local pixel-redraw operations executed today.
                </p>

                <div className="mt-auto">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-sans text-[26px] font-semibold tracking-tight text-ink">
                      {isPro ? "Unlimited" : `${cleanCount} / 5`}
                    </span>
                    {!isPro && (
                      <span className="font-sans text-[12px] text-n500">
                        {Math.max(0, 5 - cleanCount)} left today
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-n100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: isPro ? "100%" : `${cleanPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="surface-card p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[12px] uppercase tracking-wider text-n500 font-medium">
                    C2PA scans
                  </span>
                  <span className="w-9 h-9 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                    <ScanEye size={15} strokeWidth={2} />
                  </span>
                </div>
                <h3 className="font-sans text-[16px] font-semibold text-ink mb-1">
                  Daily scanner usage
                </h3>
                <p className="font-sans text-[13px] text-n500 leading-relaxed mb-5">
                  Cryptographic Content Credentials inspections today.
                </p>

                <div className="mt-auto">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-sans text-[26px] font-semibold tracking-tight text-ink">
                      {isPro ? "Unlimited" : `${scanCount} / 5`}
                    </span>
                    {!isPro && (
                      <span className="font-sans text-[12px] text-n500">
                        {Math.max(0, 5 - scanCount)} left today
                      </span>
                    )}
                  </div>
                  <div className="h-1.5 rounded-full bg-n100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-300"
                      style={{ width: isPro ? "100%" : `${scanPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account management */}
            <div className="surface-card p-6 lg:p-8 flex flex-col md:flex-row items-start gap-6">
              <span className="w-12 h-12 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                <CreditCard size={20} strokeWidth={2} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-[12px] uppercase tracking-wider text-accent font-medium mb-1">
                  Account &amp; security
                </div>
                <h3 className="font-sans text-[20px] font-semibold tracking-tight text-ink mb-2">
                  Manage your profile
                </h3>
                <p className="font-sans text-[14px] text-n500 leading-relaxed mb-5 max-w-2xl">
                  ScrubAI delegates auth and session management to Clerk. Open
                  the secure profile modal to update your email, configure MFA,
                  or revoke active sessions.
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button onClick={() => openUserProfile()} className="btn-primary">
                    <ExternalLink size={13} strokeWidth={2.2} />
                    Manage profile
                  </button>

                  {!isPro && (
                    <Link href="/pricing" className="btn-accent">
                      <Zap size={13} strokeWidth={2.2} />
                      Upgrade to Pro
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {!isPro && (
              <div className="surface-card mt-6 p-6 lg:p-8 flex flex-col md:flex-row items-start gap-6 hero-gradient">
                <span className="w-12 h-12 rounded-xl bg-ink text-bg flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-sans text-[20px] font-semibold tracking-tight text-ink mb-2">
                    Need more? One payment unlocks everything.
                  </h3>
                  <p className="font-sans text-[14px] text-n500 leading-relaxed mb-5 max-w-2xl">
                    Lifetime Pro removes the daily cap, opens up batches of 50
                    images, and includes every future tool we ship.
                  </p>
                  <Link href="/pricing" className="btn-accent">
                    See pricing
                    <ArrowRight size={13} strokeWidth={2.2} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
