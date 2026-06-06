"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calendar, ShieldCheck } from "lucide-react";

/**
 * Shared shell for legal pages (privacy, terms, cookies, security, refund).
 * Provides a sticky sidebar of related policies and a consistent header.
 *
 * Children are the body content of the policy and are rendered inside a
 * prose-friendly container.
 */

interface LegalLayoutProps {
    title: string;
    subtitle?: string;
    lastUpdated: string;
    children: React.ReactNode;
}

const LEGAL_LINKS: { href: string; label: string }[] = [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookies" },
    { href: "/security", label: "Security" },
    { href: "/refund", label: "Refund" },
];

export function LegalLayout({
    title,
    subtitle,
    lastUpdated,
    children,
}: LegalLayoutProps) {
    const pathname = usePathname();

    return (
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
                {/* Sidebar */}
                <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-5">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 font-sans text-[12.5px] text-n500 hover:text-ink transition-colors"
                    >
                        <ArrowLeft size={13} strokeWidth={2.2} />
                        Back to workspace
                    </Link>

                    <div className="surface-card p-5">
                        <div className="font-sans text-[11px] uppercase tracking-wider text-n500 font-medium mb-3 pb-2.5 border-b border-muted-border">
                            Legal
                        </div>
                        <ul className="flex flex-col gap-0.5">
                            {LEGAL_LINKS.map((link) => {
                                const active = pathname === link.href;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className={`block rounded-md px-3 py-2 font-sans text-[13px] transition-colors ${active
                                                    ? "bg-accent-soft text-accent font-medium"
                                                    : "text-n600 hover:bg-n100 hover:text-ink"
                                                }`}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-muted-border bg-surface px-4 py-3 flex items-start gap-2.5">
                        <ShieldCheck
                            size={14}
                            className="text-accent shrink-0 mt-0.5"
                            strokeWidth={2.2}
                        />
                        <p className="font-sans text-[12px] text-n600 leading-relaxed">
                            All ScrubAI processing runs in your browser. Image bytes never reach our servers.
                        </p>
                    </div>
                </aside>

                {/* Body */}
                <div className="min-w-0">
                    <header className="pb-6 mb-8 border-b border-muted-border">
                        <div className="flex items-center gap-2 font-sans text-[12px] text-n500 mb-3">
                            <Calendar size={12} strokeWidth={2.2} />
                            <span>Last updated · {lastUpdated}</span>
                        </div>
                        <h1 className="font-sans text-[34px] lg:text-[44px] font-semibold tracking-tight text-ink leading-[1.1] mb-3">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="font-sans text-[14.5px] text-n500 leading-relaxed max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </header>

                    <div className="legal-prose">{children}</div>
                </div>
            </div>
        </main>
    );
}
