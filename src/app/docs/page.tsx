"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, BookOpen, ArrowRight, Clock } from "lucide-react";
import { DOCS, DOC_CATEGORIES, type DocEntry } from "../../content/docs";

function matchesQuery(doc: DocEntry, q: string): boolean {
    if (!q) return true;
    const haystack =
        `${doc.title} ${doc.summary} ${doc.tags.join(" ")} ${doc.body}`.toLowerCase();
    return q
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
}

export default function DocsIndexPage() {
    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<
        DocEntry["category"] | "All"
    >("All");

    const filtered = useMemo(() => {
        return DOCS.filter((d) => {
            if (activeCategory !== "All" && d.category !== activeCategory) return false;
            return matchesQuery(d, query.trim());
        });
    }, [query, activeCategory]);

    return (
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            {/* Hero */}
            <section className="mb-10 lg:mb-12">
                <div className="font-sans text-[12px] uppercase tracking-wider text-accent font-medium mb-3">
                    ScrubAI privacy docs
                </div>
                <h1 className="font-sans text-[34px] md:text-[44px] lg:text-[52px] font-semibold tracking-tight text-ink leading-[1.05] mb-4 max-w-3xl">
                    Guides on metadata, reach, and the cleaning pipeline.
                </h1>
                <p className="font-sans text-[15px] lg:text-[16px] text-n500 leading-relaxed max-w-2xl">
                    Long-form pieces on how platforms suppress AI-tagged content, why
                    ScrubAI&apos;s canvas redraw works where tag-strippers don&apos;t,
                    and the platform-by-platform field manual for creators who ship.
                </p>
            </section>

            {/* Filter bar */}
            <section className="surface-card p-5 lg:p-6 mb-8 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 rounded-lg border border-muted-border bg-bg px-3.5 py-2.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/15 transition-all">
                    <Search size={15} className="text-n400 shrink-0" strokeWidth={2.2} />
                    <input
                        id="docs-search"
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search: pinterest, c2pa, jumbf, watermark…"
                        className="flex-1 bg-transparent border-0 outline-none font-sans text-[14px] text-ink placeholder:text-n400 select-text"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="font-sans text-[12px] text-n500 hover:text-ink rounded-md px-2 py-0.5 hover:bg-n100 cursor-pointer"
                            aria-label="Clear search"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                        {(["All", ...DOC_CATEGORIES] as const).map((cat) => {
                            const active = cat === activeCategory;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    aria-pressed={active}
                                    className={`font-sans text-[12.5px] font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer ${active
                                            ? "bg-ink text-bg"
                                            : "bg-n100 text-n600 hover:bg-n200 hover:text-ink"
                                        }`}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>

                    <div className="sm:ml-auto font-sans text-[12px] text-n500">
                        {filtered.length} of {DOCS.length} guides · search runs locally
                    </div>
                </div>
            </section>

            {/* Results */}
            <section>
                {filtered.length === 0 ? (
                    <div className="surface-card py-16 text-center">
                        <BookOpen
                            size={24}
                            className="text-n400 mx-auto mb-3"
                            strokeWidth={2}
                        />
                        <h2 className="font-sans text-[20px] font-semibold tracking-tight text-ink mb-1">
                            No matching guides
                        </h2>
                        <p className="font-sans text-[13.5px] text-n500 max-w-md mx-auto">
                            Try a different keyword, or clear the filter to see everything.
                        </p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
                        {filtered.map((doc) => (
                            <li key={doc.slug}>
                                <Link
                                    href={`/docs/${doc.slug}`}
                                    className="card-soft block p-6 group h-full"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="font-sans text-[12px] uppercase tracking-wider text-accent font-medium">
                                            {doc.category}
                                        </span>
                                        <span className="text-n300">·</span>
                                        <span className="inline-flex items-center gap-1 font-sans text-[12px] text-n500">
                                            <Clock size={11} strokeWidth={2.2} />
                                            {doc.readMinutes} min read
                                        </span>
                                    </div>

                                    <h3 className="font-sans text-[18px] lg:text-[20px] font-semibold text-ink tracking-tight group-hover:text-accent transition-colors mb-2">
                                        {doc.title}
                                    </h3>
                                    <p className="font-sans text-[13.5px] text-n500 leading-relaxed mb-4">
                                        {doc.summary}
                                    </p>

                                    <div className="inline-flex items-center gap-1 font-sans text-[12.5px] font-medium text-accent">
                                        Read guide
                                        <ArrowRight
                                            size={12}
                                            strokeWidth={2.4}
                                            className="group-hover:translate-x-0.5 transition-transform"
                                        />
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
