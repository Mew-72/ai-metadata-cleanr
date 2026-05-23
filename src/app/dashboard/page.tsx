"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { useAppAuth, useAppUser } from "../../hooks/useAppAuth";

const hasClerkKey = false;

import { Ticker } from "../../components/Ticker";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { 
  ShieldCheck, 
  Database, 
  History, 
  CreditCard, 
  User, 
  ArrowLeft,
  Sparkles,
  Zap,
  UserX
} from "lucide-react";
import posthog from "posthog-js";

interface BatchHistoryItem {
  id: string;
  date: string;
  filesCount: number;
  sizeSaved: string;
  status: string;
}

export default function Dashboard() {
  const { user } = useAppUser();
  const { has } = useAppAuth();
  
  const isPro = 
    user?.publicMetadata?.tier === "pro" || 
    user?.publicMetadata?.role === "pro" ||
    (has ? has({ role: "pro" }) || has({ permission: "org:pro:access" }) : false);

  const [activeTier, setActiveTier] = useState<"free" | "pro">("free");

  useEffect(() => {
    if (isPro) {
      setActiveTier("pro");
    } else {
      setActiveTier("free");
    }
  }, [isPro]);

  // Log PostHog dashboard visit
  useEffect(() => {
    posthog.capture("viewed_dashboard", { tier: activeTier });
  }, [activeTier]);

  const [history] = useState<BatchHistoryItem[]>([
    { id: "b1", date: "2026-05-20", filesCount: 12, sizeSaved: "3.4 MB", status: "Done" },
    { id: "b2", date: "2026-05-18", filesCount: 3, sizeSaved: "920 KB", status: "Done" },
    { id: "b3", date: "2026-05-15", filesCount: 22, sizeSaved: "7.8 MB", status: "Done" },
    { id: "b4", date: "2026-05-10", filesCount: 1, sizeSaved: "145 KB", status: "Done" },
  ]);

  const handleSimulateUpgrade = () => {
    setActiveTier("pro");
    posthog.capture("user_upgraded", { tier: "pro", simulated: true, location: "dashboard" });
    alert("✓ Subscription simulated! Pro features are now unlocked.");
  };

  const handleSimulateCancel = () => {
    setActiveTier("free");
    posthog.capture("user_downgraded", { tier: "free", simulated: true });
    alert("✓ Subscription cancelled. Reverted back to free tier.");
  };

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
              <div className={`text-[9px] font-mono px-2.5 py-0.5 border border-ink self-start inline-block ${
                activeTier === "pro" ? "bg-accent text-white" : "bg-bg text-ink"
              }`}>
                {activeTier === "pro" ? "PRO MEMBER" : "FREE PLAN"}
              </div>
            </div>

            <hr className="border-t border-ink/15 my-6" />

            <div className="flex flex-col gap-2">
              <Link
                href="/#workspace"
                className="font-mono text-[9px] uppercase tracking-wider bg-ink text-bg px-4 py-2.5 hover:bg-accent hover:text-white transition-colors text-center cursor-pointer select-none"
              >
                Go to Sanitizer Workspace
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-ink/15 mt-8">
            {hasClerkKey ? (
              <SignOutButton>
                <button className="w-full flex items-center justify-center gap-2 border border-accent/20 text-accent font-mono text-[9px] uppercase tracking-widest py-2.5 hover:bg-accent hover:text-white transition-colors cursor-pointer select-none">
                  <UserX size={10} />
                  Sign Out
                </button>
              </SignOutButton>
            ) : (
              <button 
                onClick={() => alert("MVP mode: Simulated session cannot sign out.")}
                className="w-full flex items-center justify-center gap-2 border border-accent/20 text-accent font-mono text-[9px] uppercase tracking-widest py-2.5 hover:bg-accent hover:text-white transition-colors cursor-pointer select-none"
              >
                <UserX size={10} />
                Sign Out
              </button>
            )}
          </div>
        </aside>

        {/* Center column: Dashboard controls & statistics (Span 3) */}
        <div className="lg:col-span-3 p-8 md:p-10 select-none">
          <div className="flex items-center justify-between pb-4 border-b border-ink mb-8">
            <h2 className="font-serif text-3xl font-black text-ink uppercase tracking-tight">
              ScrubAI Profile Dashboard
            </h2>
            <Link
              href="/"
              className="font-mono text-[9px] uppercase tracking-wider text-n500 hover:text-accent flex items-center gap-1.5"
            >
              <ArrowLeft size={10} />
              Return Home
            </Link>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="border border-ink p-5 bg-bg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-n500">Purified Batches</span>
                <History size={14} className="text-accent" />
              </div>
              <div>
                <div className="font-serif text-3xl font-black text-ink">38</div>
                <span className="font-mono text-[8px] text-accent uppercase font-bold mt-1 block">▲ +4 this week</span>
              </div>
            </div>

            <div className="border border-ink p-5 bg-bg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-n500">Data Weight Purged</span>
                <Database size={14} className="text-accent" />
              </div>
              <div>
                <div className="font-serif text-3xl font-black text-ink">12.26 MB</div>
                <span className="font-mono text-[8px] text-accent uppercase font-bold mt-1 block">▲ Wiped permanently</span>
              </div>
            </div>

            <div className="border border-ink p-5 bg-bg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] uppercase tracking-widest text-n500">Average Sanitization</span>
                <ShieldCheck size={14} className="text-accent" />
              </div>
              <div>
                <div className="font-serif text-3xl font-black text-ink">100%</div>
                <span className="font-mono text-[8px] text-accent uppercase font-bold mt-1 block">✓ Complete Header Wipe</span>
              </div>
            </div>
          </div>

          {/* Clerk Billing Stripe Integration panel */}
          <div className="border border-ink p-6 md:p-8 bg-n100 mb-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 border border-ink flex items-center justify-center bg-bg">
                <CreditCard size={18} className="text-ink" />
              </div>
              <div className="flex-1">
                <div className="font-mono text-[9px] tracking-widest uppercase text-accent font-bold mb-1">
                  ✦ Subscription Management
                </div>
                <h4 className="font-serif text-xl font-bold text-ink">
                  Manage Subscription & Billing
                </h4>
                <p className="font-body text-xs text-n500 mt-2 mb-6 max-w-xl leading-relaxed">
                  Update your billing details, modify your plan, check your billing history, or view your receipts and invoices securely.
                </p>

                {activeTier === "free" ? (
                  <div className="bg-bg border border-ink p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-3">
                      <Zap size={18} className="text-accent shrink-0 mt-0.5" />
                      <div>
                        <div className="font-sans text-xs font-bold text-ink">Upgrade to Pro Batch Plan</div>
                        <div className="font-mono text-[9px] text-n500 mt-0.5">
                          Unlocks up to 50 concurrent image cleans, JSZip exports, and priority local queues.
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={handleSimulateUpgrade}
                      className="bg-ink text-bg px-6 py-2.5 font-sans text-[10px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:text-white transition-colors shrink-0"
                    >
                      Unlock Pro — $5/mo
                    </button>
                  </div>
                ) : (
                  <div className="bg-bg border border-accent p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-start gap-3">
                      <Sparkles size={18} className="text-accent shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <div className="font-sans text-xs font-bold text-accent">Pro Plan Currently Active</div>
                        <div className="font-mono text-[9px] text-n500 mt-0.5">
                          Your Pro subscription is fully active. You have full access to unlimited batch image processing and high-performance queues.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <button 
                        onClick={handleSimulateCancel}
                        className="font-mono text-[9px] uppercase tracking-wider text-accent border border-accent/20 px-4 py-2 hover:bg-accent hover:text-white transition-colors cursor-pointer select-none"
                      >
                        Cancel Plan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Batch History logs table */}
          <div>
            <h3 className="font-serif text-xl font-bold text-ink mb-4 pb-2 border-b border-muted-border">
              Offline Purification Batch History
            </h3>
            
            <div className="border border-ink bg-bg overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-[10px]">
                <thead>
                  <tr className="bg-n100 border-b border-ink font-bold uppercase tracking-wider text-n500">
                    <th className="p-3">Batch ID</th>
                    <th className="p-3">Completion Date</th>
                    <th className="p-3 text-center">Files Cleaned</th>
                    <th className="p-3 text-right">Data Saved</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted-border">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-n100/50">
                      <td className="p-3 font-bold text-ink">#{item.id}</td>
                      <td className="p-3 text-n500">{item.date}</td>
                      <td className="p-3 text-center text-ink font-bold">{item.filesCount}</td>
                      <td className="p-3 text-right font-bold text-ink">{item.sizeSaved}</td>
                      <td className="p-3 text-center">
                        <span className="bg-green-800/10 border border-green-800 text-green-800 text-[8px] font-bold px-1.5 py-0.5">
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
