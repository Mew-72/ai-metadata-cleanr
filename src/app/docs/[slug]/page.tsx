import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Clock } from "lucide-react";
import { DOCS, getDoc } from "../../../content/docs";
import { MarkdownView } from "../../../components/docs/MarkdownView";

interface DocPageProps {
    params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
    return DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
    params,
}: DocPageProps): Promise<Metadata> {
    const { slug } = await params;
    const doc = getDoc(slug);
    if (!doc) return { title: "Not Found" };
    return {
        title: doc.title,
        description: doc.summary,
    };
}

export default async function DocPage({ params }: DocPageProps) {
    const { slug } = await params;
    const doc = getDoc(slug);
    if (!doc) notFound();

    const idx = DOCS.findIndex((d) => d.slug === slug);
    const prev = idx > 0 ? DOCS[idx - 1] : null;
    const next = idx >= 0 && idx < DOCS.length - 1 ? DOCS[idx + 1] : null;

    return (
        <main className="flex-1 max-w-[1280px] w-full mx-auto border-x border-ink bg-bg">
            <article className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] divide-y lg:divide-y-0 lg:divide-x divide-ink">
                {/* Sidebar with the full doc list */}
                <aside className="p-6 md:p-8 bg-n100 select-none">
                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-n500 hover:text-accent transition-colors"
                    >
                        <ArrowLeft size={10} />
                        All briefings
                    </Link>
                    <div className="font-mono text-[10px] tracking-widest uppercase text-accent font-bold mt-6 mb-3 pb-2 border-b border-ink">
                        ✦ All Briefings
                    </div>
                    <ul className="flex flex-col gap-1">
                        {DOCS.map((d) => {
                            const active = d.slug === slug;
                            return (
                                <li key={d.slug}>
                                    <Link
                                        href={`/docs/${d.slug}`}
                                        aria-current={active ? "page" : undefined}
                                        className={`block px-3 py-2 text-[12px] font-sans border-l-2 transition-colors select-none ${active
                                                ? "border-accent bg-bg text-ink font-bold"
                                                : "border-transparent text-n500 hover:border-ink hover:text-ink hover:bg-bg"
                                            }`}
                                    >
                                        <span className="block font-mono text-[8px] uppercase tracking-widest text-n400 mb-0.5">
                                            {d.category}
                                        </span>
                                        {d.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                {/* Article body */}
                <div className="p-8 md:p-14 max-w-3xl bg-bg">
                    <header className="mb-8 pb-6 border-b-2 border-ink">
                        <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] uppercase tracking-widest text-n500 mb-4">
                            <span className="text-accent font-bold">{doc.category}</span>
                            <span className="text-n400">·</span>
                            <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {doc.readMinutes} min read
                            </span>
                        </div>
                        <h1 className="font-serif text-3xl md:text-5xl font-black uppercase tracking-tight text-ink leading-[0.95]">
                            {doc.title}
                        </h1>
                        <p className="font-body text-[14px] text-n500 leading-relaxed mt-4 max-w-2xl">
                            {doc.summary}
                        </p>
                    </header>

                    <MarkdownView source={doc.body} />

                    {/* Prev/Next nav */}
                    <nav
                        className="mt-12 pt-6 border-t-2 border-ink grid grid-cols-1 md:grid-cols-2 gap-3"
                        aria-label="Doc navigation"
                    >
                        {prev ? (
                            <Link
                                href={`/docs/${prev.slug}`}
                                className="group border-2 border-ink p-4 hover:bg-n100 transition-colors"
                            >
                                <span className="font-mono text-[9px] tracking-widest uppercase text-n500 flex items-center gap-1">
                                    <ArrowLeft size={10} /> Previous
                                </span>
                                <span className="font-serif text-sm font-bold text-ink mt-1 block group-hover:text-accent transition-colors">
                                    {prev.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                        {next ? (
                            <Link
                                href={`/docs/${next.slug}`}
                                className="group border-2 border-ink p-4 hover:bg-n100 transition-colors text-right"
                            >
                                <span className="font-mono text-[9px] tracking-widest uppercase text-n500 flex items-center justify-end gap-1">
                                    Next <ChevronRight size={10} />
                                </span>
                                <span className="font-serif text-sm font-bold text-ink mt-1 block group-hover:text-accent transition-colors">
                                    {next.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                </div>
            </article>
        </main>
    );
}
