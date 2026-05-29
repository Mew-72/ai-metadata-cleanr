"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ChevronRight } from "lucide-react";
import { DOCS, DOC_CATEGORIES, type DocEntry } from "../../content/docs";

function matchesQuery(doc: DocEntry, q: string): boolean {
    if (!q) return true;
    const haystack = `${doc.title} ${doc.summary} ${doc.tags.join(" ")} ${doc.body}`.toLowerCase();
    // Multi-word AND search — every token must appear somewhere in the doc.
    return q
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
}

export default function DocsIndexPage() {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<DocEntry["category"] | "All">(
        "All",
    );

    const filtered = useMemo(() => {
        return DOCS.filter((d) => {
            if (activeCategory !== "All" && d.category !== activeCategory) return false;
            return matchesQuery(d, query.trim());
        });
    }, [query, activeCategory]);

    return (
        <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink bg-bg select-none">
            {/* Hero */}
            <section className="border-b-4 border-ink p-10 md:p-16 bg-bg">
                <div className="font-mono text-[10px] tracking-widest uppercase text-accent font-bold mb-3 flex items-center gap-1.5">
                    <span className="text-[6px]">●</span> ScrubAI Privacy Docs
                </div>
                <h1 className="font-serif text-[40px] md:text-[58px] font-black uppercase tracking-tight text-ink leading-[0.92] max-w-3xl">
                    Editorial briefings on metadata, reach, and the
                    <span className="text-accent"> annihilation pipeline.</span>
                </h1>
                <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-n500 mt-6 max-w-2xl">
                    Long-form pieces explaining how platforms suppress AI-tagged
                    content, why ScrubAI&apos;s canvas redraw works where tag-strippers
                    don&apos;t, and the platform-by-platform field manual for
                    creators who ship.
                </p>
            </section>

            {/* Search + filter rail */}
            <section className="border-b-4 border-ink bg-n100">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] divide-y md:divide-y-0 md:divide-x divide-ink">
                    <div className="p-6 md:p-8 flex flex-col gap-3 bg-bg">
                        <label
                            htmlFor="docs-search"
                            className="font-mono text-[9px] tracking-widest uppercase text-n500 font-bold"
                        >
                            Search the briefings
                        </label>
                        <div className="flex items-center gap-3 border-2 border-ink px-3 py-2.5 bg-bg focus-within:border-accent transition-colors">
                            <Search size={14} className="text-n500 shrink-0" />
                            <input
                                id="docs-search"
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Try: pinterest, c2pa, jumbf, watermark…"
                                className="flex-1 bg-transparent border-0 outline-none font-mono text-[12px] text-ink placeholder:text-n400 select-text"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="font-mono text-[9px] uppercase tracking-widest text-n500 hover:text-accent cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    CLEAR
                                </button>
                            )}
                        </div>
                        <div className="font-mono text-[8px] tracking-widest uppercase text-n400">
                            {filtered.length} of {DOCS.length} briefings · 100% client-side
                            search
                        </div>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col gap-3">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-n500 font-bold">
                            Filter by section
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {(["All", ...DOC_CATEGORIES] as const).map((cat) => {
                                const active = cat === activeCategory;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        aria-pressed={active}
                                        className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border-2 transition-colors cursor-pointer ${active
                                            ? "border-accent bg-accent text-white font-bold"
                                            : "border-ink/30 text-n500 hover:border-ink hover:text-ink"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Results */}
            <section className="border-b-4 border-ink">
                {filtered.length === 0 ? (
                    <div className="p-10 md:p-16 text-center bg-bg">
                        <BookOpen size={28} className="text-n400 mx-auto mb-4" />
                        <h2 className="font-serif text-2xl font-black text-ink uppercase tracking-tight mb-2">
                            No matching briefings
                        </h2>
                        <p className="font-body text-[13px] text-n500 max-w-md mx-auto">
                            Try a different keyword, or clear the filter to see all the
                            docs.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-ink bg-bg">
                        {filtered.map((doc) => (
                            <li key={doc.slug}>
                                <Link
                                    href={`/docs/${doc.slug}`}
                                    className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-6 md:p-8 hover:bg-n100 transition-colors group"
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-accent font-bold">
                                                {doc.category}
                                            </span>
                                            <span className="text-n400">·</span>
                                            <span className="font-mono text-[9px] uppercase tracking-widest text-n500">
                                                {doc.readMinutes} min read
                                            </span>
                                        </div>
                                        <h3 className="font-serif text-xl md:text-2xl font-black text-ink tracking-tight group-hover:text-accent transition-colors">
                                            {doc.title}
                                        </h3>
                                        <p className="font-body text-[13px] text-n500 leading-relaxed mt-2 max-w-2xl">
                                            {doc.summary}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-end font-mono text-[10px] uppercase tracking-widest text-n500 group-hover:text-accent transition-colors">
                                        Read briefing
                                        <ChevronRight size={14} className="ml-1" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}
