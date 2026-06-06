import React from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import {
    ShieldCheck,
    Lock,
    Layers,
    Fingerprint,
    ArrowRight,
    Mail,
    ExternalLink,
} from "lucide-react";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-bg text-ink">
            <Header />

            <main className="flex-1 w-full">
                {/* ── HERO ──────────────────────────────────────── */}
                <section className="hero-gradient">
                    <div className="max-w-[820px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 lg:pt-28 pb-12 lg:pb-16 text-center">
                        <div className="inline-flex items-center gap-2 rounded-full border border-muted-border bg-bg px-3 py-1 text-[12px] font-medium text-n600 mb-6">
                            <ShieldCheck size={12} className="text-accent" strokeWidth={2.5} />
                            About ScrubAI
                        </div>
                        <h1 className="font-sans text-[36px] sm:text-[44px] lg:text-[56px] font-semibold tracking-tight leading-[1.05] text-ink mb-6">
                            Local-first privacy tools{" "}
                            <span className="text-n400">for people who don't want their photos snitching on them.</span>
                        </h1>
                        <p className="font-sans text-[16px] lg:text-[17px] text-n500 leading-relaxed max-w-[640px] mx-auto">
                            ScrubAI is an independent project. We build software that strips
                            everything from your images that you didn't put there yourself -
                            EXIF, GPS, IPTC, XMP, and signed C2PA Content Credentials - entirely
                            inside your browser.
                        </p>
                    </div>
                </section>

                {/* ── WHY WE EXIST ─────────────────────────────── */}
                <section className="w-full bg-bg">
                    <div className="max-w-[820px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                        <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3">
                            Why we exist
                        </div>
                        <h2 className="font-sans text-[28px] lg:text-[36px] font-semibold tracking-tight text-ink mb-6">
                            Modern image files leak more than you think.
                        </h2>
                        <div className="space-y-5 font-sans text-[15px] lg:text-[16px] leading-relaxed text-n600">
                            <p>
                                Every photo your phone takes carries hidden passengers. GPS
                                coordinates from where it was shot. The exact camera model and
                                serial. Software fingerprints. Sometimes a thumbnail of an
                                earlier crop. Often a cryptographic chain that proves the file
                                came from an AI model.
                            </p>
                            <p>
                                Most of this data was added quietly, without anyone asking you.
                                And it travels - to social platforms that read it for their own
                                ranking, to anyone who downloads your file, to anyone who
                                inspects it later.
                            </p>
                            <p>
                                Stripping that data shouldn't require a desktop app, a paid
                                subscription, or a server upload. It should be instant, free
                                for the simple case, and never leave your device. So we built
                                ScrubAI.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── WHAT MAKES US DIFFERENT ──────────────────── */}
                <section className="w-full bg-surface border-y border-muted-border">
                    <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                        <div className="max-w-2xl mb-12">
                            <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3">
                                What makes ScrubAI different
                            </div>
                            <h2 className="font-sans text-[28px] lg:text-[36px] font-semibold tracking-tight text-ink mb-4">
                                Three things we do that most tools don't.
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[
                                {
                                    icon: Lock,
                                    title: "100% in your browser",
                                    body: "The canvas pipeline runs in your browser sandbox. Your image bytes don't go over the network. Not to us, not to anyone.",
                                    link: { href: "/docs/local-first-processing", label: "How local-first works" },
                                },
                                {
                                    icon: Layers,
                                    title: "Pixel redraw, not tag deletion",
                                    body: "Most cleaners only erase common headers. We rebuild the file from raw pixels, so deeper structures like JUMBF blocks vanish too.",
                                    link: { href: "/docs/pixel-redraw-technique", label: "The technique behind redraw" },
                                },
                                {
                                    icon: Fingerprint,
                                    title: "C2PA & 'Made with AI' tags",
                                    body: "Cryptographically signed Content Credentials embedded by Adobe, OpenAI, and Midjourney are removed at the source.",
                                    link: { href: "/docs/c2pa-explained", label: "What C2PA actually is" },
                                },
                            ].map((p) => (
                                <div key={p.title} className="card-soft p-6 flex flex-col">
                                    <span className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center mb-4">
                                        <p.icon size={18} strokeWidth={2} />
                                    </span>
                                    <h3 className="font-sans text-[16px] font-semibold tracking-tight text-ink mb-2">
                                        {p.title}
                                    </h3>
                                    <p className="font-sans text-[14px] leading-relaxed text-n500 mb-4">
                                        {p.body}
                                    </p>
                                    <Link
                                        href={p.link.href}
                                        className="mt-auto inline-flex items-center gap-1 font-sans text-[13px] font-medium text-accent hover:underline"
                                    >
                                        {p.link.label}
                                        <ArrowRight size={12} strokeWidth={2.5} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── PRINCIPLES ───────────────────────────────── */}
                <section className="w-full bg-bg">
                    <div className="max-w-[820px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                        <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3">
                            Our principles
                        </div>
                        <h2 className="font-sans text-[28px] lg:text-[36px] font-semibold tracking-tight text-ink mb-8">
                            The rules we hold ourselves to.
                        </h2>

                        <ul className="flex flex-col divide-y divide-muted-border border-y border-muted-border">
                            {[
                                {
                                    title: "Your image bytes never leave your device.",
                                    body: "Not to our servers. Not to a third party. Not for analytics. The canvas pipeline is local-only and that's a hard product invariant.",
                                },
                                {
                                    title: "No subscriptions. One-time payment.",
                                    body: "Lifetime Pro is paid once. We'd rather earn your trust than rent your attention.",
                                },
                                {
                                    title: "We track product usage, not your content.",
                                    body: "We use PostHog for UI events like 'pricing viewed' or 'checkout completed.' We never log filenames, image bytes, or extracted metadata.",
                                },
                                {
                                    title: "Open about what we do.",
                                    body: "Our processing approach is documented in our docs. Our privacy policy explains exactly what data exists and why.",
                                },
                                {
                                    title: "If we ever break these rules, we'll say so first.",
                                    body: "Any change that affects what data we touch ships with a public note. No silent updates to the privacy contract.",
                                },
                            ].map((rule) => (
                                <li key={rule.title} className="py-5">
                                    <div className="font-sans text-[16px] font-semibold text-ink mb-1.5">
                                        {rule.title}
                                    </div>
                                    <p className="font-sans text-[14.5px] leading-relaxed text-n600">
                                        {rule.body}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ── INDEPENDENTLY BUILT ─────────────────────── */}
                <section className="w-full bg-surface border-y border-muted-border">
                    <div className="max-w-[820px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                        <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3">
                            Built independently
                        </div>
                        <h2 className="font-sans text-[28px] lg:text-[36px] font-semibold tracking-tight text-ink mb-5">
                            No investors. No data brokers. No agenda.
                        </h2>
                        <p className="font-sans text-[15px] lg:text-[16px] leading-relaxed text-n600 mb-4">
                            ScrubAI is built and maintained independently. There's no
                            venture capital pushing for growth at the cost of the privacy
                            promise, and there's no one upstream getting access to your data
                            through us - because we don't have any of it ourselves.
                        </p>
                        <p className="font-sans text-[15px] lg:text-[16px] leading-relaxed text-n600">
                            That keeps us honest. The product can grow at the pace it
                            deserves to grow, and the moment something feels off you'll hear
                            from us first.
                        </p>
                    </div>
                </section>

                {/* ── TRUST STRIP ─────────────────────────────── */}
                <section className="w-full bg-bg">
                    <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                        <div className="font-sans text-[12px] uppercase tracking-wider text-accent mb-3 text-center">
                            Trust & transparency
                        </div>
                        <h2 className="font-sans text-[24px] lg:text-[32px] font-semibold tracking-tight text-ink text-center mb-10">
                            Read the fine print. We mean it.
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { href: "/privacy", label: "Privacy policy" },
                                { href: "/security", label: "Security policy" },
                                { href: "/terms", label: "Terms of service" },
                                { href: "/refund", label: "Refund policy" },
                                { href: "/cookies", label: "Cookie policy" },
                                { href: "/docs", label: "Privacy docs" },
                                { href: "/c2pa-scanner", label: "C2PA scanner" },
                                {
                                    href: "mailto:hello@scrubai.app",
                                    label: "Contact",
                                    external: true,
                                },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="card-soft px-4 py-3 flex items-center justify-between gap-2 font-sans text-[13px] font-medium text-ink"
                                >
                                    <span>{item.label}</span>
                                    {item.external ? (
                                        <Mail size={13} className="text-n400 shrink-0" />
                                    ) : (
                                        <ExternalLink size={13} className="text-n400 shrink-0" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ─────────────────────────────────────── */}
                <section className="w-full bg-bg">
                    <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20">
                        <div className="card-soft p-10 lg:p-14 text-center hero-gradient">
                            <h2 className="font-sans text-[26px] lg:text-[34px] font-semibold tracking-tight text-ink mb-3">
                                Try it. No account required.
                            </h2>
                            <p className="font-sans text-[15px] text-n500 max-w-xl mx-auto mb-8">
                                The simplest way to understand what ScrubAI does is to drop an
                                image into it. Five free cleans a day, no sign-up.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link href="/#workspace" className="btn-primary">
                                    Open the workspace
                                    <ArrowRight size={15} strokeWidth={2.2} />
                                </Link>
                                <Link href="/pricing" className="btn-secondary">
                                    See pricing
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
