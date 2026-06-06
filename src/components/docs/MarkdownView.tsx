"use client";

import React from "react";

/**
 * MarkdownView
 * ─────────────
 * Tiny zero-dependency Markdown renderer tuned for ScrubAI's docs.
 *
 * Supported syntax:
 *   # / ## / ### / #### headings
 *   Paragraphs (blank-line separated)
 *   - bullet lists
 *   1. ordered lists
 *   ``` fenced code blocks ```
 *   `inline code`
 *   **bold**, *italic*
 *   GitHub-style tables (| cell | cell |)
 *
 * Styled with the v2 Geist + slate aesthetic: soft cards, accent
 * borders, no all-caps display serifs.
 */

interface MarkdownViewProps {
    source: string;
}

type Block =
    | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
    | { kind: "paragraph"; text: string }
    | { kind: "ul"; items: string[] }
    | { kind: "ol"; items: string[] }
    | { kind: "code"; lang: string; text: string }
    | { kind: "table"; head: string[]; rows: string[][] };

function parseBlocks(src: string): Block[] {
    const lines = src.replace(/\r\n/g, "\n").split("\n");
    const out: Block[] = [];
    let i = 0;

    const isTableRow = (s: string) =>
        s.trim().startsWith("|") && s.trim().endsWith("|");

    while (i < lines.length) {
        const line = lines[i];

        if (!line.trim()) {
            i++;
            continue;
        }

        const fence = line.match(/^```(\w*)\s*$/);
        if (fence) {
            const lang = fence[1] || "";
            i++;
            const buf: string[] = [];
            while (i < lines.length && !/^```\s*$/.test(lines[i])) {
                buf.push(lines[i]);
                i++;
            }
            i++;
            out.push({ kind: "code", lang, text: buf.join("\n") });
            continue;
        }

        const heading = line.match(/^(#{1,4})\s+(.*)$/);
        if (heading) {
            const level = heading[1].length as 1 | 2 | 3 | 4;
            out.push({ kind: "heading", level, text: heading[2].trim() });
            i++;
            continue;
        }

        if (
            isTableRow(line) &&
            i + 1 < lines.length &&
            /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])
        ) {
            const head = line
                .trim()
                .replace(/^\||\|$/g, "")
                .split("|")
                .map((c) => c.trim());
            i += 2;
            const rows: string[][] = [];
            while (i < lines.length && isTableRow(lines[i])) {
                const cells = lines[i]
                    .trim()
                    .replace(/^\||\|$/g, "")
                    .split("|")
                    .map((c) => c.trim());
                rows.push(cells);
                i++;
            }
            out.push({ kind: "table", head, rows });
            continue;
        }

        if (/^\s*-\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*-\s+/, "").trim());
                i++;
            }
            out.push({ kind: "ul", items });
            continue;
        }

        if (/^\s*\d+\.\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*\d+\.\s+/, "").trim());
                i++;
            }
            out.push({ kind: "ol", items });
            continue;
        }

        const paraBuf: string[] = [line];
        i++;
        while (
            i < lines.length &&
            lines[i].trim() &&
            !/^#{1,4}\s+/.test(lines[i]) &&
            !/^\s*-\s+/.test(lines[i]) &&
            !/^\s*\d+\.\s+/.test(lines[i]) &&
            !/^```/.test(lines[i]) &&
            !isTableRow(lines[i])
        ) {
            paraBuf.push(lines[i]);
            i++;
        }
        out.push({ kind: "paragraph", text: paraBuf.join(" ") });
    }

    return out;
}

function renderInline(input: string, keyPrefix: string): React.ReactNode[] {
    const tokens: React.ReactNode[] = [];
    let i = 0;
    let key = 0;
    let buf = "";

    const flush = () => {
        if (buf) {
            tokens.push(buf);
            buf = "";
        }
    };

    while (i < input.length) {
        const ch = input[i];

        if (ch === "`") {
            const end = input.indexOf("`", i + 1);
            if (end > i) {
                flush();
                tokens.push(
                    <code
                        key={`${keyPrefix}-c-${key++}`}
                        className="font-mono text-[0.88em] bg-n100 border border-muted-border px-1.5 py-0.5 rounded"
                    >
                        {input.slice(i + 1, end)}
                    </code>,
                );
                i = end + 1;
                continue;
            }
        }

        if (ch === "*" && input[i + 1] === "*") {
            const end = input.indexOf("**", i + 2);
            if (end > i + 1) {
                flush();
                tokens.push(
                    <strong
                        key={`${keyPrefix}-b-${key++}`}
                        className="font-semibold text-ink"
                    >
                        {renderInline(input.slice(i + 2, end), `${keyPrefix}-b${key}`)}
                    </strong>,
                );
                i = end + 2;
                continue;
            }
        }

        if (ch === "*") {
            const end = input.indexOf("*", i + 1);
            if (end > i) {
                flush();
                tokens.push(
                    <em key={`${keyPrefix}-i-${key++}`} className="italic text-ink">
                        {renderInline(input.slice(i + 1, end), `${keyPrefix}-i${key}`)}
                    </em>,
                );
                i = end + 1;
                continue;
            }
        }

        buf += ch;
        i++;
    }

    flush();
    return tokens;
}

export function MarkdownView({ source }: MarkdownViewProps) {
    const blocks = parseBlocks(source);

    return (
        <div className="markdown-view font-sans text-[15px] leading-relaxed text-n600">
            {blocks.map((b, idx) => {
                switch (b.kind) {
                    case "heading": {
                        const sizes: Record<1 | 2 | 3 | 4, string> = {
                            1: "font-sans text-[28px] md:text-[32px] font-semibold tracking-tight text-ink mt-10 mb-4",
                            2: "font-sans text-[22px] md:text-[26px] font-semibold tracking-tight text-ink mt-10 mb-3",
                            3: "font-sans text-[18px] md:text-[20px] font-semibold tracking-tight text-ink mt-8 mb-2",
                            4: "font-sans text-[16px] font-semibold tracking-tight text-ink mt-6 mb-2",
                        };
                        const Tag = `h${b.level}` as "h1" | "h2" | "h3" | "h4";
                        return (
                            <Tag key={idx} className={sizes[b.level]}>
                                {renderInline(b.text, `h-${idx}`)}
                            </Tag>
                        );
                    }

                    case "paragraph":
                        return (
                            <p
                                key={idx}
                                className="my-4 text-[15px] leading-relaxed text-n600"
                            >
                                {renderInline(b.text, `p-${idx}`)}
                            </p>
                        );

                    case "ul":
                        return (
                            <ul
                                key={idx}
                                className="my-4 ml-1 pl-5 list-disc marker:text-accent space-y-1.5 text-[14.5px] text-n600 leading-relaxed"
                            >
                                {b.items.map((it, j) => (
                                    <li key={j}>{renderInline(it, `ul-${idx}-${j}`)}</li>
                                ))}
                            </ul>
                        );

                    case "ol":
                        return (
                            <ol
                                key={idx}
                                className="my-4 ml-1 pl-5 list-decimal marker:text-accent marker:font-medium space-y-1.5 text-[14.5px] text-n600 leading-relaxed"
                            >
                                {b.items.map((it, j) => (
                                    <li key={j}>{renderInline(it, `ol-${idx}-${j}`)}</li>
                                ))}
                            </ol>
                        );

                    case "code":
                        return (
                            <pre
                                key={idx}
                                className="my-5 p-4 rounded-xl border border-muted-border bg-n100 overflow-x-auto"
                                aria-label={b.lang ? `Code block (${b.lang})` : "Code block"}
                            >
                                <code className="font-mono text-[12.5px] leading-relaxed text-ink whitespace-pre">
                                    {b.text}
                                </code>
                            </pre>
                        );

                    case "table":
                        return (
                            <div
                                key={idx}
                                className="my-6 overflow-x-auto rounded-xl border border-muted-border"
                            >
                                <table className="w-full text-left border-collapse font-sans text-[13px]">
                                    <thead className="bg-surface border-b border-muted-border">
                                        <tr>
                                            {b.head.map((h, j) => (
                                                <th
                                                    key={j}
                                                    className="px-4 py-3 font-sans text-[12px] uppercase tracking-wider text-n500 font-medium"
                                                >
                                                    {renderInline(h, `th-${idx}-${j}`)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {b.rows.map((row, j) => (
                                            <tr
                                                key={j}
                                                className={`${j < b.rows.length - 1 ? "border-b border-muted-border" : ""} hover:bg-n100/40`}
                                            >
                                                {row.map((cell, k) => (
                                                    <td
                                                        key={k}
                                                        className="px-4 py-3 align-top text-n600"
                                                    >
                                                        {renderInline(cell, `td-${idx}-${j}-${k}`)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );

                    default:
                        return null;
                }
            })}
        </div>
    );
}
