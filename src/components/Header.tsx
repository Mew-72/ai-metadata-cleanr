"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { useAppAuth } from "../hooks/useAppAuth";
import { Sun, Moon, Menu, X, ShieldCheck } from "lucide-react";

const NAV_LINKS: { label: string; href: string; match?: (p: string) => boolean }[] = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing", match: (p) => p === "/pricing" },
  { label: "Docs", href: "/docs", match: (p) => p?.startsWith("/docs") ?? false },
  { label: "About", href: "/about", match: (p) => p === "/about" },
];

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAppAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem("scrubai-theme") as
      | "light"
      | "dark"
      | null;
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("scrubai-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-bg/80 backdrop-blur-xl transition-all duration-200 ${scrolled ? "border-b border-muted-border" : "border-b border-transparent"
        }`}
    >
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 select-none group"
        >
          <span className="w-7 h-7 rounded-lg bg-ink text-bg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <ShieldCheck size={15} strokeWidth={2.5} />
          </span>
          <span className="font-sans text-[15px] font-semibold tracking-tight text-ink">
            ScrubAI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.match
              ? link.match(pathname || "")
              : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${isActive
                    ? "text-ink bg-n100"
                    : "text-n500 hover:text-ink hover:bg-n100"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isSignedIn && (
            <Link
              href="/dashboard"
              className={`font-sans text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${pathname === "/dashboard"
                  ? "text-ink bg-n100"
                  : "text-n500 hover:text-ink hover:bg-n100"
                }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-md flex items-center justify-center text-n500 hover:text-ink hover:bg-n100 transition-colors cursor-pointer"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={15} strokeWidth={2} />
            ) : (
              <Sun size={15} strokeWidth={2} />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-md flex items-center justify-center text-n500 hover:text-ink hover:bg-n100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={15} strokeWidth={2} /> : <Menu size={15} strokeWidth={2} />}
          </button>

          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="hidden sm:inline-flex bg-ink text-bg rounded-md px-4 h-9 items-center font-sans text-[13px] font-medium hover:bg-accent transition-colors cursor-pointer">
                Sign in
              </button>
            </SignInButton>
          ) : (
            <div className="pl-1 sm:pl-2">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 rounded-full",
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-muted-border bg-bg w-full animate-fadeIn">
          <nav className="flex flex-col px-4 py-3 gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => {
              const isActive = link.match
                ? link.match(pathname || "")
                : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-sans text-[14px] font-medium px-3 py-2.5 rounded-md transition-colors ${isActive
                      ? "text-ink bg-n100"
                      : "text-n600 hover:text-ink hover:bg-n100"
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isSignedIn && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`font-sans text-[14px] font-medium px-3 py-2.5 rounded-md transition-colors ${pathname === "/dashboard"
                    ? "text-ink bg-n100"
                    : "text-n600 hover:text-ink hover:bg-n100"
                  }`}
              >
                Dashboard
              </Link>
            )}
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="mt-2 w-full bg-ink text-bg rounded-md py-2.5 font-sans text-[14px] font-medium hover:bg-accent transition-colors cursor-pointer">
                  Sign in
                </button>
              </SignInButton>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
