import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
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
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
                {/* Sidebar */}
                <aside className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-5">
                    <Link
                        href="/docs"
                        className="inline-flex items-center gap-1.5 font-sans text-[12.5px] text-n500 hover:text-ink transition-colors"
                    >
                        <ArrowLeft size={13} strokeWidth={2.2} />
                        All guides
                    </Link>

                    <div className="surface-card p-4">
                        <div className="font-sans text-[11px] uppercase tracking-wider text-n500 font-medium mb-3 px-2">
                            Privacy guides
                        </div>
                        <ul className="flex flex-col gap-0.5">
                            {DOCS.map((d) => {
                                const active = d.slug === slug;
                                return (
                                    <li key={d.slug}>
                                        <Link
                                            href={`/docs/${d.slug}`}
                                            aria-current={active ? "page" : undefined}
                                            className={`block rounded-md px-3 py-2.5 transition-colors ${active
                                                    ? "bg-accent-soft text-accent"
                                                    : "text-n600 hover:bg-n100 hover:text-ink"
                                                }`}
                                        >
                                            <span
                                                className={`block font-sans text-[10.5px] uppercase tracking-wider mb-0.5 ${active ? "text-accent" : "text-n400"
                                                    }`}
                                            >
                                                {d.category}
                                            </span>
                                            <span
                                                className={`block font-sans text-[13px] ${active ? "font-semibold" : "font-medium"
                                                    }`}
                                            >
                                                {d.title}
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                {/* Article body */}
                <article className="min-w-0 max-w-3xl">
                    <header className="mb-8 pb-6 border-b border-muted-border">
                        <div className="flex flex-wrap items-center gap-2 font-sans text-[12px] text-n500 mb-4">
                            <span className="font-medium text-accent uppercase tracking-wider">
                                {doc.category}
                            </span>
                            <span className="text-n300">·</span>
                            <span className="inline-flex items-center gap-1">
                                <Clock size={11} strokeWidth={2.2} />
                                {doc.readMinutes} min read
                            </span>
                        </div>
                        <h1 className="font-sans text-[32px] md:text-[44px] font-semibold tracking-tight text-ink leading-[1.1] mb-3">
                            {doc.title}
                        </h1>
                        <p className="font-sans text-[15px] text-n500 leading-relaxed max-w-2xl">
                            {doc.summary}
                        </p>
                    </header>

                    <MarkdownView source={doc.body} />

                    <nav
                        className="mt-12 pt-6 border-t border-muted-border grid grid-cols-1 md:grid-cols-2 gap-3"
                        aria-label="Doc navigation"
                    >
                        {prev ? (
                            <Link
                                href={`/docs/${prev.slug}`}
                                className="card-soft p-5 group"
                            >
                                <span className="inline-flex items-center gap-1.5 font-sans text-[12px] text-n500">
                                    <ArrowLeft size={12} strokeWidth={2.2} />
                                    Previous
                                </span>
                                <span className="block font-sans text-[15px] font-semibold text-ink mt-1.5 group-hover:text-accent transition-colors">
                                    {prev.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                        {next ? (
                            <Link
                                href={`/docs/${next.slug}`}
                                className="card-soft p-5 group text-right"
                            >
                                <span className="inline-flex items-center justify-end gap-1.5 font-sans text-[12px] text-n500 w-full">
                                    Next
                                    <ArrowRight size={12} strokeWidth={2.2} />
                                </span>
                                <span className="block font-sans text-[15px] font-semibold text-ink mt-1.5 group-hover:text-accent transition-colors">
                                    {next.title}
                                </span>
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                </article>
            </div>
        </main>
    );
}
