"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { useAppAuth } from "../hooks/useAppAuth";
import { Sun, Moon } from "lucide-react";

const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const pathname = usePathname();
  const { isSignedIn } = useAppAuth();

  useEffect(() => {
    // Determine initial theme
    const savedTheme = localStorage.getItem("scrubai-theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("scrubai-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const todayString = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-50 bg-bg border-b-3 border-ink transition-colors duration-200 w-full">
      <div className="max-w-[1280px] mx-auto w-full border-x border-ink flex items-center justify-between px-8 h-14 gap-6 bg-bg">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-black tracking-tighter uppercase text-ink select-none decoration-none shrink-0">
          Scrub<span>AI</span>
          <span className="text-accent font-black font-sans">.</span>
        </Link>

        {/* Edition Badge */}
        <div className="hidden lg:block border border-ink px-3.5 py-1 font-mono text-[10px] font-medium tracking-widest uppercase text-n500 shrink-0 whitespace-nowrap">
          Vol. 1 &nbsp;|&nbsp; {todayString} &nbsp;|&nbsp; Local First Edition
        </div>

        {/* Navigation */}
        <nav className="flex gap-0 ml-auto h-full" aria-label="Main navigation">
          <Link
            href="/#features"
            className={`font-sans text-[11px] font-bold tracking-widest uppercase text-ink px-4.5 h-14 flex items-center border-l border-muted-border transition-colors hover:text-accent relative group shrink-0 ${
              pathname === "/#features" ? "text-accent" : ""
            }`}
          >
            Features
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-150" />
          </Link>
          <Link
            href="/pricing"
            className={`font-sans text-[11px] font-bold tracking-widest uppercase text-ink px-4.5 h-14 flex items-center border-l border-muted-border transition-colors hover:text-accent relative group shrink-0 ${
              pathname === "/pricing" ? "text-accent" : ""
            }`}
          >
            Pricing
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-150" />
          </Link>
          <Link
            href="/#faq"
            className={`font-sans text-[11px] font-bold tracking-widest uppercase text-ink px-4.5 h-14 flex items-center border-l border-muted-border transition-colors hover:text-accent relative group shrink-0 ${
              pathname === "/#faq" ? "text-accent" : ""
            }`}
          >
            FAQ
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-150" />
          </Link>
          <Link
            href="/c2pa-scanner"
            className={`font-sans text-[11px] font-bold tracking-widest uppercase text-ink px-4.5 h-14 flex items-center border-l border-muted-border transition-colors hover:text-accent relative group shrink-0 ${
              pathname === "/c2pa-scanner" ? "text-accent" : ""
            }`}
          >
            C2PA Scanner
            <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-150" />
          </Link>

          {isSignedIn && (
            <Link
              href="/dashboard"
              className={`font-sans text-[11px] font-bold tracking-widest uppercase text-ink px-4.5 h-14 flex items-center border-l border-muted-border border-r transition-colors hover:text-accent relative group shrink-0 ${
                pathname === "/dashboard" ? "text-accent" : ""
              }`}
            >
              Dashboard
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-150" />
            </Link>
          )}
        </nav>

        {/* Action Row */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 border border-ink flex items-center justify-center text-ink hover:bg-ink hover:text-bg transition-all cursor-pointer select-none"
            title="Toggle Theme"
          >
            {theme === "light" ? <Moon size={14} className="stroke-[2.5px]" /> : <Sun size={14} className="stroke-[2.5px]" />}
          </button>

          {/* Clerk Auth Gating */}
          {!isSignedIn ? (
            hasClerkKey ? (
              <SignInButton mode="modal">
                <button className="bg-ink text-bg border-2 border-ink px-5.5 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-all duration-150 h-9 flex items-center">
                  Log In
                </button>
              </SignInButton>
            ) : (
              <button 
                onClick={() => alert("MVP mode: Auto-logged in.")}
                className="bg-ink text-bg border-2 border-ink px-5.5 font-sans text-[11px] font-bold tracking-widest uppercase cursor-pointer hover:bg-accent hover:border-accent transition-all duration-150 h-9 flex items-center"
              >
                Log In
              </button>
            )
          ) : (
            <div className="flex items-center gap-2 border-l border-muted-border pl-3">
              {hasClerkKey ? (
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-none border border-ink",
                    },
                  }}
                />
              ) : (
                <div 
                  className="w-8 h-8 border border-ink bg-ink text-bg flex items-center justify-center font-mono text-[10px] font-bold uppercase select-none cursor-help"
                  title="MVP Simulated Session: mvp-test@scrubai.com"
                >
                  M
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
