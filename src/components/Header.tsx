"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { useAppAuth } from "../hooks/useAppAuth";
import { Sun, Moon, Menu, X, ShieldCheck, ChevronDown } from "lucide-react";

const NAV_LINKS: { label: string; href: string; match?: (p: string) => boolean }[] = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing", match: (p) => p === "/pricing" },
  { label: "Docs", href: "/docs", match: (p) => p?.startsWith("/docs") ?? false },
  { label: "About", href: "/about", match: (p) => p === "/about" },
];

const TOOLS_LINKS = [
  { label: "Metadata Remover", href: "/", desc: "Strip EXIF, GPS, XMP, C2PA" },
  { label: "C2PA Scanner", href: "/c2pa-scanner", desc: "Verify Content Credentials" },
];

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

          {/* Tools dropdown — links always in DOM for crawlers */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsOpen((v) => !v)}
              aria-expanded={toolsOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1 font-sans text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                pathname === "/" || pathname === "/c2pa-scanner"
                  ? "text-ink bg-n100"
                  : "text-n500 hover:text-ink hover:bg-n100"
              }`}
            >
              Tools
              <ChevronDown
                size={12}
                strokeWidth={2.2}
                className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute left-0 top-full mt-1 w-52 rounded-xl border border-muted-border bg-bg shadow-lg overflow-hidden transition-all duration-150 ${
                toolsOpen ? "opacity-100 pointer-events-auto translate-y-0" : "opacity-0 pointer-events-none -translate-y-1"
              }`}
              role="menu"
            >
              {TOOLS_LINKS.map((t) => (
                <a
                  key={t.href}
                  href={t.href}
                  role="menuitem"
                  onClick={() => setToolsOpen(false)}
                  className="block px-4 py-3 hover:bg-n100 transition-colors border-b last:border-b-0 border-muted-border"
                >
                  <div className="font-sans text-[13px] font-medium text-ink">{t.label}</div>
                  <div className="font-sans text-[11.5px] text-n500 mt-0.5">{t.desc}</div>
                </a>
              ))}
            </div>
          </div>

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
          {/*
            Translation-volatile: the icon and title swap on every theme
            change, so a translation engine that re-parents this node makes
            the next reconciliation throw. Opted out with the modern
            attribute plus the legacy class.
          */}
          <button
            onClick={toggleTheme}
            translate="no"
            className="notranslate w-9 h-9 rounded-md flex items-center justify-center text-n500 hover:text-ink hover:bg-n100 transition-colors cursor-pointer"
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

          {/*
            Translation-volatile: this region swaps between SignInButton and
            UserButton when Clerk auth state resolves. Each branch is the
            node React inserts or removes, so each branch carries the opt-out
            itself and stays a direct child of this actions row. That keeps
            the node React holds a reference to identical to the node in the
            DOM, whatever the translation engine did around it.
          */}
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button
                translate="no"
                className="notranslate hidden sm:inline-flex bg-ink text-bg rounded-md px-4 h-9 items-center font-sans text-[13px] font-medium hover:bg-accent transition-colors cursor-pointer"
              >
                Sign in
              </button>
            </SignInButton>
          ) : (
            <div translate="no" className="notranslate pl-1 sm:pl-2">
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
      {/*
        Translation-volatile: the drawer mounts and unmounts, and its contents
        change with auth state. Opting out the whole container keeps every node
        inside it React-owned.
      */}
      {mobileMenuOpen && (
        <div
          translate="no"
          className="notranslate md:hidden border-t border-muted-border bg-bg w-full animate-fadeIn"
        >
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
            {/* Tools links — always present for crawlability */}
            <div className="mt-1 mb-0.5 px-3 pt-2 pb-1 font-sans text-[11px] uppercase tracking-wider text-n400 font-medium">
              Tools
            </div>
            {TOOLS_LINKS.map((t) => (
              <a
                key={t.href}
                href={t.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-sans text-[14px] font-medium px-3 py-2.5 rounded-md transition-colors ${
                  pathname === t.href
                    ? "text-ink bg-n100"
                    : "text-n600 hover:text-ink hover:bg-n100"
                }`}
              >
                {t.label}
              </a>
            ))}
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
